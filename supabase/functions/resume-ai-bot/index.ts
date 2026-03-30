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
    const { messages, semanticContext, episodicContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format");
    }

    const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
    if (!AI_API_KEY) {
      throw new Error("AI API Key is required but not configured.");
    }

    const systemPrompt = `You are Resume.AI Bot, an elite career advisor and resume optimizer.
You must use the following 4-Tier Agentic Memory Architecture to ensure zero hallucinations and highly accurate responses:

1. SHORT-TERM MEMORY (ST): Refer to the user's current conversation state for context.
2. SEMANTIC MEMORY (LT - Knowledge & Facts): Rely ONLY on the verified data points below for the user's background. Do not guess or invent skills.
${semanticContext || "No semantic data provided."}

3. EPISODIC MEMORY (LT - Past Experiences): Take into account the user's past actions inside the application.
${episodicContext || "No episodic data provided."}

4. PROCEDURAL MEMORY (SOPs & Workflow Logic): Follow these strict rules to guide your responses:
- SOP 1 (Skill Matching): If asked to match skills to a job, compare Semantic Memory skills directly against their Semantic Memory target job. Identify precise gaps.
- SOP 2 (Resume Optimization): If asked to improve a resume, give 3 concise bullet-point suggestions based on missing keywords.
- SOP 3 (Interview/Roadmaps): If asked for a roadmap or interview prep, provide a structured, step-by-step actionable guide. No generic fluff.
- SOP 4 (Unknowns): If asked about details not present in your Semantic/Episodic memory, admit you don't know and ask the user to provide them. Do not hallucinate.

Keep your tone professional, supportive, and direct. Use markdown for readability.`;

    const systemMessage = { role: "system", content: systemPrompt };

    let endpoint = "https://api.openai.com/v1/chat/completions";
    let model = "gpt-4o-mini";

    if (AI_API_KEY.startsWith("AIza")) {
      // Gemini Key
      endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      model = "gemini-2.5-flash";
    } else if (AI_API_KEY.startsWith("sk-or-")) {
      // OpenRouter Key - Changed to fully FREE fallback router to prevent payment errors
      endpoint = "https://openrouter.ai/api/v1/chat/completions";
      model = "openai/gpt-4o-mini";
    } else if (!AI_API_KEY.startsWith("sk-")) {
      // Fallback to Lovable Gateway
      endpoint = "https://ai.gateway.lovable.dev/v1/chat/completions";
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
        messages: [systemMessage, ...messages],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("AI gateway error:", response.status, errorData);
      throw new Error(`AI API Error: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in AI Bot:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
