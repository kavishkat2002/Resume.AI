// @ts-nocheck
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
    const rawBody = await req.json();
    console.log("Full Request Body:", JSON.stringify(rawBody, null, 2));

    const mode = (rawBody.mode || rawBody.type || 'resume').toString().toLowerCase().trim();
    console.log(`Final identified mode: ${mode}`);

    const {
      jobTitle,
      jobKeywords,
      projects,
      skills,
      additionalSkills,
      jobDescription,
      education,
      experience,
      fullName,
      email,
      phone,
      location,
      github,
      linkedin,
      portfolio,
      companyName,
      resumeText,
      coverLetterRequirements
    } = rawBody;

    if (!jobTitle) {
      return new Response(
        JSON.stringify({ error: "Job title is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (!AI_API_KEY) {
      throw new Error("AI_API_KEY is not configured");
    }

    // NUCLEAR FIX: Sanitize background data to strip resume-triggering keywords
    const sanitizeBackground = (text: string) => {
      if (!text) return "";
      return text
        .replace(/\b(SUMMARY|EXPERIENCE|PROJECTS|EDUCATION|SKILLS|STRENGTHS|TECHNICAL SKILLS)\b/gi, "") // Strip headers
        .replace(/^[•\-\*]\s*/gm, "") // Strip bullet symbols
        .replace(/\n{3,}/g, "\n\n") // Normalize whitespace
        .trim();
    };

    const sanitizedBackground = sanitizeBackground(resumeText || "");
    const quickBackground = `Skills: ${JSON.stringify(skills)} Projects: ${JSON.stringify(projects)}`;

    let systemPrompt = "";
    let userPrompt = "";

    // BRANCHING LOGIC: Switch on mode/type with hard-coded verification
    switch (mode) {
      case 'cover_letter':
      case 'cover-letter':
        console.log("LOGIC_FLOW: COVER_LETTER_PATH_ACTIVATED");
        systemPrompt = `You are a professional career storyteller.
        
        TASK: Write a 4-paragraph Cover Letter in HUMAN PROSE.
        
        STRICT NEGATIVE CONSTRAINTS (RESUME IS FORBIDDEN):
        - DO NOT GENERATE A RESUME.
        - DO NOT USE BULLET POINTS.
        - DO NOT USE ANY ALL-CAPS HEADERS.
        - DO NOT LIST SKILLS IN A LIST FORMAT.
        - DO NOT INCLUDE CONTACT INFO BLOCKS.
        
        TRANSFORMATION LOGIC:
        Convert the provided background bullet points into a warm, enthusiastic human story. Mention HOW the candidate's projects (like AI tools) solve problems.
        
        STRUCTURE:
        Paragraph 1: Hook & connection to ${companyName || "[Company]"}.
        Paragraph 2: Narrative dive into 1-2 key technical projects.
        Paragraph 3: Mindset, culture fit, and soft skills.
        Paragraph 4: Call to action and enthusiastic sign-off interest.`;

        userPrompt = `WRITE THE 4-PARAGRAPH COVER LETTER BODY NOW.
        
        TARGET ROLE: ${jobTitle} at ${companyName || "the company"}
        REQUIREMENTS: ${coverLetterRequirements || "Modern tech stack and fast learning."}
        
        CANDIDATE STORY SOURCE (SANITIZED):
        ${sanitizedBackground || quickBackground}
        
        FINAL REMINDER: 100% PARAGRAPHS ONLY. NO RESUME FORMATTING.`;
        break;

      case 'resume':
        console.log("LOGIC_FLOW: RESUME_PATH_ACTIVATED");
        systemPrompt = `You are an elite ATS resume engineer. Your job is to generate a targeted, ATS-optimized resume for a SPECIFIC job role.

        ====================================================
        ⚠️ ACCURACY RULES — READ FIRST, THESE ARE ABSOLUTE
        ====================================================

        The candidate's data is FACTUAL. You are an optimizer, not an inventor.
        
        WHAT YOU MUST NEVER DO:
        ✗ Do NOT invent companies, job titles, or dates that aren't in the candidate's experience
        ✗ Do NOT fabricate metrics (e.g. "improved performance by 60%") unless the user provided them
        ✗ Do NOT add certifications, degrees, or educational institutions not provided
        ✗ Do NOT change the candidate's actual job titles or company names
        ✗ Do NOT invent achievements or responsibilities the user did not mention
        ✗ Do NOT assume years of experience — only state what's derivable from the provided data

        WHAT YOU ARE ALLOWED TO DO:
        ✓ REPHRASE experience bullets using stronger ATS action verbs (e.g. "Helped fix bugs" → "Resolved software defects to improve system stability")
        ✓ REORDER information to highlight relevance to the target role
        ✓ ADD role-standard skills in the Core Skills section (from your knowledge of the domain)
        ✓ WRITE a professional summary based ONLY on the provided experience, education, and skills
        ✓ GENERATE projects (when none are provided) since these are clearly AI-suggested examples

        ====================================================
        CORE SKILLS — COMPUTER SCIENCE SECTOR METHOD
        ====================================================

        Organise skills into professional INDUSTRY SECTORS (Computer Science domains).
        DO NOT use generic categories like "Technical Skills" or "Additional Skills".

        STEP A — DEFINE THE ROLE DOMAIN from the Target Job Title.

        STEP B — BUILD SECTOR CATEGORIES (Professional IT Domains):
        Use high-end, industry-standard labels. Examples:
        → "Machine Learning & AI": (Python, PyTorch, TensorFlow, LLMs)
        → "Cloud & Multi-Cloud Infrastructure": (AWS, Azure, GCP, Terraform)
        → "DevOps & SRE": (Jenkins, Kubernetes, Ansible, Docker, CI/CD)
        → "Software Engineering": (Java, Clean Code, Microservices, Spring Boot)
        → "Cybersecurity & GRC": (Penetration Testing, IAM, ISO27001, SIEM)
        → "Data Engineering & Analytics": (SQL, ETL Pipelines, Spark, BigQuery)
        → "Systems Administration & IT Support": (Windows Server, Linux, Troubleshooting, Active Directory)

        STEP C — POPULATE with candidate's actual skills + role-standard skills.

        STEP D — CROSS-REFERENCE: Prioritise candidate's skills that match these sectors.
        Ensure "Soft Skills" (Teamwork, Communication) are grouped under "Professional Competencies" or similar professional header.

        FORMAT: "Sector Name: Skill 1, Skill 2, Skill 3, ..."

        ====================================================
        PROFESSIONAL SUMMARY
        ====================================================
        - Write 3-4 sentences based STRICTLY on the candidate's actual experience and education provided.
        - Use the exact job title in the first sentence.
        - Inject 2-3 ATS keywords from the job description.
        - Only mention years of experience if derivable from the provided experience data.
        - Do NOT claim certifications, achievements, or expertise not evidenced in the candidate's data.

        ====================================================
        EXPERIENCE SECTION
        ====================================================
        - Use ONLY the job titles, companies, and durations from the candidate's provided experience.
        - KEEP all facts intact. ONLY improve the phrasing of bullet points to use stronger action verbs.
        - Reorder bullets to front-load the most relevant responsibilities for the target role.
        - Do NOT add responsibilities that aren't in the original data.

        ====================================================
        EDUCATION SECTION
        ====================================================
        - Use EXACTLY what was provided. Do not alter degrees, institutions, or years.

        ====================================================
        PROJECT GENERATION (only when no projects are provided by the candidate)
        ====================================================

        Generate exactly 3 INDUSTRY-LEVEL projects that a strong candidate for "${jobTitle}" would have built.
        These must be REAL-WORLD, IMPACTFUL projects — not toy examples. Think portfolio-worthy GitHub projects or production systems.

        For each project, follow this EXACT FORMAT (no deviation):

        [Project Name]
        Tech Stack: [comma-separated technologies standard for this role]
        • [Bullet 1: what was built/achieved — include a quantifiable metric e.g. "reduced", "increased", "automated", "%", "ms"]
        • [Bullet 2: technical challenge solved or methodology used]
        • [Bullet 3: outcome, scale, or user impact]

        Rules for project generation:
        - Project names must be descriptive and professional (e.g. "Enterprise Helpdesk Portal", "AI-Powered Resume Screener", NOT "Project A" or "My App")
        - Technologies must be the gold-standard stack for the specific job role
        - Each bullet point must START with a strong action verb (Engineered, Designed, Automated, Deployed, Reduced, Implemented, Integrated...)
        - Bullet 1 MUST contain at least one metric (%, ms, users, tickets, hours, etc.)
        - All 3 projects must serve different purposes (e.g. web app + automation tool + infrastructure/data project)
        - Bullets must use ONLY the '• ' prefix character — no dashes, asterisks, or numbers

        LAYOUT: Professional Summary → CORE SKILLS → PROJECTS → EXPERIENCE → EDUCATION
        All section headers in ALL CAPS. Bullet points for all descriptions.`;

        userPrompt = `Target Job: "${jobTitle}"
${jobDescription ? `\nJob Description:\n${jobDescription}\n` : ""}
ATS Keywords: ${JSON.stringify(jobKeywords || [])}

Candidate Name: ${fullName || "Your Name"}

=== FACTUAL DATA — USE EXACTLY AS PROVIDED ===
Experience (DO NOT change company names, job titles, or dates — only improve bullet phrasing):
${JSON.stringify(experience || [])}

Education (USE EXACTLY — do not alter):
${JSON.stringify(education || [])}

Projects (use exactly if provided):
${projects && projects.length > 0 ? JSON.stringify(projects) : `NONE PROVIDED — generate 3 role-appropriate sample projects for a "${jobTitle}" using standard tools for that domain. Each needs a project name, "Tech Stack: ..." line, and 2-3 impact-driven bullet points.`}

=== PROFILE DATA — FILTER FOR ROLE RELEVANCE ===
Background Skills (filter: only use skills relevant to "${jobTitle}"):
${JSON.stringify([...(skills || []), ...(additionalSkills || [])])}

=== YOUR TASK ===
1. Write CORE SKILLS using the Role-First method for "${jobTitle}" — built from domain knowledge, cross-referenced with candidate skills above.
2. Write PROFESSIONAL SUMMARY using only facts evidenced in the candidate's experience and education above.
3. Write EXPERIENCE section preserving all real details, only improving ATS language of bullet points.
4. Write EDUCATION section exactly as provided.
5. Generate or include PROJECTS section.`;
        break;




      default:
        console.error(`Invalid mode attempted: ${mode}`);
        throw new Error(`Invalid generation mode: ${mode}`);
    }

    const endpoint = AI_API_KEY.startsWith("sk-or-")
      ? "https://openrouter.ai/api/v1/chat/completions"
      : "https://ai.gateway.lovable.dev/v1/chat/completions";

    console.log(`Calling AI at endpoint: ${endpoint} for mode: ${mode}`);

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
        temperature: mode === 'cover-letter' || mode === 'cover_letter' ? 0.6 : 0.4, // Slightly higher for letter to encourage prose flow
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI error (${response.status}): ${errorText}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) throw new Error("No response from AI");

    const cleanedContent = content
      .replace(/```[a-z]*\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Verification step: If content looks like a resume but mode was cover letter, it's an AI failure
    const looksLikeResume = (cleanedContent.match(/SUMMARY|EXPERIENCE|PROJECTS|SKILLS/g) || []).length > 3;

    // Use distinct keys and unified format for maximum compatibility
    const responsePayload = {
      success: true,
      mode: mode,
      content: cleanedContent,
      debug: {
        sanitized: sanitizedBackground.length > 0,
        looksLikeResume: looksLikeResume && (mode === 'cover-letter' || mode === 'cover_letter')
      },
      // Legacy support keys
      coverLetter: mode === 'cover-letter' || mode === 'cover_letter' ? cleanedContent : undefined,
      resume: mode === 'resume' ? cleanedContent : undefined
    };

    console.log(`Generation complete for ${mode}. Sending payload.`);

    return new Response(
      JSON.stringify(responsePayload),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-Generation-Logic": mode === 'cover-letter' || mode === 'cover_letter' ? "PROSE_FLOW" : "ATS_FLOW"
        }
      }
    );
  } catch (error) {
    console.error("Critical Generation Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
