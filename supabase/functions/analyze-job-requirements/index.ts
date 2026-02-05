import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { jobDescription, jobKeywords, userSkills, userProjects } = await req.json();

        if (!jobDescription) {
            return new Response(
                JSON.stringify({ error: "Job description is required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("OPENAI_API_KEY");
        if (!AI_API_KEY) {
            throw new Error("AI_API_KEY is not configured");
        }

        const systemPrompt = `You are an expert ATS (Applicant Tracking System) optimizer. 
    Analyze the provided Job Description, optional initial keywords, and the candidate's existing skills/projects.
    
    Tasks:
    1. Extract critical "hard skills" and "tech stack" from the Job Description.
    2. Compare these with the candidate's background (User Skills, User Projects).
    3. Generate a list of "Your Technical Skills" for the resume.
       - PRIORITIZE: Skills the user HAS that are ALSO in the Job Description.
       - SECONDARY: Skills in the Job Description that are highly likely implied by the user's background (e.g., if user knows React, they likely know JS/HTML/CSS).
       - SUGGESTIONS: High-impact keywords from the JD that the user *should* consider adding if they have any familiarity.
    
    Return output strictly in JSON format with:
    - top_keywords: Array of strings (The 15-20 most important keywords mixed tech/soft for the JOB)
    - tech_stack: Array of strings (Specific languages, tools, frameworks for the JOB)
    - suggested_user_skills: Array of strings (The ideal comma-separated skills list for the USER'S resume, tailored to this job)
    - job_title_inferred: String (Best guess at the standardized job title)
    
    Return ONLY valid JSON.`;

        const userPrompt = `Job Description:
    ${jobDescription.substring(0, 5000)}
    
    Initial Keywords (Optional):
    ${JSON.stringify(jobKeywords || [])}

    User Background:
    Skills: ${userSkills || "Not provided"}
    Projects: ${userProjects || "Not provided"}`;

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
            const errorText = await response.text();
            console.error("AI Gateway error:", response.status, errorText);
            throw new Error(`AI Service Error: ${response.status}`);
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
            throw new Error("Failed to parse analysis results");
        }

        return new Response(JSON.stringify(parsedResult), {
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
