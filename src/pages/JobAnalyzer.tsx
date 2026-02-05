import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import {
  Sparkles,
  FileText,
  Loader2,
  CheckCircle,
  Save,
  Briefcase,
  Code,
  Users,
  Star,
  Plus,
  Target,
  Linkedin,
  RotateCcw
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@supabase/supabase-js";

interface AnalysisResult {
  job_title: string;
  experience_level: string;
  required_skills: string[];
  preferred_skills: string[];
  tools: string[];
  soft_skills: string[];
  responsibilities: string[];
  keywords: string[];
  [key: string]: string | string[];
}

const JobAnalyzer = () => {
  const [user, setUser] = useState<User | null>(null);
  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem("job_description") || "");
  const [companyName, setCompanyName] = useState(() => localStorage.getItem("job_companyName") || "");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedJobId, setSavedJobId] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(() => {
    const saved = localStorage.getItem("job_analysis_result");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem("job_description", jobDescription);
    localStorage.setItem("job_companyName", companyName);
    if (result) {
      localStorage.setItem("job_analysis_result", JSON.stringify(result));
    } else {
      localStorage.removeItem("job_analysis_result");
    }
  }, [jobDescription, companyName, result]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please paste a job description to analyze.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setSavedJobId(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-job", {
        body: { jobDescription },
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Analysis complete",
        description: "Job description has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze job description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAndTrack = async (status: "saved" | "applied" = "saved") => {
    if (!result || !user) return;

    setSaving(true);

    try {
      // First save the job
      const { data: jobData, error: jobError } = await supabase.from("jobs").insert([{
        user_id: user.id,
        job_title: result.job_title,
        company_name: companyName || null,
        job_description: jobDescription,
        required_skills: result.required_skills,
        preferred_skills: result.preferred_skills,
        tools: result.tools,
        soft_skills: result.soft_skills,
        experience_level: result.experience_level,
        responsibilities: result.responsibilities,
        keywords: result.keywords,
        analysis_data: result,
      }]).select("id").single();

      if (jobError) throw jobError;

      // Then create an application entry
      const { error: appError } = await supabase.from("applications").insert([{
        user_id: user.id,
        job_id: jobData.id,
        status: status,
        applied_date: status === "applied" ? new Date().toISOString().split("T")[0] : null,
      }]);

      if (appError) throw appError;

      setSavedJobId(jobData.id);

      toast({
        title: status === "applied" ? "Marked as Applied!" : "Added to Tracker!",
        description: `${result.job_title}${companyName ? ` at ${companyName}` : ""} has been added to your applications.`,
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const exampleJobDescription = `Frontend Developer
  
We are looking for a skilled Frontend Developer to join our team. 

Requirements:
- 2+ years of experience with React and TypeScript
- Strong understanding of HTML, CSS, and JavaScript
- Experience with REST APIs and state management (Redux, Zustand)
- Familiarity with Git and agile methodologies

Nice to have:
- Experience with Next.js or similar frameworks
- Knowledge of testing frameworks (Jest, Cypress)
- UI/UX design sensibility

Responsibilities:
- Build responsive web applications
- Collaborate with designers and backend developers
- Write clean, maintainable code
- Participate in code reviews`;

  const handleReset = () => {
    localStorage.removeItem("job_description");
    localStorage.removeItem("job_companyName");
    localStorage.removeItem("job_analysis_result");

    setJobDescription("");
    setCompanyName("");
    setResult(null);
    setSavedJobId(null);

    toast({
      title: "Analyzer reset",
      description: "Job form and results have been cleared."
    });
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analyze Job Description</h1>
            <p className="text-muted-foreground">
              Paste a job description and our AI will extract key requirements, skills, and ATS keywords.
            </p>
          </div>
          <Button variant="ghost" onClick={handleReset} className="text-muted-foreground hover:text-destructive shrink-0">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Analyzer
          </Button>
        </div>

        <div className="grid gap-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Description
              </CardTitle>
              <CardDescription>
                Paste the full job description below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name (optional)</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g., Google, Microsoft"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Paste the job description here..."
                className="min-h-[300px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || !jobDescription.trim()}
                  className="flex-1"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Job
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setJobDescription(exampleJobDescription)}
                >
                  Try Example
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              {/* Header */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-primary">Analysis Complete</span>
                      </div>
                      <h2 className="text-2xl font-bold">{result.job_title}</h2>
                      {companyName && (
                        <p className="text-muted-foreground">{companyName}</p>
                      )}
                      <Badge variant="secondary" className="mt-2">
                        {result.experience_level}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {savedJobId ? (
                        <Button variant="outline" onClick={() => navigate("/applications")}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          View in Tracker
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button disabled={saving}>
                              {saving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="mr-2 h-4 w-4" />
                              )}
                              Track Application
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSaveAndTrack("saved")}>
                              <Save className="mr-2 h-4 w-4" />
                              Save for Later
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSaveAndTrack("applied")}>
                              <Briefcase className="mr-2 h-4 w-4" />
                              Mark as Applied
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Required Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Code className="h-5 w-5 text-red-500" />
                      Required Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.required_skills.map((skill, index) => (
                        <Badge key={index} variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Preferred Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Preferred Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.preferred_skills.length > 0 ? (
                        result.preferred_skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">None specified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tools & Technologies */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Briefcase className="h-5 w-5 text-blue-500" />
                      Tools & Technologies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.tools.map((tool, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Soft Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-green-500" />
                      Soft Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.soft_skills.length > 0 ? (
                        result.soft_skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">None specified</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ATS Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    ATS Keywords
                  </CardTitle>
                  <CardDescription>
                    These keywords are most important for passing ATS screening
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, index) => (
                      <Badge key={index} className="bg-primary/10 text-primary hover:bg-primary/20">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Responsibilities */}
              {result.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Key Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-1 shrink-0" />
                          <span className="text-sm">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Next Steps */}
              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">What's Next?</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/resume"
                      state={{
                        jobTitle: result.job_title,
                        keywords: result.keywords.join(", "),
                        skills: result.required_skills.join(", ")
                      }}
                      className="flex-1"
                    >
                      <Button className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Resume
                      </Button>
                    </Link>
                    <Link
                      to="/skills"
                      state={{
                        jobTitle: result.job_title,
                        requiredSkills: result.required_skills.join(", ")
                      }}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        <Target className="mr-2 h-4 w-4" />
                        Match Skills
                      </Button>
                    </Link>
                    <Link
                      to="/linkedin"
                      state={{
                        jobKeywords: result.keywords.join(", ")
                      }}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full border-blue-200 hover:bg-blue-50">
                        <Linkedin className="mr-2 h-4 w-4 text-blue-500" />
                        Optimize LinkedIn
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default JobAnalyzer;
