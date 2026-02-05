import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription } = await req.json();

    if (!jobDescription) {
      return new Response(
        JSON.stringify({ error: "Job description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (!AI_API_KEY) {
      throw new Error("AI_API_KEY is not configured");
    }

    const systemPrompt = `Analyze the following job description and extract ATS-critical data.

Return output strictly in JSON format with:
- job_title: The job title
- required_skills: Array of required technical skills
- preferred_skills: Array of nice-to-have skills  
- tools: Array of tools & technologies
- soft_skills: Array of soft skills
- experience_level: Entry Level, Mid Level, Senior, Lead, etc.
- responsibilities: Array of role responsibilities
- keywords: Array of important keywords (ATS-focused)

Rules:
- Normalize skills (e.g., JS → JavaScript)
- Prioritize repeated keywords
- Remove unnecessary filler words
- Focus on ATS keyword relevance
- Return ONLY valid JSON, no markdown or explanation

Example output:
{
  "job_title": "Frontend Developer Intern",
  "required_skills": ["React", "JavaScript", "HTML", "CSS"],
  "preferred_skills": ["TypeScript", "Testing"],
  "tools": ["Git", "REST API"],
  "soft_skills": ["Communication", "Teamwork"],
  "experience_level": "Entry Level",
  "responsibilities": ["Build UI components", "Write clean code"],
  "keywords": ["React", "Frontend", "UI", "API"]
}`;

    const endpoint = AI_API_KEY.startsWith("sk-or-")
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://ai.gateway.lovable.dev/v1/chat/completions";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://resume-ai.dev",
        "X-Title": "Resume.AI",
      },
      body: JSON.stringify({
        model: AI_API_KEY.startsWith("sk-or-") ? "openai/gpt-4o-mini" : "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this job description:\n\n${jobDescription}` },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to analyze job description");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response (handle potential markdown code blocks)
    let parsedResult;
    try {
      // Remove markdown code blocks if present
      const jsonString = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse job analysis");
    }

    // Ensure all required fields exist with defaults
    const result = {
      job_title: parsedResult.job_title || "Unknown Position",
      experience_level: parsedResult.experience_level || "Not Specified",
      required_skills: parsedResult.required_skills || [],
      preferred_skills: parsedResult.preferred_skills || [],
      tools: parsedResult.tools || [],
      soft_skills: parsedResult.soft_skills || [],
      responsibilities: parsedResult.responsibilities || [],
      keywords: parsedResult.keywords || [],
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error analyzing job:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
