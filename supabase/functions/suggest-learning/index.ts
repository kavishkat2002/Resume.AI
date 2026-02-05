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
    const { missingSkills, currentSkills, existingProjects, targetRole } = await req.json();

    if (!missingSkills || missingSkills.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing skills are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (!AI_API_KEY) {
      throw new Error("AI_API_KEY is not configured");
    }

    const systemPrompt = `Based on missing skills, suggest learning paths and project improvements for a beginner/entry-level developer.

Tasks:
- Suggest new project ideas that demonstrate missing skills
- Recommend improvements to existing GitHub projects
- Suggest tools to learn
- Create a beginner-friendly learning path

Constraints:
- Free resources only (no paid courses)
- Beginner level appropriate
- Practical & resume-focused
- Achievable in reasonable time frames

Return output strictly in JSON format with:

skills_to_learn:
  - Array of objects with:
    - skill: Name of the skill
    - priority: "high", "medium", or "low"
    - estimated_time: Time to learn basics (e.g., "2 weeks")
    - free_resources: Array of free learning resources with name and url
    - why_important: Brief explanation of why this skill matters

project_ideas:
  - Array of objects with:
    - name: Project name
    - description: What to build
    - skills_demonstrated: Array of skills this project shows
    - difficulty: "beginner", "intermediate"
    - estimated_time: Time to complete
    - tech_stack: Recommended technologies
    - resume_bullet: How to describe this on a resume

project_improvements:
  - Array of objects with:
    - project_name: Name of existing project to improve
    - improvements: Array of specific improvements
    - new_skills_added: Skills gained from improvements
    - impact: How this improves resume appeal

tools_to_learn:
  - Array of objects with:
    - tool: Tool name
    - category: "development", "devops", "testing", etc.
    - priority: "essential", "recommended", "nice-to-have"
    - free_resource: Link to free learning resource
    - time_to_learn: Estimated time

learning_path:
  - Array of steps in order with:
    - week: Week number or range
    - focus: What to focus on
    - goals: Specific goals
    - deliverables: What to have completed

overall_strategy: Brief text summarizing the recommended approach

Rules:
- Prioritize skills that appear most in job descriptions
- Suggest projects that are unique and stand out
- Focus on demonstrable, portfolio-worthy work
- Include only genuinely free resources
- Return ONLY valid JSON, no markdown or explanation`;

    const userPrompt = `Target Role: ${targetRole || "Software Developer"}

Missing Skills to Learn:
${JSON.stringify(missingSkills, null, 2)}

Current Skills:
${JSON.stringify(currentSkills || [], null, 2)}

Existing Projects:
${JSON.stringify(existingProjects || [], null, 2)}

Generate a comprehensive learning and improvement plan.`;

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
        temperature: 0.5,
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
      throw new Error("Failed to generate suggestions");
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
      throw new Error("Failed to parse suggestions");
    }

    const result = {
      skills_to_learn: parsedResult.skills_to_learn || [],
      project_ideas: parsedResult.project_ideas || [],
      project_improvements: parsedResult.project_improvements || [],
      tools_to_learn: parsedResult.tools_to_learn || [],
      learning_path: parsedResult.learning_path || [],
      overall_strategy: parsedResult.overall_strategy || "",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
