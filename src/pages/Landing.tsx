import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText, Target, Sparkles, Send, CheckCircle, TrendingUp, Users } from "lucide-react";
import { Footer } from "@/components/Footer";

const Landing = () => {
  const steps = [
    {
      icon: FileText,
      title: "Analyze",
      description: "Paste your job description and let AI extract key requirements",
    },
    {
      icon: Target,
      title: "Match",
      description: "Compare your skills from GitHub & LinkedIn against job needs",
    },
    {
      icon: Sparkles,
      title: "Generate",
      description: "Create an ATS-optimized resume tailored to the role",
    },
    {
      icon: Send,
      title: "Apply",
      description: "Track applications and improve your score with each try",
    },
  ];

  const stats = [
    { value: "85%", label: "Average ATS Score Improvement" },
    { value: "3x", label: "More Interview Callbacks" },
    { value: "10min", label: "To Create Tailored Resume" },
  ];

  const features = [
    {
      icon: FileText,
      title: "Job Description Analyzer",
      description: "AI extracts keywords, skills, and requirements from any job posting",
    },
    {
      icon: Target,
      title: "Skills Matching Engine",
      description: "See exactly how your profile stacks up against job requirements",
    },
    {
      icon: Sparkles,
      title: "AI Resume Generator",
      description: "Generate ATS-friendly resumes optimized for each application",
    },
    {
      icon: TrendingUp,
      title: "ATS Score Calculator",
      description: "Get real-time feedback on your resume's compatibility score",
    },
    {
      icon: Users,
      title: "GitHub Integration",
      description: "Automatically analyze your projects and showcase relevant work",
    },
    {
      icon: CheckCircle,
      title: "Application Tracker",
      description: "Keep track of all your applications and their status",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">ResumAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Resume Optimization
          </div>
          <h1 className="text-3xl md:text-6xl font-bold mb-6 leading-tight">
            Land Your Dream Job with{" "}
            <span className="text-4xl md:text-6xl text-primary">ATS-Optimized</span> Resumes
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our AI analyzes job descriptions, matches your skills, and generates perfectly tailored resumes that pass ATS systems and impress recruiters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Start Free Today
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to create the perfect resume for any job
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Step {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed for job seekers at every level
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section with Black Theme Heading */}
      <section className="py-20 px-4 bg-zinc-950 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4 border border-blue-500/20">
                <Sparkles className="h-3 w-3" />
                Templates
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Premium Resume <span className="text-blue-500">Templates</span>
            </h1>
              <p className="text-zinc-400 text-lg">
                Our template library contains professionally crafted designs that pass through Applicant Tracking Systems 
                with ease while catching the eyes of human hiring managers.
              </p>
            </div>
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-none px-8 h-14 rounded-xl text-lg font-bold">
                View All Templates
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Professional Clean", type: "Tech-Focused", color: "from-blue-600 to-indigo-600" },
              { name: "Executive Suite", type: "Leadership", color: "from-purple-600 to-pink-600" },
              { name: "Elegant Centered", type: "Design & Arts", color: "from-amber-500 to-orange-600" }
            ].map((t, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all duration-500">
                <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <span className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">{t.type}</span>
                  <h3 className="text-2xl font-bold mb-4">{t.name}</h3>
                  <div className="h-1 w-12 bg-blue-500 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of job seekers who've improved their resume scores and landed more interviews.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
