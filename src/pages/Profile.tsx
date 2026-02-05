import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import {
  User,
  Briefcase,
  GraduationCap,
  Github,
  Linkedin,
  Save,
  Loader2,
  Plus,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Education {
  degree: string;
  institution: string;
  year: string;
  field: string;
  [key: string]: string;
}

interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  bullets: string[];
  [key: string]: string | string[];
}

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  portfolio_website: string;
  professional_summary: string;
  github_username: string;
  linkedin_url: string;
  linkedin_headline: string;
  linkedin_summary: string;
  education: Education[];
  work_experience: WorkExperience[];
  skills: string[];
  certifications: string[];
}

const Profile = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    portfolio_website: "",
    professional_summary: "",
    github_username: "",
    linkedin_url: "",
    linkedin_headline: "",
    linkedin_summary: "",
    education: [],
    work_experience: [],
    skills: [],
    certifications: [],
  });
  const [skillInput, setSkillInput] = useState("");
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

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { data: rawData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (rawData) {
      const data = rawData as any;
      setProfile({
        full_name: data.full_name || "",
        email: data.email || user.email || "",
        phone: data.phone || "",
        location: data.location || "",
        portfolio_website: data.portfolio_website || "",
        professional_summary: data.professional_summary || "",
        github_username: data.github_username || "",
        linkedin_url: data.linkedin_url || "",
        linkedin_headline: data.linkedin_headline || "",
        linkedin_summary: data.linkedin_summary || "",
        education: (data.education as unknown as Education[]) || [],
        work_experience: (data.work_experience as unknown as WorkExperience[]) || [],
        skills: data.skills || [],
        certifications: (data.certifications as unknown as string[]) || [],
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        // email is usually read-only or handled separately in auth, but if profile has contact email:
        // profile.email, 
        // actually profiles table usually has columns matching these names.
        // I will assume the columns exist. If not, the update will fail silently or with error.
        phone: profile.phone,
        location: profile.location,
        portfolio_website: profile.portfolio_website,
        professional_summary: profile.professional_summary,
        github_username: profile.github_username,
        linkedin_url: profile.linkedin_url,
        linkedin_headline: profile.linkedin_headline,
        linkedin_summary: profile.linkedin_summary,
        education: profile.education,
        work_experience: profile.work_experience,
        skills: profile.skills,
        certifications: profile.certifications,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Save failed",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
    }
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      education: [...profile.education, { degree: "", institution: "", year: "", field: "" }],
    });
  };

  const removeEducation = (index: number) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index),
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...profile.education];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, education: updated });
  };

  const addExperience = () => {
    setProfile({
      ...profile,
      work_experience: [
        ...profile.work_experience,
        { company: "", title: "", startDate: "", endDate: "", description: "", bullets: [] },
      ],
    });
  };

  const removeExperience = (index: number) => {
    setProfile({
      ...profile,
      work_experience: profile.work_experience.filter((_, i) => i !== index),
    });
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: string | string[]) => {
    const updated = [...profile.work_experience];
    updated[index] = { ...updated[index], [field]: value };
    setProfile({ ...profile, work_experience: updated });
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground">Manage your personal and professional information</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Profile
          </Button>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2 hidden sm:inline" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="experience">
              <Briefcase className="h-4 w-4 mr-2 hidden sm:inline" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="education">
              <GraduationCap className="h-4 w-4 mr-2 hidden sm:inline" />
              Education
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Github className="h-4 w-4 mr-2 hidden sm:inline" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Personal Info */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Basic information about you for resume generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Address</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio Website</Label>
                    <Input
                      id="portfolio"
                      value={profile.portfolio_website}
                      onChange={(e) => setProfile({ ...profile, portfolio_website: e.target.value })}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="personal-github">GitHub Profile</Label>
                    <Input
                      id="personal-github"
                      value={profile.github_username}
                      onChange={(e) => {
                        const val = e.target.value;
                        let username = val;
                        if (val.includes("github.com/")) {
                          username = val.split("github.com/")[1].split("/")[0];
                        }
                        setProfile({ ...profile, github_username: username });
                      }}
                      placeholder="username or github.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personal-linkedin">LinkedIn Profile</Label>
                    <Input
                      id="personal-linkedin"
                      value={profile.linkedin_url}
                      onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={profile.professional_summary}
                    onChange={(e) => setProfile({ ...profile, professional_summary: e.target.value })}
                    placeholder="A brief overview of your professional background and goals..."
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Add a skill"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Experience */}
          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Work Experience</CardTitle>
                    <CardDescription>
                      Add your work history for resume generation
                    </CardDescription>
                  </div>
                  <Button onClick={addExperience}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.work_experience.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No work experience added yet</p>
                    <Button variant="outline" className="mt-4" onClick={addExperience}>
                      Add Your First Job
                    </Button>
                  </div>
                ) : (
                  profile.work_experience.map((exp, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Position {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExperience(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(index, "company", e.target.value)}
                            placeholder="Company Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Job Title</Label>
                          <Input
                            value={exp.title}
                            onChange={(e) => updateExperience(index, "title", e.target.value)}
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            value={exp.startDate}
                            onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                            placeholder="Jan 2023"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            value={exp.endDate}
                            onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                            placeholder="Present"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description / Key Achievements</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(index, "description", e.target.value)}
                          placeholder="Describe your responsibilities and achievements..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education */}
          <TabsContent value="education">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>
                      Add your educational background
                    </CardDescription>
                  </div>
                  <Button onClick={addEducation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.education.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No education added yet</p>
                    <Button variant="outline" className="mt-4" onClick={addEducation}>
                      Add Education
                    </Button>
                  </div>
                ) : (
                  profile.education.map((edu, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeEducation(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                            placeholder="Bachelor's Degree"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Field of Study</Label>
                          <Input
                            value={edu.field}
                            onChange={(e) => updateEducation(index, "field", e.target.value)}
                            placeholder="Computer Science"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(index, "institution", e.target.value)}
                            placeholder="University Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Graduation Year</Label>
                          <Input
                            value={edu.year}
                            onChange={(e) => updateEducation(index, "year", e.target.value)}
                            placeholder="2024"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              {/* GitHub */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    GitHub Integration
                  </CardTitle>
                  <CardDescription>
                    Connect your GitHub to analyze your projects and skills
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub Username or URL</Label>
                    <Input
                      id="github"
                      value={profile.github_username}
                      onChange={(e) => {
                        const val = e.target.value;
                        let username = val;
                        if (val.includes("github.com/")) {
                          username = val.split("github.com/")[1].split("/")[0];
                        }
                        setProfile({ ...profile, github_username: username });
                      }}
                      placeholder="username or https://github.com/username"
                    />
                  </div>
                  {profile.github_username && (
                    <Link to="/github">
                      <Button variant="outline">
                        Analyze Repositories
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* LinkedIn */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Linkedin className="h-5 w-5" />
                    LinkedIn Data
                  </CardTitle>
                  <CardDescription>
                    Paste your LinkedIn information to enhance your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn Public URL</Label>
                    <Input
                      id="linkedinUrl"
                      value={profile.linkedin_url}
                      onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                      placeholder="https://www.linkedin.com/in/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinHeadline">Professional Headline</Label>
                    <Input
                      id="linkedinHeadline"
                      value={profile.linkedin_headline}
                      onChange={(e) => setProfile({ ...profile, linkedin_headline: e.target.value })}
                      placeholder="Software Engineer at Company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinSummary">About / Summary</Label>
                    <Textarea
                      id="linkedinSummary"
                      value={profile.linkedin_summary}
                      onChange={(e) => setProfile({ ...profile, linkedin_summary: e.target.value })}
                      placeholder="Paste your LinkedIn summary here..."
                      className="min-h-[150px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout >
  );
};

export default Profile;
