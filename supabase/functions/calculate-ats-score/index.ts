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
    const { jobKeywords, resumeContent } = await req.json();

    if (!resumeContent) {
      return new Response(
        JSON.stringify({ error: "Resume content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("OPENAI_API_KEY");
    if (!AI_API_KEY) {
      throw new Error("AI_API_KEY is not configured");
    }

    const systemPrompt = `Calculate ATS compatibility score between a resume and job requirements.

Tasks:
- Identify all matched keywords between job description and resume
- Identify missing keywords from job requirements not found in resume
- Calculate accurate match percentage based on keyword coverage
- Analyze keyword placement and frequency
- Provide specific, actionable improvement tips

Return output strictly in JSON format with:
- ats_score: Number 0-100 representing overall ATS compatibility
- matched_keywords: Array of keywords found in both job description and resume
- missing_keywords: Array of required keywords not found in resume
- keyword_frequency: Object mapping matched keywords to their count in resume
- section_analysis: Object with scores for each resume section (summary, skills, experience, projects, education)
- improvement_tips: Array of specific, actionable advice to improve ATS score
- critical_gaps: Array of most important missing keywords that significantly impact score
- strength_areas: Array of areas where the resume is strong
- overall_assessment: Brief text summary of the resume's ATS compatibility

Rules:
- Consider keyword synonyms and variations (e.g., JS = JavaScript)
- Weight exact matches higher than partial matches
- Consider keyword placement (skills section vs buried in text)
- Prioritize technical skills and tools
- Be specific in improvement suggestions
- Return ONLY valid JSON, no markdown or explanation`;

    const userPrompt = `Job Description Keywords:
${JSON.stringify(jobKeywords || [], null, 2)}

Resume Content:
${resumeContent}

Analyze the ATS compatibility and provide a detailed score breakdown.`;

    const endpoint = AI_API_KEY.startsWith("sk-or-")
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";

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
      throw new Error("Failed to calculate ATS score");
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
      throw new Error("Failed to parse ATS score results");
    }

    const result = {
      ats_score: parsedResult.ats_score || 0,
      matched_keywords: parsedResult.matched_keywords || [],
      missing_keywords: parsedResult.missing_keywords || [],
      keyword_frequency: parsedResult.keyword_frequency || {},
      section_analysis: parsedResult.section_analysis || {},
      improvement_tips: parsedResult.improvement_tips || [],
      critical_gaps: parsedResult.critical_gaps || [],
      strength_areas: parsedResult.strength_areas || [],
      overall_assessment: parsedResult.overall_assessment || "",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error calculating ATS score:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
