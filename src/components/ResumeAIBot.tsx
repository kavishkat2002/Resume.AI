import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const ResumeAIBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your ResumAI career advisor equipped with a 4-Tier Agentic Memory. I know your current stats and progress. How can I help you today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpenAiBot = () => {
      setIsOpen(true);
      setIsExpanded(true); // Automatically expand to full size like ChatGPT
    };
    window.addEventListener('open-ai-bot', handleOpenAiBot);
    return () => window.removeEventListener('open-ai-bot', handleOpenAiBot);
  }, []);

  const gatherSemanticMemory = () => {
    // Collect facts from localStorage
    const resumeJobTitle = localStorage.getItem("resume_jobTitle") || "Not set";
    const resumeSkills = localStorage.getItem("resume_skills") || "Not set";
    const resumeSummary = localStorage.getItem("resume_summary") || "Not set";
    
    // Analyze job keywords if available
    let latestTargetJob = "Not completely matched";
    let requiredSkills = "None";
    
    const analysisResult = localStorage.getItem("job_analysis_result");
    if (analysisResult) {
      try {
        const parsed = JSON.parse(analysisResult);
        latestTargetJob = parsed.job_title || "Unknown position";
        requiredSkills = parsed.required_skills ? parsed.required_skills.join(", ") : "None";
      } catch (e) {
        // parsing error
      }
    }

    return `
USER RESUME FACTS:
- Current Target/Built Job Title: ${resumeJobTitle}
- Current Resume Skills: ${resumeSkills}
- Professional Summary Snippet: ${resumeSummary.substring(0, 50)}...

TARGET ROLE (Latest Analysis):
- Position: ${latestTargetJob}
- Required Skills: ${requiredSkills}
    `.trim();
  };

  const gatherEpisodicMemory = () => {
    // Collect episodes/past context
    let atsScore = "Not calculated yet";
    const scoreResult = localStorage.getItem("ats_score_result");
    if (scoreResult) {
      try {
        const parsed = JSON.parse(scoreResult);
        atsScore = `${parsed.ats_score}% (Checked recently)`;
      } catch (e) {}
    }

    const linkedInChecked = !!localStorage.getItem("linkedin_url") ? "Yes" : "No";
    const githubChecked = !!localStorage.getItem("github_username") ? "Yes" : "No";

    return `
PAST ACTIVITIES:
- Latest ATS Score: ${atsScore}
- LinkedIn Analyzed: ${linkedInChecked}
- GitHub Analyzed: ${githubChecked}
    `.trim();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const semanticContext = gatherSemanticMemory();
      const episodicContext = gatherEpisodicMemory();

      // Ensure we only send the last 10 messages for short term memory limitation
      // But OpenRouter context length is large, so passing full history works well. We'll pass the last 10.
      const shortTermMemoryContext = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      shortTermMemoryContext.push({ role: "user", content: userMsg });

      const { data, error } = await supabase.functions.invoke("resume-ai-bot", {
        body: {
          messages: shortTermMemoryContext,
          semanticContext,
          episodicContext,
        },
      });

      if (error) {
        throw error;
      }

      const aiResponse = data?.choices?.[0]?.message?.content || "Sorry, I am facing a connection issue right now.";
      
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error("AI Bot Error:", error);
      toast.error("Failed to connect to ResumAI Bot");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! There was an issue processing your request. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="ai-bot-float fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-lg p-0 bg-[#0f1c4d] z-50 overflow-hidden border-2 border-white/20"
        >
          <img src="/ai-bot-icon.png" alt="Resume AI Bot" className="w-full h-full object-contain" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`fixed ${isExpanded ? 'inset-0 w-full h-full md:inset-[5%] md:w-[90%] md:h-[90%] md:rounded-2xl z-[100]' : 'bottom-20 right-6 w-80 md:w-96 h-[500px] rounded-xl z-50'} shadow-xl flex flex-col overflow-hidden border-border bg-card transition-all duration-300 ease-in-out`}>
          <CardHeader className="bg-card border-b border-border p-3 flex flex-row items-center justify-between shadow-sm flex-shrink-0">
              <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full overflow-hidden bg-[#0f1c4d] flex-shrink-0">
                <img src="/ai-bot-icon.png" alt="Resume AI" className="w-full h-full object-contain" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold tracking-wide text-foreground">ResumAI Assistant</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full"
                onClick={() => {
                  setIsOpen(false);
                  setIsExpanded(false); // Reset to mini widget when closed
                }}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                    msg.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card border border-border rounded-tl-none prose prose-sm max-w-none dark:prose-invert"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-none p-3 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-3 bg-card border-t border-border flex-shrink-0">
            <div className="relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about jobs, skills, or interview tips..."
                className={`pr-12 bg-background border-input focus-visible:ring-primary shadow-sm ${isExpanded ? 'h-14 text-base' : 'h-10 text-sm'}`}
                disabled={isLoading}
              />
              <Button
                size="icon"
                variant="ghost"
                className={`absolute right-1 top-1 text-primary hover:text-primary hover:bg-muted ${isExpanded ? 'h-12 w-12' : 'h-8 w-8'}`}
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send className={isExpanded ? "h-6 w-6" : "h-4 w-4"} />
              </Button>
            </div>
            <div className="text-[10px] text-zinc-400 text-center mt-2 font-medium">
              4-Tier Agentic Memory • Powered by Creative LabX
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
