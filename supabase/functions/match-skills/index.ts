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
    const { jobSkills, githubSkills, linkedinSkills, projects, jobTitle } = await req.json();

    if (!jobSkills || jobSkills.length === 0) {
      return new Response(
        JSON.stringify({ error: "Job required skills are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (!AI_API_KEY) {
      throw new Error("AI_API_KEY is not configured");
    }

    const systemPrompt = `Compare job description requirements with the user's skills and projects.

Inputs:
- Job required skills
- GitHub extracted skills
- LinkedIn extracted skills
- User projects

Tasks:
- Match skills from both sources against job requirements
- Identify missing skills the user doesn't have
- Rank relevance of projects to the job
- Select best projects for resume inclusion

Return output strictly in JSON format with:
- skill_match_percentage: Number 0-100 representing overall match
- matched_skills: Array of skills the user has that match job requirements
- missing_skills: Array of skills from job requirements the user lacks
- skill_sources: Object mapping each matched skill to its source (github, linkedin, or both)
- recommended_projects: Array of top 3-5 projects with name, relevance_score (1-100), and reason
- improvement_suggestions: Array of actionable suggestions to improve alignment
- priority_skills_to_learn: Array of top 3 missing skills to prioritize learning
- overall_assessment: Brief text assessment of the candidate's fit

Rules:
- Consider skill synonyms (e.g., JS = JavaScript, React.js = React)
- Weight skills that appear in both sources higher
- Prioritize projects with demonstrated use of required skills
- Be specific in improvement suggestions
- Return ONLY valid JSON, no markdown or explanation`;

    const userPrompt = `Job Title: ${jobTitle || "Not specified"}

Job Required Skills:
${JSON.stringify(jobSkills, null, 2)}

GitHub Extracted Skills:
${JSON.stringify(githubSkills || [], null, 2)}

LinkedIn Extracted Skills:
${JSON.stringify(linkedinSkills || [], null, 2)}

User Projects:
${JSON.stringify(projects || [], null, 2)}`;

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
          { role: "user", content: userPrompt },
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
      throw new Error("Failed to match skills");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    let parsedResult;
    try {
      const jsonString = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse skill matching results");
    }

    const result = {
      skill_match_percentage: parsedResult.skill_match_percentage || 0,
      matched_skills: parsedResult.matched_skills || [],
      missing_skills: parsedResult.missing_skills || [],
      skill_sources: parsedResult.skill_sources || {},
      recommended_projects: parsedResult.recommended_projects || [],
      improvement_suggestions: parsedResult.improvement_suggestions || [],
      priority_skills_to_learn: parsedResult.priority_skills_to_learn || [],
      overall_assessment: parsedResult.overall_assessment || "",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error matching skills:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
