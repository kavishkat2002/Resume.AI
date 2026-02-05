import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { 
  FileText, 
  Target, 
  TrendingUp,
  ChevronRight,
  User as UserIcon,
  Github,
  Linkedin,
  FileCheck,
  BarChart3,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Circle
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [stats, setStats] = useState({
    totalResumes: 0,
    avgAtsScore: 0,
    jobsAnalyzed: 0,
    profileComplete: 0,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    const { count: resumeCount } = await supabase
      .from("resumes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { count: jobCount } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const { data: resumes } = await supabase
      .from("resumes")
      .select("ats_score")
      .eq("user_id", user.id);

    const avgScore = resumes && resumes.length > 0
      ? Math.round(resumes.reduce((acc, r) => acc + (r.ats_score || 0), 0) / resumes.length)
      : 0;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    let profileComplete = 0;
    if (profile) {
      const fields = ['full_name', 'location', 'professional_summary', 'github_username'];
      const filled = fields.filter(f => profile[f as keyof typeof profile]).length;
      profileComplete = Math.round((filled / fields.length) * 100);
    }

    setStats({
      totalResumes: resumeCount || 0,
      avgAtsScore: avgScore,
      jobsAnalyzed: jobCount || 0,
      profileComplete,
    });
  };

  const workflowSteps = [
    { number: 1, title: "Analyze Job", description: "Extract keywords from job description", href: "/analyze", icon: FileText, done: stats.jobsAnalyzed > 0 },
    { number: 2, title: "Connect Profiles", description: "Analyze GitHub & LinkedIn", href: "/github", icon: Github, done: false },
    { number: 3, title: "Match Skills", description: "Compare your skills with requirements", href: "/skills", icon: Target, done: false },
    { number: 4, title: "Build Resume", description: "Generate ATS-optimized resume", href: "/resume", icon: FileCheck, done: stats.totalResumes > 0 },
    { number: 5, title: "Check Score", description: "Calculate your ATS compatibility", href: "/ats-score", icon: BarChart3, done: false },
  ];

  const features = [
    { title: "Job Analyzer", description: "AI-powered keyword extraction", href: "/analyze", icon: FileText, color: "bg-blue-500/10 text-blue-500" },
    { title: "GitHub Analysis", description: "Extract skills from repos", href: "/github", icon: Github, color: "bg-gray-500/10 text-gray-500" },
    { title: "LinkedIn Analysis", description: "Optimize your profile", href: "/linkedin", icon: Linkedin, color: "bg-sky-500/10 text-sky-500" },
    { title: "Skills Matcher", description: "Find skill gaps", href: "/skills", icon: Target, color: "bg-green-500/10 text-green-500" },
    { title: "Resume Builder", description: "ATS-friendly resumes", href: "/resume", icon: FileCheck, color: "bg-purple-500/10 text-purple-500" },
    { title: "ATS Score", description: "Check compatibility", href: "/ats-score", icon: BarChart3, color: "bg-orange-500/10 text-orange-500" },
    { title: "Learning Path", description: "Improve your skills", href: "/learn", icon: GraduationCap, color: "bg-pink-500/10 text-pink-500" },
    { title: "Profile", description: "Manage your data", href: "/profile", icon: UserIcon, color: "bg-indigo-500/10 text-indigo-500" },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground">
            Your AI-powered resume optimization dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resumes Created</p>
                  <p className="text-3xl font-bold">{stats.totalResumes}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg ATS Score</p>
                  <p className="text-3xl font-bold">{stats.avgAtsScore}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jobs Analyzed</p>
                  <p className="text-3xl font-bold">{stats.jobsAnalyzed}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">Profile</p>
                  <p className="text-3xl font-bold">{stats.profileComplete}%</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <Progress value={stats.profileComplete} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Workflow Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Resume Optimization Workflow
            </CardTitle>
            <CardDescription>Follow these steps to create the perfect ATS-optimized resume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {workflowSteps.map((step, index) => (
                <Link
                  key={step.number}
                  to={step.href}
                  className="flex-1 w-full md:w-auto"
                >
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      step.done ? "bg-green-500 text-white" : "bg-muted"
                    }`}>
                      {step.done ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="font-semibold">{step.number}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{step.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground hidden md:block" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Features Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">All Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Link to={feature.href} key={feature.title}>
                <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-10 w-10 rounded-lg ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        {stats.totalResumes === 0 && stats.jobsAnalyzed === 0 && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold mb-2">Ready to Get Started?</h3>
                  <p className="text-muted-foreground mb-4">
                    Begin by analyzing a job description. Our AI will extract keywords and requirements to help you build the perfect resume.
                  </p>
                  <Link to="/analyze">
                    <Badge className="cursor-pointer px-4 py-2 text-sm">
                      Start with Job Analysis <ArrowRight className="ml-2 h-4 w-4 inline" />
                    </Badge>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
