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
        systemPrompt = `Generate a high-quality, ATS-optimized resume.
        
        CRITICAL RULES FOR PROJECTS:
        - Use PROVIDED projects. If empty, suggest 3 high-impact tech projects.
        - Label suggestions as "RECOMMENDED PROJECTS".
        
        LAYOUT:
        - Professional Summary, Technical Skills (List), Projects, Experience, Education.
        - CAPS HEADERS for sections.
        - Bullet points for descriptions.`;

        userPrompt = `Generate an ATS-optimized resume for:
        FullName: ${fullName || "Your Name"}
        Target Job: ${jobTitle}
        Search Keywords: ${JSON.stringify(jobKeywords || [])}
        Skills: ${JSON.stringify(skills || [])}
        Projects: ${projects && projects.length > 0 ? JSON.stringify(projects) : "PROJECTS EMPTY - SUGGEST 3."}
        Experience: ${JSON.stringify(experience || [])}
        Education: ${JSON.stringify(education || [])}`;
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
