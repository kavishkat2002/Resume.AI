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
        const { username, targetJobTitle } = await req.json();

        if (!username) {
            return new Response(
                JSON.stringify({ error: "GitHub username is required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`[DEBUG] Fetching GitHub repos for: ${username}`);
        const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
        console.log(`[DEBUG] GITHUB_TOKEN present: ${!!GITHUB_TOKEN}`);

        const headers: Record<string, string> = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "ResumeAI-App",
        };

        if (GITHUB_TOKEN) {
            headers["Authorization"] = `token ${GITHUB_TOKEN}`;
        }

        // Fetch public repositories from GitHub API
        const githubResponse = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=30`,
            { headers }
        );

        console.log(`[DEBUG] GitHub Response Status: ${githubResponse.status}`);

        if (!githubResponse.ok) {
            if (githubResponse.status === 404) {
                return new Response(
                    JSON.stringify({ error: "GitHub user not found" }),
                    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
            if (githubResponse.status === 403) {
                return new Response(
                    JSON.stringify({ error: "GitHub API rate limit exceeded. Please try again later." }),
                    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
            const errorText = await githubResponse.text();
            console.error(`[DEBUG] GitHub Error Body: ${errorText}`);
            throw new Error(`GitHub API error: ${githubResponse.status} - ${errorText}`);
        }

        const repos = await githubResponse.json();
        console.log(`[DEBUG] Found ${repos.length} repositories`);

        // Prepare repository data for AI analysis
        // OPTIMIZATION: Only send the top 15 repositories to AI to reduce latency and avoid timeouts
        // Sort by stars (desc) then updated_at (desc)
        const sortedRepos = repos.sort((a: any, b: any) => {
            if ((b.stargazers_count || 0) !== (a.stargazers_count || 0)) {
                return (b.stargazers_count || 0) - (a.stargazers_count || 0);
            }
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }).slice(0, 15);

        // Fetch READMEs for the top 5 repositories to give the AI more context
        const top5Repos = sortedRepos.slice(0, 5);
        const readmePromises = top5Repos.map(async (repo: any) => {
            try {
                const readmeRes = await fetch(
                    `https://api.github.com/repos/${username}/${repo.name}/readme`,
                    {
                        headers: {
                            ...headers,
                            "Accept": "application/vnd.github.raw"
                        }
                    }
                );
                if (readmeRes.ok) {
                    const text = await readmeRes.text();
                    console.log(`[DEBUG] Fetched README for ${repo.name} (${text.length} chars)`);
                    return { name: repo.name, readme: text.substring(0, 2000) }; // Limit to 2000 chars
                }
            } catch (e) {
                console.error(`[DEBUG] Failed to fetch README for ${repo.name}:`, e);
            }
            return { name: repo.name, readme: null };
        });

        const readmes = await Promise.all(readmePromises);
        const readmeMap = new Map(readmes.map(r => [r.name, r.readme]));

        const repoData = sortedRepos.map((repo: any) => {
            const readmeContent = readmeMap.get(repo.name);
            return {
                name: repo.name,
                // improved description with readme content if available
                description: readmeContent
                    ? `(README SUMMARY): ${readmeContent.substring(0, 300)}... ` + (repo.description || "")
                    : (repo.description || "").substring(0, 200),
                readmeContext: readmeContent, // Pass full (truncated) readme context to AI payload separately if needed, or stick to description
                language: repo.language,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                topics: repo.topics,
                url: repo.html_url,
                updated_at: repo.updated_at,
            };
        });

        const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("OPENAI_API_KEY");

        console.log(`[DEBUG] AI_API_KEY present: ${!!AI_API_KEY}`);

        if (!AI_API_KEY) {
            console.error("API Key is missing (checked AI_API_KEY, LOVABLE_API_KEY and OPENAI_API_KEY)");
            return new Response(
                JSON.stringify({ error: "Server configuration error: Missing API Key" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const systemPrompt = `Analyze the following GitHub profile data and extract job-relevant insights.
    
    CRITICAL INSTRUCTION: You are a CTO / Senior Engineering Manager hiring for the specific **TARGET JOB ROLE**.
    Your goal is to evaluate if this candidate is ready for THAT specific role.
    
    TASKS:
    1. **Role Alignment Analysis**:
       - Analyze the repos: Do they demonstrate the skills required for the **TARGET JOB ROLE**?
       - **SEO Skills**: Identify high-traffic keywords for the Target Role that are MISSING or weak in these repos.
    
    2. **Repo "Code Review"**:
       - Select the top 3 most relevant repositories.
       - Provide specific **Technical Improvements** for each to make them "Senior Level" (e.g., "Add Docker-compose", "Implement CI/CD with GitHub Actions", "Add Unit Tests with Jest").
       
    3. **Killer Project Suggestion**:
       - Suggest **ONE** sophisticated, portfolio-defining project.
       - This project must solve a real business problem relevant to the Target Role.
       - It must use the "Missing SEO Skills".
    
    4. **Resume Descriptions (The "Intern/Pro" Format)**:
       - For each project, generate a \`resume_bullets\` array with EXACTLY 4-5 items following this format:
         - **Line 1 (Problem)**: "Identified [Problem]..." (1-line problem statement)
         - **Line 2 (Solution)**: "Architected/Deployed [Solution] using [Tech Stack]..." (Action verbs, technical details)
         - **Line 3 (Impact)**: "Reduced latency by X% / Improved throughput..." (Quantified impact)
         - **Line 4 (Tech)**: "Leveraged [Specific Feature] to achieve [Outcome]..."
       - **Tone**: Software Architecture focus. Use terms like "Orchestrated", "Decoupled", "Scalable", "Microservices".
    
    Return output strictly in JSON format with:
    - top_languages: Array
    - extracted_skills: Array
    - seo_skills: Array (High-value keywords the user should add to their repos/profile for this role)
    - project_summaries: Array of {
        name, 
        description, 
        skills, 
        relevance_score (1-10), 
        resume_bullets: Array<string>, 
        key_features: Array<string>, 
        tech_stack: Array<string>
      }
    - repo_critiques: Object where key is repo name and value is Array of specific improvement strings.
    - new_project_idea: {
        name: "Project Name",
        description: "Detailed description",
        tech_stack: ["Tech 1", "Tech 2"],
        why_this_project: "Why this gets you hired"
      }
    - skill_to_project_mapping: Object
    - recommended_projects: Array of top project names
    - role_alignment: Brief text explaining the alignment
    
    Return ONLY valid JSON.`;

        const userMessage = `GitHub Data:
${JSON.stringify(repoData, null, 2)}

Target Job Role:
${targetJobTitle || "Software Developer"}`;

        console.log("Calling AI for analysis...");

        let endpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
        let model = "gpt-4o-mini";

        if (AI_API_KEY.startsWith("sk-or-")) {
            endpoint = "https://openrouter.ai/api/v1/chat/completions";
            model = "openai/gpt-4o-mini";
        } else if (AI_API_KEY.startsWith("sk-")) { // General OpenAI key check
            endpoint = "https://api.openai.com/v1/chat/completions";
            model = "gpt-4o-mini";
        }

        console.log(`[DEBUG] AI Endpoint: ${endpoint}`);
        console.log(`[DEBUG] AI Model: ${model}`);

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${AI_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://resume-ai.dev",
                "X-Title": "Resume.AI",
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage },
                ],
                temperature: 0.3,
                response_format: { type: "json_object" }
            }),
        });

        console.log(`[DEBUG] AI Response Status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[DEBUG] AI Error Body: ${errorText}`);

            if (response.status === 429) {
                return new Response(
                    JSON.stringify({ error: "Rate limit exceeded (AI). Please try again later." }),
                    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
            if (response.status === 402) {
                return new Response(
                    JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
                    { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
            throw new Error(`AI Analysis failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error("No response from AI");
        }

        // Parse the JSON response
        let parsedResult;
        try {
            const jsonString = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            parsedResult = JSON.parse(jsonString);
        } catch (parseError) {
            console.error("Failed to parse AI response:", content);
            throw new Error("Failed to parse GitHub analysis results");
        }

        // Include raw repo data for display
        const result = {
            username,
            repositories: repoData,
            analysis: {
                top_languages: parsedResult.top_languages || [],
                extracted_skills: parsedResult.extracted_skills || [],
                project_summaries: parsedResult.project_summaries || [],
                skill_to_project_mapping: parsedResult.skill_to_project_mapping || {},
                recommended_projects: parsedResult.recommended_projects || [],
                role_alignment: parsedResult.role_alignment || "",
            },
        };

        console.log("GitHub analysis complete");

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error analyzing GitHub:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", details: error instanceof Error ? error.stack : undefined }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
