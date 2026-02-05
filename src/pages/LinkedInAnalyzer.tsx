import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Linkedin,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Copy,
  Upload,
  FileText,
  Download,
  Briefcase,
  Zap,
  History,
  Clock,
  ChevronRight,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as pdfjs from "pdfjs-dist";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Project {
  name: string;
  description: string;
  tech_stack: string[];
  url?: string;
}

interface ProfessionalBranding {
  suggested_banner_text: string;
  suggested_headline: string;
  linkedin_about_suggestion: string;
}

interface SkillsAnalysis {
  target_role_identified: string;
  missing_skills_for_role: string[];
  suggested_additions_to_profile: string[];
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
}

interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  location: string;
  description: string;
  improved_description?: string;
  bullets: string[];
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  improved_description?: string;
}

interface SuggestedProject {
  name: string;
  description: string;
  key_tech: string[];
}

interface LinkedInAnalysis {
  headline: string;
  core_skills: string[];
  industry_keywords: string[];
  experience_highlights: string[];
  missing_keywords: string[];
  optimized_summary: string;
  improved_bullets: string[];
  alignment_score: number;
  recommendations: string[];
  matching_jobs?: { title: string; reason: string }[];
  ats_tips?: string[];
  created_at?: string;
  id?: string;
  projects?: Project[];
  suggested_projects?: SuggestedProject[];
  professional_branding?: ProfessionalBranding;
  skills_analysis?: SkillsAnalysis;
  certifications?: Certification[];
  work_experience?: WorkExperience[];
  education?: Education[];
}

const LinkedInAnalyzer = () => {
  const locationState = useLocation().state;
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("linkedin_activeTab") || "username");
  const [linkedinText, setLinkedinText] = useState(() => localStorage.getItem("linkedin_text") || "");
  const [linkedinUrl, setLinkedinUrl] = useState(() => localStorage.getItem("linkedin_url") || "");
  const [jobKeywords, setJobKeywords] = useState(() => localStorage.getItem("linkedin_jobKeywords") || "");
  const [analysis, setAnalysis] = useState<LinkedInAnalysis | null>(() => {
    const saved = localStorage.getItem("linkedin_analysis");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [history, setHistory] = useState<LinkedInAnalysis[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("linkedin_activeTab", activeTab);
    localStorage.setItem("linkedin_text", linkedinText);
    localStorage.setItem("linkedin_url", linkedinUrl);
    localStorage.setItem("linkedin_jobKeywords", jobKeywords);
    if (analysis) {
      localStorage.setItem("linkedin_analysis", JSON.stringify(analysis));
    } else {
      localStorage.removeItem("linkedin_analysis");
    }
  }, [activeTab, linkedinText, linkedinUrl, jobKeywords, analysis]);

  useEffect(() => {
    if (locationState?.jobKeywords && !jobKeywords) {
      setJobKeywords(locationState.jobKeywords);
    }
  }, [locationState, jobKeywords]);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsFetchingHistory(true);
      const { data, error } = await supabase
        .from("linkedin_analyses" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Error fetching history:", error);
        return;
      }
      setHistory((data as any) || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsFetchingHistory(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsParsing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const typedArray = new Uint8Array(event.target?.result as ArrayBuffer);
          const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str || "")
              .join(" ");
            fullText += `--- Page ${i} ---\n${pageText}\n\n`;
          }

          if (!fullText.trim()) {
            throw new Error("No text found in PDF. Make sure it's not a scanned image.");
          }

          setLinkedinText(fullText);
          toast.success("PDF parsed! You can now analyze the profile.");
        } catch (error) {
          console.error("Error processing PDF content:", error);
          toast.error("Failed to extract text from PDF");
        } finally {
          setIsParsing(false);
        }
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
        setIsParsing(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error initialing PDF parse:", error);
      toast.error("Failed to parse PDF");
      setIsParsing(false);
    }
  };

  const handleAnalyze = async () => {
    const textToAnalyze = linkedinText || (linkedinUrl ? `Analyze LinkedIn Profile: ${linkedinUrl}` : "");

    if (!textToAnalyze.trim()) {
      toast.error("Please provide LinkedIn profile information or URL");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: { linkedinText: textToAnalyze, jobKeywords },
      });

      if (error) throw error;
      setAnalysis(data);

      // Save to history
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("linkedin_analyses" as any).insert({
          user_id: user.id,
          headline: data.headline,
          core_skills: data.core_skills,
          industry_keywords: data.industry_keywords,
          experience_highlights: data.experience_highlights,
          missing_keywords: data.missing_keywords,
          optimized_summary: data.optimized_summary,
          improved_bullets: data.improved_bullets,
          alignment_score: data.alignment_score,
          recommendations: data.recommendations,
          matching_jobs: data.matching_jobs,
          ats_tips: data.ats_tips
        });
        fetchHistory(); // Refresh history
      }

      toast.success("LinkedIn profile analyzed successfully!");
    } catch (error) {
      console.error("Error analyzing LinkedIn:", error);
      toast.error("Failed to analyze LinkedIn profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("LinkedIn-Analysis-Report.pdf");
    toast.success("Analysis report exported to PDF!");
  };

  const handleSaveToProfile = async () => {
    if (!analysis) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to save to profile");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          linkedin_headline: analysis.headline,
          linkedin_summary: analysis.optimized_summary,
          professional_summary: analysis.optimized_summary
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profile updated with LinkedIn data!");
    } catch (error) {
      console.error("Error saving to profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleResetForm = async () => {
    if (window.confirm("This will clear your current form AND delete all your saved analysis history. Are you sure?")) {
      try {
        localStorage.removeItem("linkedin_text");
        localStorage.removeItem("linkedin_url");
        localStorage.removeItem("linkedin_jobKeywords");
        localStorage.removeItem("linkedin_analysis");

        setLinkedinText("");
        setLinkedinUrl("");
        setJobKeywords("");
        setAnalysis(null);
        setActiveTab("username");

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from("linkedin_analyses" as any)
            .delete()
            .eq("user_id", user.id);

          if (error) {
            console.error("Error deleting history:", error);
            // Even if DB fails, local is cleared
          } else {
            setHistory([]);
          }
        }

        toast.info("Form reset and history cleared.");
      } catch (e) {
        console.error("Reset error:", e);
        toast.error("Error resetting form");
      }
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Linkedin className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">LinkedIn Intelligence</h1>
              <p className="text-muted-foreground">AI-powered profile optimization & job matching</p>
            </div>
          </div>
          {analysis && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveToProfile} className="gap-2 border-primary/20 hover:bg-primary/5">
                <CheckCircle className="h-4 w-4" />
                Update Profile
              </Button>
              <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                <Download className="h-4 w-4" />
                Export Result
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleResetForm} className="text-muted-foreground hover:text-destructive">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Form
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Import Profile Data</CardTitle>
                <CardDescription>
                  Choose how you want to provide your LinkedIn information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="username">Link/User</TabsTrigger>
                    <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
                    <TabsTrigger value="text">Paste Text</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="username" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">LinkedIn URL or Username</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. linkedin.com/in/username"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pdf" className="space-y-4">
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center space-y-3 hover:border-primary/50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="flex justify-center">
                        <div className="p-3 bg-primary/5 rounded-full">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Click to upload your LinkedIn PDF</p>
                        <p className="text-xs text-muted-foreground mt-1">Exported using 'Save to PDF' on LinkedIn</p>
                      </div>
                      {isParsing && (
                        <div className="flex items-center justify-center gap-2 text-primary animate-pulse">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs font-medium">Reading PDF Content...</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4">
                    <Textarea
                      placeholder="Paste your LinkedIn summary, experience, and skills..."
                      value={linkedinText}
                      onChange={(e) => setLinkedinText(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4">
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                      {isFetchingHistory ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                          <Loader2 className="h-6 w-6 animate-spin mb-2" />
                          <p className="text-sm">Loading history...</p>
                        </div>
                      ) : !supabase.auth.getUser() ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Please login to see history</p>
                        </div>
                      ) : history.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <History className="h-8 w-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No analysis history found</p>
                          <p className="text-[10px] opacity-70 mt-1">Make sure you have run at least one analysis while logged in.</p>
                        </div>
                      ) : (
                        history.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setAnalysis(item)}
                            className="w-full text-left p-3 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group flex items-start gap-3"
                          >
                            <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{item.headline || "Untitled Analysis"}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown date"} • Score: {item.alignment_score}%
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 group-hover:text-primary transition-colors" />
                          </button>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Role / Keywords (Optional)</label>
                  <Textarea
                    placeholder="Paste job description keywords or target role (e.g., Senior Frontend Engineer, Cloud Solutions)"
                    value={jobKeywords}
                    onChange={(e) => setJobKeywords(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02] transition-transform"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Performing Analysis...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Analyze Profile Intelligence
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {analysis && (
              <Card className="border-primary/20 overflow-hidden">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-lg flex items-center justify-between">
                    ATS Match Score
                    <Badge variant={analysis.alignment_score >= 75 ? "default" : "secondary"} className="px-3 py-1 text-lg">
                      {analysis.alignment_score}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Alignment with {jobKeywords ? "Target Role" : (analysis.skills_analysis?.target_role_identified || "Inferred Role")}</span>
                      <span className="font-bold text-primary">{analysis.alignment_score}/100</span>
                    </div>
                    <Progress value={analysis.alignment_score} className="h-4 bg-primary/10" />
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Top Suggestion
                    </h4>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      "{analysis.recommendations[0]}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-7 relative" ref={reportRef}>
            {isLoading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-3xl transition-all h-full min-h-[500px]">
                <div className="relative">
                  <div className="h-24 w-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Linkedin className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div className="text-center mt-6">
                  <h3 className="text-xl font-bold mb-1 text-foreground">Analyzing Profile...</h3>
                  <p className="text-muted-foreground animate-pulse">Scanning skills, experience, and market alignment</p>
                </div>
              </div>
            )}

            {!analysis && !isLoading ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-muted/20 border border-dashed rounded-3xl">
                <div className="p-6 bg-background rounded-full shadow-lg mb-6">
                  <Linkedin className="h-16 w-16 text-primary/20" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Ready to Analyze</h3>
                <p className="text-muted-foreground max-w-md">
                  Import your LinkedIn profile or paste your details to get AI-powered insights, ATS optimization tips, and job matches.
                </p>
              </div>
            ) : analysis ? (
              <div className={`space-y-6 transition-opacity duration-300 ${isLoading ? "opacity-30 pointer-events-none" : "opacity-100"}`}>

                {/* Professional Branding Section */}
                {analysis.professional_branding && (
                  <Card className="border-indigo-500/20 shadow-sm bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                        <Target className="h-5 w-5" /> Professional Personal Brand
                      </CardTitle>
                      <CardDescription>AI-generated branding to stand out to recruiters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Suggested Headline</label>
                        <div className="p-3 bg-background border rounded-lg font-medium text-sm flex justify-between items-center group">
                          <span>{analysis.professional_branding.suggested_headline}</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(analysis.professional_branding?.suggested_headline || "")}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Banner Text / Tagline</label>
                        <div className="p-3 bg-background border rounded-lg text-sm italic text-muted-foreground flex justify-between items-center group">
                          <span>"{analysis.professional_branding.suggested_banner_text}"</span>
                          <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(analysis.professional_branding?.suggested_banner_text || "")}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Skills Gap Analysis for Target Role */}
                {analysis.skills_analysis && (
                  <Card className="border-pink-500/20 shadow-sm bg-pink-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-pink-700 dark:text-pink-300">
                        <Target className="h-4 w-4" />
                        Target Role & SEO Analysis: {analysis.skills_analysis.target_role_identified}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Missing Critical Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.skills_analysis?.missing_skills_for_role?.length > 0 ? (
                            analysis.skills_analysis.missing_skills_for_role.map((skill, i) => (
                              <Badge key={i} variant="outline" className="border-pink-500/30 text-pink-600 bg-background">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">None identified.</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Suggested SEO Keywords (High Traffic)</p>
                        <ul className="text-sm text-foreground list-disc pl-4 space-y-1">
                          {analysis.skills_analysis?.suggested_additions_to_profile?.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-green-500/20 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Identified Core Skills {jobKeywords ? `for ${jobKeywords.slice(0, 20)}${jobKeywords.length > 20 ? '...' : ''}` : `for ${analysis.skills_analysis?.target_role_identified || 'Inferred Role'}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis?.core_skills.map((skill: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-green-500/5 hover:bg-green-500/10 border-green-500/10 transition-colors">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-500/20 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        General Keywords to Add
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysis?.missing_keywords.length ? (
                          analysis.missing_keywords.map((keyword: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-blue-600 border-blue-200">
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground">Profile fully optimized!</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Certifications Section */}
                {analysis.certifications && analysis.certifications.length > 0 && (
                  <Card className="border-teal-500/20">
                    <CardHeader className="bg-teal-500/5 pb-4 border-b border-teal-500/10">
                      <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
                        <Badge className="bg-teal-500 hover:bg-teal-600">Certifications</Badge> Verified Learning
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 grid sm:grid-cols-2 gap-4">
                      {analysis.certifications.map((cert, idx) => (
                        <div key={idx} className="p-3 border rounded-lg flex flex-col gap-1 hover:bg-accent/50 transition-colors">
                          <h4 className="font-semibold text-sm">{cert.name}</h4>
                          <span className="text-xs text-muted-foreground">{cert.issuer} • {cert.date}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Improved Work Experience */}
                {analysis.work_experience && analysis.work_experience.length > 0 && (
                  <Card className="border-primary/20">
                    <CardHeader className="bg-primary/5 pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Professional Experience (Optimized)
                      </CardTitle>
                      <CardDescription>AI-enhanced descriptions to maximize impact</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-6">
                      {analysis.work_experience.map((exp, idx) => (
                        <div key={idx} className="space-y-2 border-b last:border-0 pb-4 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-base">{exp.title}</h4>
                              <p className="text-sm font-medium text-muted-foreground">{exp.company}</p>
                            </div>
                            <span className="text-xs bg-muted px-2 py-1 rounded">{exp.duration}</span>
                          </div>

                          {exp.improved_description ? (
                            <div className="bg-muted/30 p-3 rounded-lg border border-border/50 text-sm italic text-foreground/80">
                              <p className="mb-1 text-xs font-semibold text-primary not-italic">Suggested Rewrite:</p>
                              {exp.improved_description}
                            </div>
                          ) : (
                            <p className="text-sm text-foreground/80">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Extracted Projects Section */}
                {analysis.projects && analysis.projects.length > 0 && (
                  <Card className="border-orange-500/20">
                    <CardHeader className="bg-orange-500/5 pb-4 border-b border-orange-500/10">
                      <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                        <Briefcase className="h-5 w-5" /> Key Projects & Technologies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 grid gap-4">
                      {analysis.projects.map((proj, idx) => (
                        <div key={idx} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-base text-foreground">{proj.name}</h4>
                            {proj.url && (
                              <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 text-primary hover:underline">
                                View <ChevronRight className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{proj.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {proj.tech_stack?.map((media, mId) => (
                              <Badge key={mId} variant="outline" className="text-[10px] px-2 py-0 h-5">
                                {media}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* AI Suggested Portfolio Projects */}
                {analysis.suggested_projects && analysis.suggested_projects.length > 0 && (
                  <Card className="border-indigo-500/20 shadow-sm bg-indigo-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                        <Sparkles className="h-4 w-4" />
                        Recommended Portfolio Projects for {jobKeywords ? jobKeywords.slice(0, 30) + (jobKeywords.length > 30 ? '...' : '') : (analysis.skills_analysis?.target_role_identified || "Target Role")}
                      </CardTitle>
                      <CardDescription>Build these to prove your skills for the role</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.suggested_projects.map((project: any, i: number) => (
                        <div key={i} className="p-3 bg-background border rounded-lg">
                          <h4 className="font-bold text-sm mb-1">{project.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {project.key_tech?.map((tech: string, t: number) => (
                              <Badge key={t} variant="secondary" className="text-[10px] h-5 px-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <Card className="border-amber-500/20 overflow-hidden">
                  <CardHeader className="bg-amber-500/5 pb-4 border-b border-amber-500/10">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <Zap className="h-5 w-5 text-amber-500" />
                      Target Job Matching
                    </CardTitle>
                    <CardDescription>Based on your profile strength and market trends</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 px-0">
                    <div className="divide-y">
                      {analysis?.matching_jobs?.map((job: any, i: number) => (
                        <div key={i} className="p-4 hover:bg-muted/30 transition-colors flex gap-4">
                          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold text-base">{job.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{job.reason}</p>
                          </div>
                        </div>
                      ))}
                      {(!analysis?.matching_jobs || analysis.matching_jobs.length === 0) && (
                        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                          <Briefcase className="h-8 w-8 opacity-20" />
                          <p>No job matches identified. Try adding more detail to your profile.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      100% Human-Form Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
                      <div className="relative p-5 bg-card border rounded-xl">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis?.optimized_summary}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute bottom-3 right-3 h-8 w-8 hover:bg-primary/10"
                          onClick={() => copyToClipboard(analysis?.optimized_summary || "")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-3">
                      <Target className="h-5 w-5 text-purple-500" />
                      ATS Best Practices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {analysis?.ats_tips?.map((tip: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
                          <div className="mt-1 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                          <p className="text-xs font-medium">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LinkedInAnalyzer;
