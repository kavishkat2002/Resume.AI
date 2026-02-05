import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target, CheckCircle, XCircle, Lightbulb, FolderGit2, TrendingUp, Github, Linkedin, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Project {
  name: string;
  relevance_score: number;
  reason: string;
}

interface SkillMatch {
  skill_match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  skill_sources: Record<string, string>;
  recommended_projects: Project[];
  improvement_suggestions: string[];
  priority_skills_to_learn: string[];
  overall_assessment: string;
}

const SkillsMatcher = () => {
  const locationState = useLocation().state;
  const [jobTitle, setJobTitle] = useState(() => localStorage.getItem("match_jobTitle") || "");
  const [jobSkills, setJobSkills] = useState(() => localStorage.getItem("match_jobSkills") || "");
  const [githubSkills, setGithubSkills] = useState(() => localStorage.getItem("match_githubSkills") || "");
  const [linkedinSkills, setLinkedinSkills] = useState(() => localStorage.getItem("match_linkedinSkills") || "");
  const [projects, setProjects] = useState(() => localStorage.getItem("match_projects") || "");
  const [match, setMatch] = useState<SkillMatch | null>(() => {
    const saved = localStorage.getItem("match_result");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("match_jobTitle", jobTitle);
    localStorage.setItem("match_jobSkills", jobSkills);
    localStorage.setItem("match_githubSkills", githubSkills);
    localStorage.setItem("match_linkedinSkills", linkedinSkills);
    localStorage.setItem("match_projects", projects);
    if (match) {
      localStorage.setItem("match_result", JSON.stringify(match));
    } else {
      localStorage.removeItem("match_result");
    }
  }, [jobTitle, jobSkills, githubSkills, linkedinSkills, projects, match]);

  useEffect(() => {
    if (locationState) {
      if (locationState.jobTitle && !jobTitle) setJobTitle(locationState.jobTitle);
      if (locationState.requiredSkills && !jobSkills) setJobSkills(locationState.requiredSkills);
    }
  }, [locationState, jobTitle, jobSkills]);

  const parseCommaSeparated = (text: string): string[] => {
    return text.split(",").map(s => s.trim()).filter(s => s.length > 0);
  };

  const parseProjects = (text: string): { name: string; description?: string }[] => {
    return text.split("\n").filter(line => line.trim()).map(line => {
      const parts = line.split("-");
      if (parts.length > 1) {
        const name = parts[0];
        const description = parts.slice(1).join("-");
        return { name: name.trim(), description: description.trim() };
      }
      return { name: line.trim() };
    });
  };

  const handleMatch = async () => {
    const parsedJobSkills = parseCommaSeparated(jobSkills);
    if (parsedJobSkills.length === 0) {
      toast.error("Please enter job required skills");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("match-skills", {
        body: {
          jobSkills: parsedJobSkills,
          githubSkills: parseCommaSeparated(githubSkills),
          linkedinSkills: parseCommaSeparated(linkedinSkills),
          projects: parseProjects(projects),
          jobTitle,
        },
      });

      if (error) throw error;
      setMatch(data);
      toast.success("Skills matched successfully!");
    } catch (error) {
      console.error("Error matching skills:", error);
      toast.error("Failed to match skills");
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getSourceIcon = (source: string) => {
    if (source === "github") return <Github className="h-3 w-3" />;
    if (source === "linkedin") return <Linkedin className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Skills Matcher</h1>
            <p className="text-muted-foreground">Compare your skills with job requirements</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Requirements</CardTitle>
              <CardDescription>Enter the skills required by the job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Job title (e.g., Senior Frontend Developer)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
              <Textarea
                placeholder="Required skills (comma-separated)&#10;e.g., React, TypeScript, Node.js, AWS, GraphQL"
                value={jobSkills}
                onChange={(e) => setJobSkills(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
              <CardDescription>Enter skills from your profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Github className="h-4 w-4" /> GitHub Skills
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) {
                        toast.error("Please login to fetch data");
                        return;
                      }

                      const { data, error } = await supabase
                        .from("github_data")
                        .select("extracted_skills, top_languages")
                        .eq("user_id", user.id)
                        .single();

                      if (error || !data) {
                        toast.error("No GitHub data found. Please run GitHub Analysis first.");
                        return;
                      }

                      const skills = [
                        ...(data.extracted_skills || []),
                        ...(data.top_languages || [])
                      ].join(", ");

                      const current = githubSkills ? githubSkills + ", " : "";
                      setGithubSkills(current + skills);
                      toast.success("Imported GitHub skills");
                    }}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Fetch from GitHub
                  </Button>
                </div>
                <Textarea
                  placeholder="Skills from GitHub analysis (comma-separated)&#10;e.g., JavaScript, React, Python, Docker"
                  value={githubSkills}
                  onChange={(e) => setGithubSkills(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Linkedin className="h-4 w-4" /> LinkedIn Skills
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) {
                        toast.error("Please login to fetch data");
                        return;
                      }

                      const { data, error } = await supabase
                        .from("linkedin_analyses" as any)
                        .select("core_skills, industry_keywords")
                        .eq("user_id", user.id)
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .single();

                      if (error || !data) {
                        toast.error("No LinkedIn data found. Please run LinkedIn Analysis first.");
                        return;
                      }

                      const linkedinData = data as any;
                      const skills = [
                        ...(linkedinData.core_skills || []),
                        ...(linkedinData.industry_keywords || [])
                      ].join(", ");

                      const current = linkedinSkills ? linkedinSkills + ", " : "";
                      setLinkedinSkills(current + skills);
                      toast.success("Imported LinkedIn skills");
                    }}
                    className="h-7 text-xs"
                  >
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Fetch from LinkedIn
                  </Button>
                </div>
                <Textarea
                  placeholder="Skills from LinkedIn analysis (comma-separated)&#10;e.g., Project Management, React, AWS"
                  value={linkedinSkills}
                  onChange={(e) => setLinkedinSkills(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>List your projects (one per line, format: Project Name - Description)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { data, error } = await supabase
                      .from("github_data")
                      .select("repositories, project_summaries")
                      .eq("user_id", user.id)
                      .single();

                    if (error || !data) {
                      toast.error("No GitHub projects found.");
                      return;
                    }

                    const existing = projects && projects.trim() ? projects + "\n\n" : "";
                    let projectText = "";

                    const summaries = (data as any).project_summaries;

                    if (summaries && Array.isArray(summaries) && summaries.length > 0) {
                      // USE RICH SUMMARIES
                      projectText = summaries.map((p: any) => {
                        let text = `${p.name} - ${p.suggested_resume_description || p.description}`;
                        if (p.tech_stack && p.tech_stack.length > 0) {
                          text += `\n   Tech Stack: ${p.tech_stack.join(", ")}`;
                        }
                        if (p.key_features && p.key_features.length > 0) {
                          text += `\n   Key Features: ${p.key_features.join(", ")}`;
                        }
                        return text;
                      }).join("\n\n");
                    } else if ((data as any).repositories) {
                      // FALLBACK TO RAW REPOS
                      projectText = ((data as any).repositories as any[])
                        .slice(0, 5) // Top 5
                        .map((repo: any) => `${repo.name} - ${repo.description || "No description"}`)
                        .join("\n");
                    }

                    if (!projectText) {
                      toast.error("No projects could be extracted.");
                      return;
                    }

                    setProjects(existing + projectText);
                    toast.success("Added GitHub projects with rich details");
                  }}
                  className="h-8 text-xs"
                >
                  <Github className="mr-2 h-3 w-3" />
                  Fetch Repos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { data, error } = await supabase
                      .from("linkedin_analyses" as any)
                      .select("experience_highlights")
                      .eq("user_id", user.id)
                      .order("created_at", { ascending: false })
                      .limit(1)
                      .single();

                    if (error || !data) {
                      toast.error("No LinkedIn experience found.");
                      return;
                    }

                    const linkedinData = data as any;
                    if (!linkedinData.experience_highlights) {
                      toast.error("No experience highlights found.");
                      return;
                    }

                    const existing = projects && projects.trim() ? projects + "\n" : "";
                    // Heuristic: treat each bullet point as a "project" or simply append them
                    const expText = (linkedinData.experience_highlights as string[])
                      .map((exp: string) => `LinkedIn Exp - ${exp}`)
                      .join("\n");

                    setProjects(existing + expText);
                    toast.success("Added LinkedIn experience");
                  }}
                  className="h-8 text-xs"
                >
                  <Linkedin className="mr-2 h-3 w-3" />
                  Fetch Exp
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="E-commerce Dashboard - React/TypeScript shopping admin panel&#10;API Gateway - Node.js microservices backend&#10;Portfolio Site - Next.js personal website"
              value={projects}
              onChange={(e) => setProjects(e.target.value)}
              className="min-h-[100px]"
            />
            <Button onClick={handleMatch} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Matching...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Match Skills
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {match && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Match Score</span>
                  <span className={`text-4xl font-bold ${getMatchColor(match.skill_match_percentage)}`}>
                    {match.skill_match_percentage}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={match.skill_match_percentage} className="h-4" />
                <p className="text-muted-foreground">{match.overall_assessment}</p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Matched Skills ({match.matched_skills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {match.matched_skills.map((skill, i) => (
                      <Badge key={i} variant="default" className="flex items-center gap-1">
                        {getSourceIcon(match.skill_sources[skill])}
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    Missing Skills ({match.missing_skills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {match.missing_skills.map((skill, i) => (
                      <Badge key={i} variant="destructive">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Priority to Learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {match.priority_skills_to_learn.map((skill, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-primary font-bold">{i + 1}.</span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderGit2 className="h-5 w-5 text-purple-500" />
                    Recommended Projects for Resume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {match.recommended_projects.map((project, i) => (
                      <li key={i} className="border-b pb-3 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{project.name}</span>
                          <Badge variant="secondary">{project.relevance_score}% match</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{project.reason}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {match.improvement_suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-bold">{i + 1}.</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default SkillsMatcher;
