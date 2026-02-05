import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import {
    Sparkles,
    Github,
    Loader2,
    GitFork,
    Code,
    CheckCircle,
    ExternalLink,
    Save,
    Star,
    RotateCcw,
    AlertTriangle,
    Lightbulb,
    Target
} from "lucide-react";
import { Link } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

interface Repository {
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    topics: string[];
    url: string;
    updated_at: string;
    [key: string]: string | number | string[] | null;
}

interface ProjectSummary {
    name: string;
    description: string;
    skills: string[];
    relevance_score: number;
    suggested_resume_description?: string; // Keep optional for backward compatibility
    resume_bullets?: string[];
}

interface AnalysisResult {
    username: string;
    repositories: Repository[];
    analysis: {
        top_languages: string[];
        extracted_skills: string[];
        project_summaries: ProjectSummary[];
        skill_to_project_mapping: Record<string, string[]>;
        recommended_projects: string[];
        role_alignment: string;
        seo_skills: string[];
        repo_critiques: Record<string, string[]>;
        new_project_idea?: {
            name: string;
            description: string;
            tech_stack: string[];
            why_this_project: string;
            resume_bullets?: string[];
        };
    };
}

const GitHubAnalyzer = () => {
    const locationState = useLocation().state;
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState(() => localStorage.getItem("github_username") || "");
    const [targetJob, setTargetJob] = useState(() => localStorage.getItem("github_targetJob") || locationState?.jobTitle || "");
    const [analyzing, setAnalyzing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(() => {
        const saved = localStorage.getItem("github_result");
        return saved ? JSON.parse(saved) : null;
    });
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        localStorage.setItem("github_username", username);
        localStorage.setItem("github_targetJob", targetJob);
        if (result) {
            localStorage.setItem("github_result", JSON.stringify(result));
        } else {
            localStorage.removeItem("github_result");
        }
    }, [username, targetJob, result]);

    useEffect(() => {
        if (locationState?.jobTitle && !targetJob) {
            setTargetJob(locationState.jobTitle);
        }
    }, [locationState, targetJob]);

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

    const loadSavedUsername = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from("profiles")
            .select("github_username")
            .eq("user_id", user.id)
            .single();

        if (data?.github_username) {
            setUsername(data.github_username);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadSavedUsername();
        }
    }, [user, loadSavedUsername]);

    const handleAnalyze = async () => {
        // Extract username if user pasted a full URL
        let cleanUsername = username.trim();
        if (cleanUsername.includes("github.com/")) {
            cleanUsername = cleanUsername.split("github.com/")[1].split("/")[0];
        } else if (cleanUsername.startsWith("http")) {
            // specific handling if they pasted some other URL, but generally just try to grab the last part if it looks like a url
            const parts = cleanUsername.split("/");
            cleanUsername = parts[parts.length - 1] || cleanUsername;
        }

        if (!cleanUsername) {
            toast({
                title: "Invalid Username",
                description: "Please enter a valid GitHub username.",
                variant: "destructive",
            });
            return;
        }

        setAnalyzing(true);
        setResult(null);
        setSelectedProjects([]);

        try {
            // DIRECT FETCH DEBUGGING
            const { data: { session } } = await supabase.auth.getSession();
            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-github`;

            console.log("Calling function URL:", functionUrl);
            console.log("Analyzing username:", cleanUsername);

            const response = await fetch(functionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({ username: cleanUsername, targetJobTitle: targetJob || undefined }),
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Function error text:", errorText);
                throw new Error(`Server returned ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            setResult(data);
            // Pre-select recommended projects
            if (data.analysis?.recommended_projects) {
                setSelectedProjects(data.analysis.recommended_projects);
            }
            toast({
                title: "Analysis complete",
                description: `Analyzed ${data.repositories?.length || 0} repositories.`,
            });
        } catch (error: any) {
            console.error("Analysis error:", error);
            toast({
                title: "Analysis failed",
                description: error.message || "Failed to analyze GitHub profile.",
                variant: "destructive",
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!result || !user) return;

        setSaving(true);

        try {
            // Save to github_data table
            const { error: githubError } = await (supabase as any)
                .from("github_data")
                .upsert({
                    user_id: user.id,
                    username: result.username,
                    repositories: result.repositories,
                    top_languages: result.analysis.top_languages,
                    extracted_skills: result.analysis.extracted_skills,
                    project_summaries: result.analysis.project_summaries,
                    last_synced_at: new Date().toISOString(),
                }, { onConflict: "user_id" });

            if (githubError) throw githubError;

            // Update profile with github username
            await supabase
                .from("profiles")
                .update({ github_username: result.username })
                .eq("user_id", user.id);

            toast({
                title: "Saved successfully",
                description: "GitHub data has been saved to your profile.",
            });
        } catch (error: any) {
            console.error("Save error:", error);
            toast({
                title: "Save failed",
                description: error.message || "Failed to save GitHub data.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleProject = (projectName: string) => {
        setSelectedProjects(prev =>
            prev.includes(projectName)
                ? prev.filter(p => p !== projectName)
                : [...prev, projectName]
        );
    };

    const handleReset = () => {
        localStorage.removeItem("github_username");
        localStorage.removeItem("github_targetJob");
        localStorage.removeItem("github_result");

        setUsername("");
        setTargetJob("");
        setResult(null);
        setSelectedProjects([]);

        toast({
            title: "Analyzer reset",
            description: "Form and results have been cleared."
        });
    };

    return (
        <AppLayout>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Analyze Your GitHub Profile</h1>
                        <p className="text-muted-foreground">
                            We'll analyze your public repositories to identify skills and recommend projects for your resume.
                        </p>
                    </div>
                    <Button variant="ghost" onClick={handleReset} className="text-muted-foreground hover:text-destructive shrink-0">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Analyzer
                    </Button>
                </div>

                {/* Input Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Github className="h-5 w-5" />
                            GitHub Username
                        </CardTitle>
                        <CardDescription>
                            Enter your GitHub username to analyze your public repositories
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">GitHub Username</label>
                                <Input
                                    placeholder="e.g., octocat"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Target Job Role (optional)</label>
                                <Input
                                    placeholder="e.g., Frontend Developer"
                                    value={targetJob}
                                    onChange={(e) => setTargetJob(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleAnalyze}
                            disabled={analyzing || !username.trim()}
                            className="w-full sm:w-auto"
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Analyze Repositories
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results Section */}
                {result && (
                    <div className="space-y-6 animate-in fade-in-50 duration-500">
                        {/* Summary Card */}
                        {/* Summary Card */}
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-medium text-primary">Analysis Complete</span>
                                        </div>
                                        <h2 className="text-2xl font-bold">@{result.username}</h2>
                                        <p className="text-muted-foreground">
                                            {result.repositories.length} repositories analyzed
                                        </p>
                                    </div>
                                    <Button onClick={handleSave} disabled={saving}>
                                        {saving ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-2 h-4 w-4" />
                                        )}
                                        Save to Profile
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* NO MATCH ALERT */}
                        {(!result.analysis.recommended_projects || result.analysis.recommended_projects.length === 0) && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-red-700">No Matching Projects Found</h3>
                                    <p className="text-sm text-red-600/90 mt-1">
                                        We couldn't find any existing repositories that strongly match the <strong>{targetJob || "Target Role"}</strong>.
                                        You highly needed a portfolio project to get hired. See the recommendation below.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Role Alignment */}
                        {result.analysis.role_alignment && (
                            <div className="grid gap-6">
                                <Card className="border-green-500/20 shadow-sm bg-green-500/5">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                                            <Target className="h-5 w-5" />
                                            Target Role Alignment
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-foreground/80">{result.analysis.role_alignment}</p>

                                        {result.analysis.seo_skills && result.analysis.seo_skills.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase">Missing High-Value SEO Skills</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.analysis.seo_skills.map((skill, i) => (
                                                        <Badge key={i} variant="outline" className="border-red-500/30 text-red-600 bg-background">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {result.analysis.new_project_idea && (
                                    <Card className="border-purple-500/20 shadow-sm bg-purple-500/5">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
                                                <Lightbulb className="h-5 w-5" />
                                                The "Killer" Portfolio Project Idea
                                            </CardTitle>
                                            <CardDescription>Build this to prove you are ready for the role</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <h3 className="font-bold text-xl mb-1">{result.analysis.new_project_idea.name}</h3>
                                                <p className="text-muted-foreground">{result.analysis.new_project_idea.description}</p>
                                            </div>
                                            <div className="bg-background/50 p-3 rounded-lg border border-purple-500/10">
                                                <p className="text-sm font-semibold text-purple-800 mb-1">Why this gets you hired:</p>
                                                <p className="text-sm italic">{result.analysis.new_project_idea.why_this_project}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {result.analysis.new_project_idea.tech_stack.map((tech, i) => (
                                                    <Badge key={i} className="bg-purple-600 hover:bg-purple-700">{tech}</Badge>
                                                ))}
                                            </div>

                                            {result.analysis.new_project_idea.resume_bullets && result.analysis.new_project_idea.resume_bullets.length > 0 && (
                                                <div className="bg-background/50 p-3 rounded-lg border border-purple-500/10 mt-2">
                                                    <p className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                                                        <Lightbulb className="h-3 w-3" />
                                                        How to describe this on your resume:
                                                    </p>
                                                    <ul className="space-y-1.5">
                                                        {result.analysis.new_project_idea.resume_bullets.map((bullet, bIndex) => (
                                                            <li key={bIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                <CheckCircle className="h-3 w-3 text-purple-500 mt-1 shrink-0" />
                                                                <span>{bullet}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Top Languages & Skills */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Code className="h-5 w-5 text-blue-500" />
                                        Top Languages
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {result.analysis.top_languages.map((lang, index) => (
                                            <Badge key={index} variant="secondary" className="bg-blue-500/10 text-blue-500">
                                                {lang}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        Extracted Skills
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {result.analysis.extracted_skills.map((skill, index) => (
                                            <Badge key={index} className="bg-primary/10 text-primary">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Project Summaries */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recommended Projects for Resume</CardTitle>
                                <CardDescription>
                                    Select projects to include in your resume. Recommended projects are pre-selected.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.analysis.project_summaries.map((project, index) => {
                                    const isSelected = selectedProjects.includes(project.name);
                                    const isRecommended = result.analysis.recommended_projects.includes(project.name);

                                    return (
                                        <div
                                            key={index}
                                            className={`border rounded-lg p-4 transition-colors ${isSelected ? "border-primary bg-primary/5" : "border-border"
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleProject(project.name)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <h4 className="font-semibold">{project.name}</h4>
                                                        {isRecommended && (
                                                            <Badge variant="secondary" className="bg-green-500/10 text-green-500 text-xs">
                                                                Recommended
                                                            </Badge>
                                                        )}
                                                        <Badge variant="outline" className="text-xs">
                                                            Relevance: {project.relevance_score}/10
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                                                    <div className="bg-muted/50 rounded p-3 mb-2 border border-border/50">
                                                        <p className="text-sm font-medium mb-2 flex items-center gap-2 text-primary">
                                                            <Lightbulb className="h-3 w-3" />
                                                            Suggested Resume Bullets:
                                                        </p>
                                                        {project.resume_bullets && project.resume_bullets.length > 0 ? (
                                                            <ul className="space-y-1.5">
                                                                {project.resume_bullets.map((bullet, bIndex) => (
                                                                    <li key={bIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                                                                        <span>{bullet}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-sm italic text-muted-foreground">{project.suggested_resume_description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {project.skills.map((skill, skillIndex) => (
                                                            <Badge key={skillIndex} variant="outline" className="text-xs">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Raw Repositories */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Repositories</CardTitle>
                                <CardDescription>
                                    Your public repositories sorted by last updated
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    {result.repositories.slice(0, 10).map((repo, index) => {
                                        const critiques = result.analysis.repo_critiques?.[repo.name] || [];

                                        return (
                                            <div key={index} className="flex flex-col border-b border-border pb-4 last:border-0 last:pb-0 gap-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <a
                                                                href={repo.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-medium hover:text-primary transition-colors flex items-center gap-1"
                                                            >
                                                                {repo.name}
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                            {repo.language && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {repo.language}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {repo.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">{repo.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-4 w-4" />
                                                            {repo.stars}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <GitFork className="h-4 w-4" />
                                                            {repo.forks}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* AI Critique Section */}
                                                {critiques.length > 0 && (
                                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-md p-3 text-sm">
                                                        <p className="font-semibold text-orange-600 flex items-center gap-2 mb-2">
                                                            <AlertTriangle className="h-4 w-4" />
                                                            Recommendations to reach Senior Level:
                                                        </p>
                                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                                            {critiques.map((critique, i) => (
                                                                <li key={i}>{critique}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next Steps */}
                        <Card className="bg-muted/50">
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4">What's Next?</h3>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link to="/resume" className="flex-1">
                                        <Button className="w-full">
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate Resume with These Projects
                                        </Button>
                                    </Link>
                                    <Link to="/skills" className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            Match Skills to Jobs
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default GitHubAnalyzer;
