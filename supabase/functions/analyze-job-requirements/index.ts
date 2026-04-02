// @ts-nocheck
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
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

        const systemPrompt = `You are an expert ATS (Applicant Tracking System) optimizer and IT Career Coach. 
    Analyze the provided Job Description, keywords, and candidate background.
    
    Tasks:
    1. Extract critical "hard skills" and "tech stack" from the Job Description.
    2. Compare these with the candidate's background.
    3. Generate a highly structured list of "Your Technical Skills" for the resume.
    
    IMPORTANT CATEGORIZATION RULES:
    Categorize skills into professional IT Sectors such as:
    - "Software Engineering"
    - "Cloud & Infrastructure"
    - "DevOps & SRE"
    - "Machine Learning & AI"
    - "Data Engineering"
    - "Cybersecurity"
    - "Professional Competencies" (for soft skills)
    
    FORMAT for suggested_user_skills: Each item in the array must be "Sector Name: Skill 1, Skill 2, ..."
    
    Return output strictly in JSON format with:
    - top_keywords: Array of strings (15-20 keywords)
    - tech_stack: Array of strings (Specific tools/languages)
    - suggested_user_skills: Array of strings (E.g. ["Software Engineering: React, Node.js", "Cloud: AWS, Azure"])
    - job_title_inferred: String (Best guess task title)
    
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
