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
    const { linkedinText, jobKeywords } = await req.json();

    if (!linkedinText) {
      return new Response(
        JSON.stringify({ error: "LinkedIn profile text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("OPENAI_API_KEY");

    if (!API_KEY) {
      throw new Error("API Key is not configured (checked LOVABLE_API_KEY and OPENAI_API_KEY)");
    }

    const systemPrompt = `Analyze the provided PROSPECT TEXT (raw LinkedIn PDF extraction) against the TARGET ROLE.

    CRITICAL INSTRUCTION: You are a Senior Technical Recruiter.
    
    **IF A SPECIFIC TARGET ROLE IS PROVIDED**:
    - Transform this profile into a top-tier candidate strictly for that role.
    
    **IF NO TARGET ROLE IS PROVIDED (or it says "General Software Engineering Role")**:
    - **STEP 1**: Analyzes the profile to DETERMINE the highest-level role the candidate is qualified for (e.g., "Full Stack Engineer", "Data Scientist").
    - **STEP 2**: Use this INFERRED ROLE as the "TARGET ROLE" for all subsequent steps (ATS Score, Gaps, Branding).
    - **STEP 3**: Explicitly state "Inferred Role: [Role Name]" in the "target_role_identified" field.

    TONE RULES:
    - 100% Human-like: No robotic output. Professional and direct.
    - Technical & Professional: Use industry-standard terminology.
    - SEO Optimized: You MUST use high-traffic keywords relevant to the (Provided or Inferred) TARGET ROLE.

    TASKS:
    1. **Data Extraction & Cleaning**:
       - Extract Contact Info details.
       - rewrite experience bullets to be result-oriented (STAR method).

    2. **GAP ANALYSIS (Role Validation)**:
       - Compare current skills against the **TARGET ROLE** (Provided or Inferred).
       - **Missing Skills**: Identify 5-7 critical hard skills/keywords missing for this specific role.
       - **Core Skills**: List top 10 absolute requirements for the TARGET ROLE.

    3. **PROFESSIONAL BRANDING**:
       - **Headline**: Create a punchy, keyword-stuffed headline for the TARGET ROLE.
       - **Banner/About**: Write a summary optimized for the TARGET ROLE.

    4. **PORTFOLIO SUGGESTIONS**:
       - Suggest 3 distinct side projects that prove competence in the TARGET ROLE.
       - Projects must fill the **Missing Skills** gaps.

    5. **JOB MATCHING & SCORING**:
       - **ATS Score**: Calculate a match score (0-100) against the TARGET ROLE. (Penalty for missing keywords).
       - **Matching Jobs**: Suggest 3 specific job titles the candidate is a fit for.

    6. **Output**: Return strictly valid JSON.

    JSON SCHEMA:
    {
      "contact_info": { "email": "", "phone": "", "linkedin": "", "portfolio": "", "location": "", "github": "" },
      "headline": "Current extracted headline",
      "summary": "Current extracted summary",
      "alignment_score": 85,
      "core_skills": ["extracted skill 1", "extracted skill 2"],
      "work_experience": [
        { "title": "", "company": "", "duration": "", "location": "", "description": "", "improved_description": "Rewritten punchy description", "bullets": ["Improved bullet 1", "Improved bullet 2"] }
      ],
      "education": [{ "degree": "", "institution": "", "year": "", "improved_description": "" }],
      "projects": [{ "name": "", "description": "", "tech_stack": [], "url": "" }],
      "suggested_projects": [
        { "name": "Modern Project Name", "description": "Description solving a real business problem for Target Role", "key_tech": ["Skill1", "Skill2"] }
      ],
      "professional_branding": {
        "suggested_headline": "Role | Skill 1 | Skill 2 | Value Prop",
        "suggested_banner_text": "Professional tagline summarizing expertise for Target Role",
        "linkedin_about_suggestion": "First-person professional summary optimized for Target Role keywords."
      },
      "skills_analysis": {
        "target_role_identified": "Actual Or Inferred Target Role Name",
        "missing_skills_for_role": ["SEO Keyword 1", "SEO Keyword 2"],
        "suggested_additions_to_profile": ["Keyword 1", "Keyword 2"]
      },
      "optimized_summary": "Overall profile summary rewrite",
      "ats_tips": ["Tip 1", "Tip 2"],
      "recommendations": ["General improvement 1"],
      "matching_jobs": [
        { "title": "Job Title", "match": "90%", "reason": "Why it fits" }
      ],
      "languages": [],
      "certifications": [],
      "industry_keywords": []
    }
    
    Return ONLY valid JSON.`;

    const userPrompt = `PROSPECT PROFILE TEXT:
${linkedinText}

TARGET ROLE / JOB DESCRIPTION / KEYWORDS:
${jobKeywords && jobKeywords.trim() !== "" ? jobKeywords : "NO TARGET ROLE PROVIDED - PLEASE INFER BEST FIT ROLE"} (Use this to drive the branding and skill gaps)`;

    let endpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
    let model = "gpt-4o-mini";

    if (AI_API_KEY.startsWith("sk-or-")) {
      endpoint = "https://openrouter.ai/api/v1/chat/completions";
      model = "openai/gpt-4o-mini";
    } else if (AI_API_KEY.startsWith("sk-")) { // General OpenAI key check
      endpoint = "https://api.openai.com/v1/chat/completions";
      model = "gpt-4o-mini";
    }

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    console.log("AI response status:", response.status);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("Failed to analyze LinkedIn profile");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    const parsedResult = JSON.parse(content);

    // Ensure safety defaults so frontend never receives undefined for expected arrays
    const result = {
      headline: parsedResult.headline || "",
      core_skills: parsedResult.core_skills || [],
      industry_keywords: parsedResult.industry_keywords || [],
      experience_highlights: parsedResult.experience_highlights || parsedResult.work_experience?.map((w: any) => `${w.title} at ${w.company}`) || [],
      missing_keywords: parsedResult.missing_keywords || [],
      optimized_summary: parsedResult.optimized_summary || "",
      improved_bullets: parsedResult.improved_bullets || [],
      alignment_score: parsedResult.alignment_score || 0,
      recommendations: parsedResult.recommendations || [],
      matching_jobs: parsedResult.matching_jobs || [],
      ats_tips: parsedResult.ats_tips || [],
      work_experience: parsedResult.work_experience || [],
      education: parsedResult.education || [],
      certifications: parsedResult.certifications || [],
      languages: parsedResult.languages || [],
      contact_info: parsedResult.contact_info || {},
      projects: parsedResult.projects || [],
      suggested_projects: parsedResult.suggested_projects || [],
      professional_branding: parsedResult.professional_branding || {
        suggested_headline: "",
        suggested_banner_text: "",
        linkedin_about_suggestion: ""
      },
      skills_analysis: {
        target_role_identified: parsedResult.skills_analysis?.target_role_identified || "General Profile Analysis",
        missing_skills_for_role: parsedResult.skills_analysis?.missing_skills_for_role || [],
        suggested_additions_to_profile: parsedResult.skills_analysis?.suggested_additions_to_profile || []
      },
      summary: parsedResult.summary || "",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error analyzing LinkedIn:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});