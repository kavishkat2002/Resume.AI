import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, Download, Copy, Sparkles, User, Briefcase, GraduationCap, FolderGit2, Edit, Save, History, Clock, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import html2canvas from 'html2canvas';
import { ModernTemplate, ClassicTemplate, SimpleTemplate, ElegantTemplate, TEMPLATE_OPTIONS, generateATSHTML, generateCoverLetterHTML, type TemplateId, type ResumeData } from '@/components/resume-templates';
import { useRef } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, SectionType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

const ResumeBuilder = () => {
  const locationState = useLocation().state;
  // 1. Initialize states from localStorage if available
  const [fullName, setFullName] = useState(() => localStorage.getItem("resume_fullName") || "");
  const [email, setEmail] = useState(() => localStorage.getItem("resume_email") || "");
  const [phone, setPhone] = useState(() => localStorage.getItem("resume_phone") || "");
  const [github, setGithub] = useState(() => localStorage.getItem("resume_github") || "");
  const [linkedin, setLinkedin] = useState(() => localStorage.getItem("resume_linkedin") || "");
  const [portfolio, setPortfolio] = useState(() => localStorage.getItem("resume_portfolio") || "");
  const [location, setLocation] = useState(() => localStorage.getItem("resume_location") || "");
  const [jobTitle, setJobTitle] = useState(() => localStorage.getItem("resume_jobTitle") || "");
  const [companyName, setCompanyName] = useState(() => localStorage.getItem("resume_companyName") || "");
  const [jobKeywords, setJobKeywords] = useState(() => localStorage.getItem("resume_jobKeywords") || "");
  const [skills, setSkills] = useState(() => localStorage.getItem("resume_skills") || "");
  const [projects, setProjects] = useState(() => localStorage.getItem("resume_projects") || "");
  const [experience, setExperience] = useState(() => localStorage.getItem("resume_experience") || "");
  const [education, setEducation] = useState(() => localStorage.getItem("resume_education") || "");
  const [resume, setResume] = useState(() => localStorage.getItem("resume_resumeText") || "");
  const [coverLetter, setCoverLetter] = useState(() => localStorage.getItem("resume_coverLetter") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem("resume_jobDescription") || "");
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [isEditingCoverLetter, setIsEditingCoverLetter] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("pdf_modern");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | 'txt' | 'docx'>('modern');
  const templateRef = useRef<HTMLDivElement>(null);
  const [resumeHistory, setResumeHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(() => localStorage.getItem("resume_currentResumeId"));
  const [isAddingToTracker, setIsAddingToTracker] = useState(false);
  const [activeTab, setActiveTab] = useState("resume");
  const [clCompanyName, setClCompanyName] = useState(() => localStorage.getItem("cl_companyName") || "");
  const [clRequirements, setClRequirements] = useState(() => localStorage.getItem("cl_requirements") || "");
  const [clResumeContext, setClResumeContext] = useState(() => localStorage.getItem("cl_resumeContext") || "");

  // 2. Persist states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("resume_fullName", fullName);
    localStorage.setItem("resume_email", email);
    localStorage.setItem("resume_phone", phone);
    localStorage.setItem("resume_github", github);
    localStorage.setItem("resume_linkedin", linkedin);
    localStorage.setItem("resume_portfolio", portfolio);
    localStorage.setItem("resume_location", location);
    localStorage.setItem("resume_jobTitle", jobTitle);
    localStorage.setItem("resume_companyName", companyName);
    localStorage.setItem("resume_jobKeywords", jobKeywords);
    localStorage.setItem("resume_skills", skills);
    localStorage.setItem("resume_projects", projects);
    localStorage.setItem("resume_experience", experience);
    localStorage.setItem("resume_education", education);
    localStorage.setItem("resume_resumeText", resume);
    localStorage.setItem("resume_coverLetter", coverLetter);
    localStorage.setItem("resume_jobDescription", jobDescription);
    localStorage.setItem("cl_companyName", clCompanyName);
    localStorage.setItem("cl_requirements", clRequirements);
    localStorage.setItem("cl_resumeContext", clResumeContext);
    if (currentResumeId) {
      localStorage.setItem("resume_currentResumeId", currentResumeId);
    } else {
      localStorage.removeItem("resume_currentResumeId");
    }
  }, [fullName, email, phone, github, linkedin, portfolio, location, jobTitle, companyName, jobKeywords, skills, projects, experience, education, resume, coverLetter, jobDescription, currentResumeId]);

  useEffect(() => {
    if (locationState) {
      if (locationState.jobTitle) setJobTitle(locationState.jobTitle);
      if (locationState.keywords) {
        // Append keywords from navigation state if they don't exist
        setJobKeywords(prev => {
          if (!prev) return locationState.keywords;
          const currentSet = new Set(prev.split(",").map(k => k.trim().toLowerCase()));
          const newK = (locationState.keywords as string).split(",").map((k: string) => k.trim());
          const toAdd = newK.filter((k: string) => !currentSet.has(k.toLowerCase()));
          return toAdd.length > 0 ? prev + ", " + toAdd.join(", ") : prev;
        });
      }
      if (locationState.skills) {
        setSkills(prev => {
          if (!prev) return (locationState.skills as string);
          const currentSet = new Set(prev.split(",").map(k => k.trim().toLowerCase()));
          const newS = (locationState.skills as string).split(",").map((k: string) => k.trim());
          const toAdd = newS.filter((k: string) => !currentSet.has(k.toLowerCase()));
          return toAdd.length > 0 ? prev + ", " + toAdd.join(", ") : prev;
        });
      }
    }
    fetchUserData();
    fetchResumeHistory();
  }, [locationState]);



  const fetchUserData = async (forceRefresh = false) => {
    setIsFetchingProfile(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Fetch Profile Info
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        const p = profile as any;
        if (!fullName || forceRefresh) setFullName(p.full_name || "");
        if (!email || forceRefresh) setEmail(p.email || "");
        if (!location || forceRefresh) setLocation(p.location || "");
        if (!phone || forceRefresh) setPhone(p.phone || "");
        if (!portfolio || forceRefresh) setPortfolio(p.portfolio_website || "");
        if (!linkedin || forceRefresh) setLinkedin(p.linkedin_url || "");
        if (!github || forceRefresh) {
          if (p.github_username) {
            setGithub(p.github_username.includes("github.com") ? p.github_username : `github.com/${p.github_username}`);
          }
        }

        if ((!education || forceRefresh) && profile.education && Array.isArray(profile.education)) {
          const eduText = profile.education
            .map((edu: any) => `${edu.degree}, ${edu.institution}, ${edu.year || ""}`)
            .join("\n");
          setEducation(eduText);
        }
      }

      const targetTitle = jobTitle || locationState?.jobTitle;
      if (targetTitle) {
        // 2. Fetch Best Projects from GitHub
        const { data: githubData } = await supabase
          .from("github_data")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (githubData) {
          if ((!github || forceRefresh) && githubData.username) {
            setGithub(`github.com/${githubData.username}`);
          }

          if (githubData && githubData.repositories && Array.isArray(githubData.repositories)) {
            const keywords = (locationState?.keywords || jobKeywords).toLowerCase().split(",").map(k => k.trim());
            const matchedProjects = githubData.repositories
              .filter((repo: any) => {
                const name = repo.name.toLowerCase();
                const desc = (repo.description || "").toLowerCase();
                return keywords.some(k => name.includes(k) || desc.includes(k));
              })
              .slice(0, 3);

            if (matchedProjects.length > 0 && (!projects || forceRefresh)) {
              const projectText = matchedProjects
                .map((p: any) => `${p.name}\n${p.description || "Portfolio project"}\n${p.language || "Tech stack"}`)
                .join("\n\n");
              setProjects(projectText);
            }
          }
        }

        // 3. Fetch LinkedIn Experience
        const { data: linkedinData } = await (supabase as any)
          .from("linkedin_analyses")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (linkedinData) {
          const lData = linkedinData as any;

          // Populate Contact Info
          if (lData.contact_info) {
            if (!phone || forceRefresh) setPhone(lData.contact_info.phone || "");
            if (!linkedin || forceRefresh) setLinkedin(lData.contact_info.linkedin || "");
            if (!portfolio || forceRefresh) setPortfolio(lData.contact_info.portfolio || "");
            if ((!email || forceRefresh) && lData.contact_info.email) setEmail(lData.contact_info.email);
            if ((!location || forceRefresh) && lData.contact_info.location) setLocation(lData.contact_info.location);
          } else {
            // Fallback: Try to extract linkedin URL from parsed data if stored elsewhere or just keep empty
          }

          if (!experience || forceRefresh) {
            if (lData.work_experience && Array.isArray(lData.work_experience) && lData.work_experience.length > 0) {
              // ... handled in separate import function but here we auto-fill if empty
              const formattedExp = lData.work_experience.map((job: any) => {
                return `${job.title}\n${job.company}\n${job.duration}\n${job.bullets.map((b: string) => b.startsWith("-") ? b : "- " + b).join("\n")}`;
              }).join("\n\n");
              setExperience(formattedExp);
            } else if (lData.experience_highlights && Array.isArray(lData.experience_highlights)) {
              // ... fallback logic
              const expText = lData.experience_highlights
                .map((exp: string) => `${lData.headline || targetTitle}\nLinkedIn Highlight\nRecent\n- ${exp}`)
                .join("\n\n");
              setExperience(expText);
            }
          }
        }
      }
      if (forceRefresh) toast.success("Data refreshed from profiles");
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const fetchResumeHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("resume_history")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      const history = data || [];
      setResumeHistory(history);
      console.log("DEBUG: fetchResumeHistory updated history list:", history.length, "items");

      // Fallback recovery: If we have a resume but no ID, try to find the latest ID from history
      if (!currentResumeId && resume && history.length > 0) {
        console.log("DEBUG: currentResumeId is null but resume exists. Attempting recovery from history...");
        // If the latest history item matches our current job title, let's assume it's the right one
        if (history[0].job_title === jobTitle) {
          console.log("DEBUG: Recovering currentResumeId from latest history item:", history[0].id);
          setCurrentResumeId(history[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching resume history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveResumeToHistory = async (resumeText: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const resumeData = {
        user_id: session.user.id,
        full_name: fullName,
        email,
        phone,
        location,
        github,
        linkedin,
        portfolio,
        job_title: jobTitle,
        job_keywords: parseCommaSeparated(jobKeywords),
        skills: parseCommaSeparated(skills),
        projects: parseProjects(projects),
        experience: parseExperience(experience),
        education: parseEducation(education),
        resume_text: resumeText,
        template_id: selectedTemplate,
      };

      const { data, error } = await supabase
        .from("resume_history")
        .insert(resumeData)
        .select()
        .single();

      if (error) throw error;

      // Refresh history after saving
      await fetchResumeHistory();
      setCurrentResumeId(data.id);
      localStorage.setItem("resume_currentResumeId", data.id);
      toast.success("Resume saved to history!");
      return data.id;
    } catch (error) {
      console.error("Error saving resume to history:", error);
      toast.error("Failed to save resume to history");
      return null;
    }
  };

  const handleAddToTracker = async () => {
    console.log("handleAddToTracker called. currentResumeId:", currentResumeId);

    if (!currentResumeId) {
      console.warn("Adding to tracker failed: currentResumeId is null or undefined.");
      toast.error("Please generate a resume first");
      return;
    }

    setIsAddingToTracker(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Create a minimal job entry for this application
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          job_title: jobTitle,
          company_name: "TBD", // User might not have entered it yet
          job_description: jobDescription || "Generated from Resume Builder",
          required_skills: parseCommaSeparated(jobKeywords),
          keywords: parseCommaSeparated(jobKeywords)
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // 2. Create the application linked to the resume
      const { error: appError } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          job_id: jobData.id,
          resume_history_id: currentResumeId, // Linked to the newly created resume history record
          status: "applied",
          applied_date: new Date().toISOString().split("T")[0]
        });

      if (appError) throw appError;

      toast.success("Added to Application Tracker!");
    } catch (error) {
      console.error("Failed to add to tracker:", error);
      toast.error("Failed to add to tracker");
    } finally {
      setIsAddingToTracker(false);
    }
  };

  const loadResumeFromHistory = (historyItem: any) => {
    setFullName(historyItem.full_name || "");
    setEmail(historyItem.email || "");
    setPhone(historyItem.phone || "");
    setLocation(historyItem.location || "");
    setGithub(historyItem.github || "");
    setLinkedin(historyItem.linkedin || "");
    setPortfolio(historyItem.portfolio || "");
    setJobTitle(historyItem.job_title || "");
    setJobKeywords(historyItem.job_keywords?.join(", ") || "");
    setSkills(historyItem.skills?.join(", ") || "");

    // Convert projects back to text format
    if (historyItem.projects && Array.isArray(historyItem.projects)) {
      const projectsText = historyItem.projects
        .map((p: any) => `${p.name}\n${p.description}\n${p.tech}`)
        .join("\n\n");
      setProjects(projectsText);
    }

    // Convert experience back to text format
    if (historyItem.experience && Array.isArray(historyItem.experience)) {
      const expText = historyItem.experience
        .map((e: any) => `${e.title}\n${e.company}\n${e.duration}\n${e.bullets.map((b: string) => `- ${b}`).join("\n")}`)
        .join("\n\n");
      setExperience(expText);
    }

    // Convert education back to text format
    if (historyItem.education && Array.isArray(historyItem.education)) {
      const eduText = historyItem.education
        .map((e: any) => `${e.degree}, ${e.institution}, ${e.year}`)
        .join("\n");
      setEducation(eduText);
    }

    setResume(historyItem.resume_text || "");
    setSelectedTemplate(historyItem.template_id || 'modern');
    setCurrentResumeId(historyItem.id);

    toast.success("Loaded resume from history!");
  };

  const deleteResumeFromHistory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("resume_history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchResumeHistory();
      toast.success("Resume deleted from history!");
    } catch (error) {
      console.error("Error deleting resume from history:", error);
      toast.error("Failed to delete resume from history");
    }
  };

  const parseCommaSeparated = (text: string): string[] => {
    return text.split(",").map(s => s.trim()).filter(s => s.length > 0);
  };

  const parseProjects = (text: string): { name: string; description: string; tech: string }[] => {
    return text.split("\n\n").filter(block => block.trim()).map(block => {
      const lines = block.split("\n");
      return {
        name: lines[0]?.trim() || "",
        description: lines[1]?.trim() || "",
        tech: lines[2]?.trim() || "",
      };
    });
  };

  const parseExperience = (text: string): { title: string; company: string; duration: string; bullets: string[] }[] => {
    return text.split("\n\n").filter(block => block.trim()).map(block => {
      const lines = block.split("\n");
      return {
        title: lines[0]?.trim() || "",
        company: lines[1]?.trim() || "",
        duration: lines[2]?.trim() || "",
        bullets: lines.slice(3).filter(l => l.trim().startsWith("-")).map(l => l.replace("-", "").trim()),
      };
    });
  };

  const parseEducation = (text: string): { degree: string; institution: string; year: string }[] => {
    return text.split("\n").filter(line => line.trim()).map(line => {
      const parts = line.split(",").map(p => p.trim());
      return {
        degree: parts[0] || "",
        institution: parts[1] || "",
        year: parts[2] || "",
      };
    });
  };

  const handleImportProjects = async () => {
    setIsFetchingProfile(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: githubData } = await supabase
        .from("github_data")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (githubData && githubData.repositories) {
        const keywords = jobKeywords.toLowerCase().split(",").map(k => k.trim()).filter(k => k);
        // Filter projects that match keywords or description
        const matchedProjects = (githubData.repositories as any[])
          .filter((repo: any) => {
            if (keywords.length === 0) return true; // If no keywords, take top ones
            const text = (repo.name + " " + (repo.description || "")).toLowerCase();
            return keywords.some(k => text.includes(k));
          })
          .sort((a: any, b: any) => (b.stargazers_count || 0) - (a.stargazers_count || 0)) // Sort by stars
          .slice(0, 3); // Take top 3

        if (matchedProjects.length > 0) {
          const projectText = matchedProjects
            .map((p: any) => `${p.name}\n${p.description || "Portfolio project"}\n${p.language || "Tech stack"}`)
            .join("\n\n");

          setProjects(prev => prev ? prev + "\n\n" + projectText : projectText);
          toast.success(`Imported ${matchedProjects.length} relevant projects`);
        } else {
          toast("No specific projects matched the keywords, try adding more keywords or syncing all.");
        }
      }
    } catch (error) {
      console.error("Error importing projects:", error);
      toast.error("Failed to import projects");
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleImportExperience = async () => {
    setIsFetchingProfile(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: linkedinData } = await (supabase as any)
        .from("linkedin_analyses")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (linkedinData) {
        const lData = linkedinData as any;

        // 1. Try to use structured Work Experience (New Format)
        if (lData.work_experience && Array.isArray(lData.work_experience) && lData.work_experience.length > 0) {
          const formattedExp = lData.work_experience.map((job: any) => {
            return `${job.title}\n${job.company}\n${job.duration}\n${job.bullets.map((b: string) => b.startsWith("-") ? b : "- " + b).join("\n")}`;
          }).join("\n\n");

          setExperience(prev => prev ? prev + "\n\n" + formattedExp : formattedExp);
          toast.success("Imported structured LinkedIn work experience");
        }
        // 2. Fallback to Experience Highlights (Old Format)
        else if (lData.experience_highlights && Array.isArray(lData.experience_highlights) && lData.experience_highlights.length > 0) {
          // Group all highlights into a single structured experience block
          // Format: Title \n Company \n Duration \n - Bullet 1 \n - Bullet 2 ...
          const title = lData.headline || "Professional Experience";
          const company = "LinkedIn Profile Highlights";
          // We use 'Recent' as we don't have exact dates for each highlight in this summary
          const duration = "Recent";

          const bullets = lData.experience_highlights
            .map((exp: string) => `- ${exp.replace(/^-\s*/, '')}`) // Ensure clean bullets
            .join("\n");

          const expText = `${title}\n${company}\n${duration}\n${bullets}`;

          setExperience(prev => prev ? prev + "\n\n" + expText : expText);
          toast.success("Imported LinkedIn experience highlights");
        } else {
          toast.error("No experience data found in LinkedIn analysis.");
        }
      } else {
        toast.error("No LinkedIn analysis found.");
      }
    } catch (error) {
      console.error("Error importing experience:", error);
      toast.error("Failed to import experience");
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleGenerate = async () => {
    if (!jobTitle.trim()) {
      toast.error("Please enter a target job title");
      return;
    }

    console.log("MODE: resume");
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-resume", {
        body: {
          fullName,
          email,
          phone,
          location,
          github,
          linkedin,
          portfolio,
          jobTitle,
          jobKeywords: parseCommaSeparated(jobKeywords),
          skills: parseCommaSeparated(skills),
          projects: parseProjects(projects),
          experience: parseExperience(experience),
          education: parseEducation(education),
        },
      });

      console.log("Resume generation raw response data:", data);

      if (error) throw error;

      const generatedContent = data?.content || data?.resume || (typeof data === 'string' ? data : null);

      if (generatedContent) {
        setResume(generatedContent);
        // Save to history
        await saveResumeToHistory(generatedContent);
        toast.success("Resume generated successfully!");
      } else {
        const errorMsg = data?.error || "Invalid response format from server";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Error generating resume:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate resume");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resume);
    toast.success("Resume copied to clipboard!");
  };

  const copyCoverLetterToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Cover letter copied to clipboard!");
  };

  const downloadAsText = () => {
    const blob = new Blob([resume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fullName.replace(/\s+/g, "_") || "resume"}_ATS.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded!");
  };

  const downloadCoverLetterAsText = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fullName.replace(/\s+/g, "_") || "cover_letter"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded!");
  };

  const downloadCoverLetterAsDocx = async () => {
    try {
      toast.info("Generating professional Word document...");
      const data = prepareResumeData();

      const doc = new Document({
        sections: [{
          properties: {
            type: SectionType.CONTINUOUS,
          },
          children: [
            // Header
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: data.fullName,
                  bold: true,
                  size: 32,
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: [data.email, data.phone, data.location].filter(Boolean).join(" | "),
                  size: 20,
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              children: [
                new TextRun({
                  text: [data.linkedin, data.github, data.portfolio].filter(Boolean).join(" | "),
                  size: 18,
                  font: "Calibri",
                }),
              ],
            }),

            // Content
            ...coverLetter.split('\n').map(line => new Paragraph({
              children: [new TextRun({ text: line, size: 22, font: "Calibri" })],
              spacing: { after: 120 },
              alignment: AlignmentType.LEFT,
            })),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `${fullName.replace(/\s+/g, "_") || "cover_letter"}_Elegant.docx`;
      saveAs(blob, fileName);
      toast.success("Cover letter downloaded as Word document!");
    } catch (error) {
      console.error("DOCX Generation Error:", error);
      toast.error("Failed to generate Word cover letter");
    }
  };

  const downloadCoverLetterAsPDF = async () => {
    try {
      toast.info("Generating professional PDF... Please wait.");
      const data = prepareResumeData();
      const htmlContent = generateCoverLetterHTML(data, coverLetter);

      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm';
      iframe.style.height = 'auto';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not create document");

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      await new Promise(resolve => setTimeout(resolve, 1000));
      const contentHeight = iframeDoc.body.scrollHeight;
      const contentWidth = iframeDoc.body.scrollWidth;
      iframe.style.height = contentHeight + 'px';
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: contentWidth,
        height: contentHeight,
        windowWidth: contentWidth,
        windowHeight: contentHeight
      });

      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      const fileName = `${fullName.replace(/\s+/g, "_") || "cover_letter"}_Elegant.pdf`;
      pdf.save(fileName);
      toast.success("Cover letter downloaded as PDF!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF cover letter");
    }
  };

  const cleanText = (text: string): string => {
    // Remove markdown badges and links
    return text
      .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '') // Remove badge links
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // Keep link text, remove URL
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '') // Remove italic markers
      .replace(/`/g, '') // Remove code markers
      .trim();
  };

  const extractSection = (text: string, sectionName: string): string => {
    if (!text) return '';

    // Split section names for matching
    const sectionPatterns = sectionName.split('|').map(p => p.toUpperCase());
    const headers = ['PROFESSIONAL SUMMARY', 'SUMMARY', 'TECHNICAL SKILLS', 'SKILLS', 'PROJECTS', 'KEY PROJECTS', 'EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'WORK EXPERIENCE', 'EDUCATION', 'CERTIFICATIONS', 'ACHIEVEMENTS'];

    // Find where each potential section starts
    const headerPositions: Array<{ name: string, index: number, matchedHeader: string }> = [];

    headers.forEach(h => {
      // Look for the header at the start of a line or after a newline, allowing for bolding, #, or colons
      // This regex matches things like "**EDUCATION**", "EDUCATION:", "### EDUCATION"
      const regex = new RegExp(`(?:^|\\n)[\\s*#]*(${h})[\\s*:]*(?=\\n|$)`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        headerPositions.push({
          name: h.toUpperCase(),
          index: match.index,
          matchedHeader: match[0]
        });
      }
    });

    // Sort positions by index in the source text
    headerPositions.sort((a, b) => a.index - b.index);

    // Find the requested section among the found headers
    for (let i = 0; i < headerPositions.length; i++) {
      const current = headerPositions[i];
      if (sectionPatterns.includes(current.name)) {
        // The start of the content is after the matched header
        const start = current.index + current.matchedHeader.length;
        // The end of the content is the start of the next header, or the end of the text
        const next = headerPositions[i + 1];
        const end = next ? next.index : text.length;

        return text.substring(start, end).trim();
      }
    }

    return '';
  };

  const parseResumeProjects = (resumeText: string): Array<{ name: string; description: string; tech: string }> => {
    const projectsSection = extractSection(resumeText, 'PROJECTS|KEY PROJECTS');
    if (!projectsSection) return parseProjects(projects);

    // Split by numbered items (1., 2., etc.) or double newlines
    const projectBlocks = projectsSection.split(/\n(?=\d+\.\s+|\n[A-Z])/);

    return projectBlocks
      .filter(block => block.trim() && block.trim().length > 10)
      .map(block => {
        const lines = block.split('\n').map(l => cleanText(l)).filter(l => l);

        // First line is the project name (may include "| Role: Developer")
        let name = lines[0] || '';
        // Remove numbering if present (e.g., "1. Project Name")
        name = name.replace(/^\d+\.\s*/, '').trim();
        // Extract just the project name if it has "| Role:"
        if (name.includes('|')) {
          name = name.split('|')[0].trim();
        }

        // Find tech stack line
        const techLine = lines.find(l =>
          l.toLowerCase().includes('tech stack:') ||
          l.toLowerCase().includes('technologies:') ||
          l.toLowerCase().startsWith('tech:')
        );
        const tech = techLine ? techLine.replace(/^.*?:/i, '').trim() : '';

        // Description is everything that's not the title, tech line, or bullet points
        const descLines = lines.filter(l =>
          l !== lines[0] &&
          l !== techLine &&
          !l.startsWith('-') &&
          !l.startsWith('•') &&
          !l.toLowerCase().startsWith('tech')
        );
        const bullets = lines.filter(l => l.startsWith('-') || l.startsWith('•'))
          .map(l => l.replace(/^[-•]\s*/, ''));

        const description = [...descLines, ...bullets].join(' ').trim() || lines[1] || '';

        return { name, description, tech };
      })
      .filter(p => p.name);
  };

  const parseResumeExperience = (resumeText: string): Array<{ title: string; company: string; duration: string; bullets: string[] }> => {
    const expSection = extractSection(resumeText, 'EXPERIENCE|PROFESSIONAL EXPERIENCE|WORK EXPERIENCE');
    if (!expSection) return parseExperience(experience);

    // Split by lines that look like job titles (start with capital letter, not a bullet)
    const expBlocks = expSection.split(/\n(?=[A-Z][a-z].*(?:\||$)|\n[A-Z])/);

    const experiences: Array<{ title: string; company: string; duration: string; bullets: string[] }> = [];

    expBlocks.forEach(block => {
      if (!block.trim() || block.trim().length < 5) return;

      const lines = block.split('\n').map(l => cleanText(l)).filter(l => l);
      if (lines.length === 0) return;

      const firstLine = lines[0] || '';
      let title = '', company = '', duration = '';

      // Check if first line has pipe separator (Title | Company | Duration)
      if (firstLine.includes('|')) {
        const parts = firstLine.split('|').map(p => p.trim());
        title = parts[0] || '';
        company = parts[1] || '';
        duration = parts[2] || '';
      } else {
        // Title is first line, company might be second line
        title = firstLine;
        if (lines[1] && !lines[1].startsWith('-') && !lines[1].startsWith('•')) {
          company = lines[1];
        }
      }

      // Extract bullets
      const bullets = lines
        .filter(l => l.startsWith('-') || l.startsWith('•'))
        .map(l => l.replace(/^[-•]\s*/, ''));

      if (title) {
        experiences.push({ title, company, duration, bullets });
      }
    });

    return experiences.length > 0 ? experiences : parseExperience(experience);
  };

  const parseResumeEducation = (resumeText: string): Array<{ degree: string; institution: string; year: string }> => {
    const eduSection = extractSection(resumeText, 'EDUCATION');
    if (!eduSection) return parseEducation(education);

    const eduLines = eduSection.split('\n').map(l => cleanText(l)).filter(l => l);
    const eduItems: Array<{ degree: string; institution: string; year: string }> = [];

    let i = 0;
    while (i < eduLines.length) {
      const line = eduLines[i];
      if (!line) { i++; continue; }

      // Check if line has pipe separator (Degree | Institution | Year)
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        eduItems.push({
          degree: parts[0] || '',
          institution: parts[1] || '',
          year: parts[2] || parts[parts.length - 1] || ''
        });
        i++;
      } else {
        // More flexible line-by-line parsing
        // Check if current line has a year in it
        const yearInLine = line.match(/\b(19|20)\d{2}\b/);
        const nextLine = eduLines[i + 1] || '';
        const yearInNextLine = nextLine.match(/\b(19|20)\d{2}\b/);

        let degree = line;
        let institution = '';
        let year = '';

        if (yearInLine) {
          // If year is in current line, it's likely "Degree Year"
          year = yearInLine[0];
          degree = line.replace(year, '').replace(/[|]/g, '').trim();
          institution = nextLine && !yearInNextLine ? nextLine : '';
          i += institution ? 2 : 1;
        } else if (yearInNextLine) {
          // If year is in next line, it's likely "Degree\nInstitution Year" or "Degree\nYear"
          degree = line;
          year = yearInNextLine[0];
          institution = nextLine.replace(year, '').replace(/[|]/g, '').trim();
          i += 2;
        } else {
          // Fallback to previous logic
          degree = line;
          institution = nextLine && !nextLine.match(/^\d{4}/) ? nextLine : '';
          const potentialYearLine = institution ? eduLines[i + 2] : eduLines[i + 1];
          year = potentialYearLine?.match(/\d{4}/)?.[0] || '';
          i += institution ? (year ? 3 : 2) : 1;
        }

        if (degree) {
          eduItems.push({ degree, institution, year });
        }
      }
    }

    return eduItems.length > 0 ? eduItems : parseEducation(education);
  };

  const parseResumeSkills = (resumeText: string): string[] => {
    const skillsSection = extractSection(resumeText, 'TECHNICAL SKILLS|SKILLS');
    if (!skillsSection) return parseCommaSeparated(skills);

    const skillLines = skillsSection.split('\n').map(l => cleanText(l)).filter(l => l);
    const allSkills: string[] = [];

    skillLines.forEach(line => {
      // Handle "Category: skill1, skill2" format - preserve with bold category
      if (line.includes(':')) {
        const [category, skillsPart] = line.split(':').map(s => s.trim());
        if (category && skillsPart) {
          // Format as "Category: skill1, skill2"
          allSkills.push(`${category}: ${skillsPart}`);
        }
      } else if (line.trim()) {
        // Handle standalone skills line
        allSkills.push(line.trim());
      }
    });

    return allSkills.filter(s => s.length > 0);
  };

  const prepareResumeData = (): ResumeData => {
    // Extract summary from resume text
    const summarySection = extractSection(resume, 'PROFESSIONAL SUMMARY|SUMMARY');
    const cleanSummary = cleanText(summarySection);

    return {
      fullName: fullName || "Your Name",
      email: email || "",
      phone: phone || "",
      location: location || "",
      github: github || "",
      linkedin: linkedin || "",
      portfolio: portfolio || "",
      summary: cleanSummary || "",
      skills: parseResumeSkills(resume),
      projects: parseResumeProjects(resume),
      experience: parseResumeExperience(resume),
      education: parseResumeEducation(resume)
    };
  };

  const downloadAsDocx = async () => {
    try {
      toast.info("Generating professional Word document...");
      const data = prepareResumeData();

      const doc = new Document({
        sections: [{
          properties: {
            type: SectionType.CONTINUOUS,
          },
          children: [
            // Header
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: data.fullName,
                  bold: true,
                  size: 32,
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: [data.email, data.phone, data.location].filter(Boolean).join(" | "),
                  size: 20,
                  font: "Calibri",
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: [data.linkedin, data.github, data.portfolio].filter(Boolean).join(" | "),
                  size: 18,
                  font: "Calibri",
                }),
              ],
            }),

            // Summary
            ...(data.summary ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "PROFESSIONAL SUMMARY",
                    bold: true,
                    size: 24,
                    font: "Calibri",
                  }),
                ],
                border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                children: [new TextRun({ text: data.summary, size: 22, font: "Calibri" })],
                spacing: { after: 200 },
                alignment: AlignmentType.JUSTIFIED,
              }),
            ] : []),

            // Skills
            ...(data.skills && data.skills.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "TECHNICAL SKILLS",
                    bold: true,
                    size: 24,
                    font: "Calibri",
                  }),
                ],
                border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                spacing: { before: 200, after: 100 },
              }),
              ...data.skills.map(skill => {
                const [category, items] = skill.includes(':') ? skill.split(':').map(s => s.trim()) : [null, skill];
                return new Paragraph({
                  children: [
                    ...(category ? [new TextRun({ text: `${category}: `, bold: true, size: 22, font: "Calibri" })] : []),
                    new TextRun({ text: items, size: 22, font: "Calibri" }),
                  ],
                  spacing: { after: 100 },
                });
              }),
            ] : []),

            // Experience
            ...(data.experience && data.experience.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "PROFESSIONAL EXPERIENCE",
                    bold: true,
                    size: 24,
                    font: "Calibri",
                  }),
                ],
                border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                spacing: { before: 200, after: 100 },
              }),
              ...data.experience.flatMap(exp => [
                new Paragraph({
                  children: [
                    new TextRun({ text: exp.title, bold: true, size: 24, font: "Calibri" }),
                    new TextRun({ text: `\t${exp.duration}`, size: 22, font: "Calibri", italics: true }),
                  ],
                  tabStops: [{ type: "right", position: 9000 }],
                }),
                new Paragraph({
                  children: [new TextRun({ text: exp.company, bold: true, size: 22, font: "Calibri", italics: true })],
                  spacing: { after: 100 },
                }),
                ...exp.bullets.map(bullet => new Paragraph({
                  bullet: { level: 0 },
                  spacing: { after: 100 },
                  children: [new TextRun({ text: bullet, size: 22, font: "Calibri" })],
                })),
              ]),
            ] : []),

            // Projects
            ...(data.projects && data.projects.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "KEY PROJECTS",
                    bold: true,
                    size: 24,
                    font: "Calibri",
                  }),
                ],
                border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                spacing: { before: 200, after: 100 },
              }),
              ...data.projects.flatMap(project => [
                new Paragraph({
                  children: [new TextRun({ text: project.name, bold: true, size: 24, font: "Calibri" })],
                }),
                ...(project.tech ? [new Paragraph({
                  children: [
                    new TextRun({ text: "Technologies: ", bold: true, size: 20, font: "Calibri" }),
                    new TextRun({ text: project.tech, size: 20, font: "Calibri", italics: true }),
                  ],
                })] : []),
                new Paragraph({
                  children: [new TextRun({ text: project.description, size: 22, font: "Calibri" })],
                  spacing: { after: 150 },
                }),
              ]),
            ] : []),

            // Education
            ...(data.education && data.education.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "EDUCATION",
                    bold: true,
                    size: 24,
                    font: "Calibri",
                  }),
                ],
                border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                spacing: { before: 200, after: 100 },
              }),
              ...data.education.flatMap(edu => [
                new Paragraph({
                  children: [
                    new TextRun({ text: edu.degree, bold: true, size: 24, font: "Calibri" }),
                    new TextRun({ text: `\t${edu.year}`, size: 22, font: "Calibri", bold: true }),
                  ],
                  tabStops: [{ type: "right", position: 9000 }],
                }),
                new Paragraph({
                  children: [new TextRun({ text: edu.institution, size: 22, font: "Calibri", italics: true })],
                  spacing: { after: 150 },
                }),
              ]),
            ] : []),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${data.fullName.replace(/\s+/g, '_')}_Resume.docx`);
      toast.success("Word document generated successfully!");
    } catch (error) {
      console.error("DOCX generation failed:", error);
      toast.error("Failed to generate Word document");
    }
  };

  const handleDownload = async () => {
    if (selectedTemplate === "txt") {
      downloadAsText();
      return;
    }

    if (selectedTemplate === "docx") {
      downloadAsDocx();
      return;
    }

    try {
      toast.info("Generating professional PDF... Please wait.");

      // Prepare resume data
      const resumeData = prepareResumeData();

      // Generate HTML with selected template
      const htmlContent = generateATSHTML(resumeData, selectedTemplate as any);

      // Create temporary iframe to render HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm';
      iframe.style.height = 'auto';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error("Could not create document");
      }

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for fonts and styles to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the actual content height
      const contentHeight = iframeDoc.body.scrollHeight;
      const contentWidth = iframeDoc.body.scrollWidth;

      // Set iframe height to full content
      iframe.style.height = contentHeight + 'px';

      // Wait a bit more for layout to settle
      await new Promise(resolve => setTimeout(resolve, 300));

      // Capture as canvas with full height
      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: contentWidth,
        height: contentHeight,
        windowWidth: contentWidth,
        windowHeight: contentHeight
      });

      // Remove iframe
      document.body.removeChild(iframe);

      // Convert to PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2] // Divide by 2 because scale is 2
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `${fullName.replace(/\s+/g, "_") || "resume"}_${selectedTemplate}_ATS.pdf`;
      pdf.save(fileName);
      toast.success(`✅ Resume downloaded as ${selectedTemplate.toUpperCase()} template!`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to generate PDF: ${errorMessage}`);
    }
  };

  const oldHandleDownload = () => {
    if (downloadFormat === "txt") {
      downloadAsText();
      return;
    }

    // PDF Generation
    const doc = new jsPDF();
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    let y = margin;
    const lineHeight = 6;

    // Set font based on format
    if (downloadFormat === "pdf_modern") {
      doc.setFont("helvetica", "normal");
    } else {
      doc.setFont("times", "normal");
    }

    const lines = resume.split('\n');

    lines.forEach((line) => {
      // Check if we need a new page
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      // Detect headers (all caps lines that are not too long)
      const isHeader = line === line.toUpperCase() &&
        line.trim().length > 0 &&
        line.trim().length < 50 &&
        !line.includes('@') &&
        !line.includes('http');

      if (isHeader) {
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        if (downloadFormat === "pdf_modern") {
          doc.setTextColor(0, 51, 102); // Dark blue for modern
        }
        const wrappedHeader = doc.splitTextToSize(line, maxWidth);
        wrappedHeader.forEach((wrappedLine: string) => {
          doc.text(wrappedLine, margin, y);
          y += lineHeight + 1;
        });
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);
        y += 2; // Extra space after headers
      } else if (line.trim().length > 0) {
        doc.setFontSize(10);
        const wrappedText = doc.splitTextToSize(line, maxWidth);
        wrappedText.forEach((wrappedLine: string) => {
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(wrappedLine, margin, y);
          y += lineHeight;
        });
      } else {
        y += lineHeight / 2; // Smaller space for empty lines
      }
    });

    const fileName = `${fullName.replace(/\s+/g, "_") || "resume"}_ATS_${downloadFormat}.pdf`;
    doc.save(fileName);
    toast.success(`Resume downloaded as ${downloadFormat.toUpperCase()}!`);
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobTitle.trim()) {
      toast.error("Please enter a target job title");
      return;
    }

    console.log("MODE: cover-letter (Logic Sync: Attempting)");
    setIsGeneratingCoverLetter(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-resume", {
        body: {
          mode: 'cover-letter',
          type: 'cover_letter', // Redundant underscore for backend switch
          fullName,
          email,
          phone,
          location,
          github,
          linkedin,
          portfolio,
          jobTitle,
          jobKeywords: parseCommaSeparated(jobKeywords),
          skills: parseCommaSeparated(skills),
          projects: parseProjects(projects),
          experience: parseExperience(experience),
          education: parseEducation(education),
          companyName: clCompanyName || companyName, // Use specific company name if provided
          resumeText: clResumeContext || resume, // Use specific resume context if provided
          coverLetterRequirements: jobDescription || clRequirements // Use jobDescription now that we moved the analyzer here
        },
      });

      console.log("Cover letter generation raw response data:", data);

      if (error) throw error;

      const generatedContent = data?.content || data?.coverLetter || data?.resume || (typeof data === 'string' ? data : null);

      if (generatedContent) {
        // Validation check: Did the AI hallucinate a resume anyway?
        if (data?.debug?.looksLikeResume) {
          console.error("AI HALLUCINATION DETECTED: AI returned resume data despite strict instructions.");
          toast.error("Format mismatch prevented: The AI returned a resume instead of a story. Please refine your inputs.");
          return; // Don't set the content if it looks like a resume
        }

        setCoverLetter(generatedContent);
        setActiveTab("cover-letter"); // Switch to cover letter tab to show result
        toast.success("Cover letter generated (Narrative Mode)!");
      } else {
        const errorMsg = data?.error || "Invalid response format from server";
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to generate cover letter: ${errorMessage}`);
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleAnalyzeJob = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description to analyze");
      return;
    }

    setIsAnalyzingJob(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Fetch user profile data to context-aware matching
      let userSkillsContext = "";
      let userProjectsContext = "";

      if (session?.user?.id) {
        const { data: githubData } = await supabase
          .from("github_data")
          .select("extracted_skills, top_languages, repositories")
          .eq("user_id", session.user.id)
          .single();

        const { data: linkedinData } = await (supabase as any)
          .from("linkedin_analyses")
          .select("core_skills, experience_highlights")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (githubData) {
          const gSkills = [...(githubData.extracted_skills || []), ...(githubData.top_languages || [])];
          userSkillsContext += gSkills.join(", ") + ". ";

          if (githubData.repositories) {
            userProjectsContext += (githubData.repositories as any[]).slice(0, 5).map(r => `${r.name}: ${r.description}`).join("; ");
          }
        }

        if (linkedinData) {
          const lSkills = (linkedinData as any).core_skills || [];
          userSkillsContext += lSkills.join(", ");
        }
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-job-requirements`;

      // Use the session token if available, otherwise fallback to the Anon Key
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobDescription,
          jobKeywords: parseCommaSeparated(jobKeywords),
          userSkills: userSkillsContext,
          userProjects: userProjectsContext
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      const newKeywords = [
        ...(data.top_keywords || []),
        ...(data.tech_stack || [])
      ];

      // Remove duplicates and combine with existing
      const existingKeywordsList = jobKeywords.split(",").map(k => k.trim().toLowerCase()).filter(k => k);
      const existingKeywordsSet = new Set(existingKeywordsList);
      const filteredNewKeywords = newKeywords.filter(k => k && !existingKeywordsSet.has(k.toLowerCase()));

      if (filteredNewKeywords.length > 0) {
        setJobKeywords(prev => prev ? prev + ", " + filteredNewKeywords.join(", ") : filteredNewKeywords.join(", "));
      }

      if (data.suggested_user_skills && Array.isArray(data.suggested_user_skills)) {
        const existingSkillsSet = new Set(skills.split(",").map(k => k.trim().toLowerCase()).filter(k => k));
        const filteredNewSkills = data.suggested_user_skills.filter((k: string) => k && !existingSkillsSet.has(k.toLowerCase()));

        if (filteredNewSkills.length > 0) {
          setSkills(prev => prev ? prev + ", " + filteredNewSkills.join(", ") : filteredNewSkills.join(", "));
        }
      }

      if (data.job_title_inferred && !jobTitle) {
        setJobTitle(data.job_title_inferred);
      }

      toast.success("Analyzed! Updated Job Keywords & Suggested Your Best Skills.");
    } catch (error: any) {
      console.error("Error analyzing fit:", error);
      toast.error(`Analysis failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  const handleResetForm = () => {
    // Clear all LocalStorage keys for resume builder
    const keys = [
      "resume_fullName", "resume_email", "resume_phone", "resume_github",
      "resume_linkedin", "resume_portfolio", "resume_location", "resume_jobTitle",
      "resume_companyName", "resume_jobKeywords", "resume_skills", "resume_projects",
      "resume_experience", "resume_education", "resume_resumeText", "resume_coverLetter",
      "resume_jobDescription", "resume_currentResumeId"
    ];
    keys.forEach(k => localStorage.removeItem(k));

    // Reset State
    setFullName(""); setEmail(""); setPhone(""); setGithub(""); setLinkedin("");
    setPortfolio(""); setLocation(""); setJobTitle(""); setJobKeywords("");
    setSkills(""); setProjects(""); setExperience(""); setEducation("");
    setResume(""); setCoverLetter(""); setJobDescription("");
    setCompanyName("");
    setCurrentResumeId(null);
    setIsEditingResume(false);

    toast.info("Resume Builder reset successfully");
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">ATS Resume Builder</h1>
              <p className="text-muted-foreground">Generate an ATS-optimized resume tailored to your target job</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUserData(true)}
              disabled={isFetchingProfile}
              className="w-fit"
            >
              {isFetchingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              Sync with Profile
            </Button>
            <Button variant="ghost" onClick={handleResetForm} className="text-muted-foreground hover:text-destructive">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Resume History Section */}
        {resumeHistory.length > 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Recent Resume History
              </CardTitle>
              <CardDescription>Your last 3 generated resumes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {resumeHistory.map((item, index) => (
                  <Card key={item.id} className="bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-semibold line-clamp-1">
                            {item.job_title}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(item.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </CardDescription>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          #{index + 1}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pb-3">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="line-clamp-1">
                          <span className="font-medium">Template:</span> {item.template_id || 'modern'}
                        </p>
                        {item.job_keywords && item.job_keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.job_keywords.slice(0, 3).map((keyword: string, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              >
                                {keyword}
                              </span>
                            ))}
                            {item.job_keywords.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{item.job_keywords.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-7 text-xs"
                          onClick={() => loadResumeFromHistory(item)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2"
                          onClick={() => {
                            setResume(item.resume_text);
                            setSelectedTemplate(item.template_id || 'modern');
                            setCurrentResumeId(item.id);
                            handleDownload();
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => deleteResumeFromHistory(item.id)}
                        >
                          ✕
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="personal" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="job" className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Job</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center gap-1">
                  <FolderGit2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Projects</span>
                </TabsTrigger>
                <TabsTrigger value="education" className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Education</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Your contact details for the resume header</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Address</Label>
                      <Input
                        id="location"
                        placeholder="San Francisco, CA"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          placeholder="github.com/username"
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          placeholder="linkedin.com/in/username"
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="portfolio">Portfolio</Label>
                        <Input
                          id="portfolio"
                          placeholder="yourportfolio.com"
                          value={portfolio}
                          onChange={(e) => setPortfolio(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="job">
                <Card>
                  <CardHeader>
                    <CardTitle>Target Job & Skills</CardTitle>
                    <CardDescription>Job details and your technical skills</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Target Job Title</Label>
                      <Input
                        id="jobTitle"
                        placeholder="Frontend Developer Intern"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name (for Cover Letter)</Label>
                      <Input
                        id="companyName"
                        placeholder="Google / Acme Corp"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobKeywords">Job Keywords (comma-separated)</Label>
                      <Textarea
                        id="jobKeywords"
                        placeholder="React, TypeScript, REST API, Git, Agile"
                        value={jobKeywords}
                        onChange={(e) => setJobKeywords(e.target.value)}
                        className="min-h-[80px]"
                      />
                      {jobKeywords && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {jobKeywords.split(",").map(k => k.trim()).filter(k => k).map((keyword, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Your Technical Skills (comma-separated)</Label>
                      <Textarea
                        id="skills"
                        placeholder="JavaScript, React, Node.js, Python, Git, MongoDB"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="min-h-[80px]"
                      />
                      {skills && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {skills.split(",").map(k => k.trim()).filter(k => k).map((skill, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Projects & Experience</CardTitle>
                        <CardDescription>Your relevant projects and work experience</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="projects">Projects (separate with blank lines)</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleImportProjects}
                          disabled={isFetchingProfile}
                          className="h-7 text-xs"
                        >
                          <FolderGit2 className="h-3 w-3 mr-1" />
                          Import Best Repos
                        </Button>
                      </div>
                      <Textarea
                        id="projects"
                        placeholder={`E-commerce Dashboard
Built a full-stack shopping admin panel with real-time analytics
React, Node.js, MongoDB, Chart.js

Portfolio Website
Personal portfolio with blog and project showcase
Next.js, Tailwind CSS, MDX`}
                        value={projects}
                        onChange={(e) => setProjects(e.target.value)}
                        className="min-h-[150px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="experience">Work Experience (optional, separate with blank lines)</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleImportExperience}
                          disabled={isFetchingProfile}
                          className="h-7 text-xs"
                        >
                          <Briefcase className="h-3 w-3 mr-1" />
                          Import LinkedIn Exp
                        </Button>
                      </div>
                      <Textarea
                        id="experience"
                        placeholder={`Software Developer Intern
TechCorp Inc.
June 2024 - August 2024
- Developed responsive UI components using React
- Improved API response time by 30%`}
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="education">
                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                    <CardDescription>Your educational background</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="education">Education (one per line: Degree, Institution, Year)</Label>
                      <Textarea
                        id="education"
                        placeholder={`B.S. Computer Science, Stanford University, 2025
High School Diploma, Lincoln High School, 2021`}
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button onClick={handleGenerate} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Resume...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate ATS Resume
                </>
              )}
            </Button>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Resume</span>
                {resume && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300"
                      onClick={handleAddToTracker}
                      disabled={isAddingToTracker}
                      title={!currentResumeId ? "Generate a resume first to enable tracking" : ""}
                    >
                      {isAddingToTracker ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Briefcase className="h-4 w-4 mr-1" />
                      )}
                      {currentResumeId ? "Add to Tracker" : "Track (Generate First)"}
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>Choose from 5 professional ATS-optimized templates</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="resume" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Resume
                  </TabsTrigger>
                  <TabsTrigger value="cover-letter" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Cover Letter
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="resume" className="space-y-4">
                  {resume ? (
                    <>
                      <div className="flex justify-end gap-2 mb-2">
                        <Button
                          size="sm"
                          variant={isEditingResume ? "default" : "outline"}
                          onClick={() => setIsEditingResume(!isEditingResume)}
                        >
                          {isEditingResume ? (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              Done
                            </>
                          ) : (
                            <>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline" onClick={copyToClipboard}>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                        <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value as any)}>
                          <SelectTrigger className="w-[180px] h-8">
                            <SelectValue placeholder="Template" />
                          </SelectTrigger>
                          <SelectContent>
                            {TEMPLATE_OPTIONS.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.preview} {template.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="docx">📄 Word Document (DOCX)</SelectItem>
                            <SelectItem value="txt">📝 Plain Text (TXT)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="default" onClick={handleDownload}>
                          <Download className="h-4 w-4 mr-1" />
                          {selectedTemplate === 'docx' ? 'Download DOCX' : selectedTemplate === 'txt' ? 'Download TXT' : 'Download PDF'}
                        </Button>
                      </div>
                      {isEditingResume ? (
                        <Textarea
                          value={resume}
                          onChange={(e) => setResume(e.target.value)}
                          className="whitespace-pre-wrap font-mono min-h-[500px]"
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg max-h-[600px] overflow-y-auto border">
                          {resume}
                        </pre>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border rounded-lg border-dashed">
                      <FileText className="h-12 w-12 mb-4 opacity-50" />
                      <p>Generate your resume first</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="cover-letter" className="space-y-4">
                  {coverLetter ? (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCoverLetter("")}
                            disabled={isGeneratingCoverLetter}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Back to Config
                          </Button>
                          <Button
                            size="sm"
                            variant={isEditingCoverLetter ? "default" : "outline"}
                            onClick={() => setIsEditingCoverLetter(!isEditingCoverLetter)}
                          >
                            {isEditingCoverLetter ? (
                              <>
                                <Save className="h-4 w-4 mr-1" />
                                Done
                              </>
                            ) : (
                              <>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={copyCoverLetterToClipboard}>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button size="sm" variant="outline" onClick={downloadCoverLetterAsText}>
                            <FileText className="h-4 w-4 mr-1" />
                            Plain Text
                          </Button>
                          <Button size="sm" variant="outline" onClick={downloadCoverLetterAsDocx}>
                            <FileText className="h-4 w-4 mr-1" />
                            Word (DOCX)
                          </Button>
                          <Button size="sm" variant="default" onClick={downloadCoverLetterAsPDF}>
                            <Download className="h-4 w-4 mr-1" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                      {isEditingCoverLetter ? (
                        <Textarea
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          className="whitespace-pre-wrap font-mono min-h-[500px]"
                          placeholder="Write your cover letter here..."
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg max-h-[600px] overflow-y-auto border">
                          {coverLetter}
                        </pre>
                      )}
                    </>
                  ) : (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Target Company</label>
                          <Input
                            placeholder="e.g. Google, Microsoft, Hatton National Bank"
                            value={clCompanyName}
                            onChange={(e) => setClCompanyName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Job Role/Title</label>
                          <Input
                            placeholder="e.g. Software Engineer Intern"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between items-center">
                          Job Description / Requirements
                          <span className="text-xs text-muted-foreground font-normal">Extract keywords to optimize both Resume & Letter</span>
                        </label>
                        <Textarea
                          placeholder="Paste the full job description here to help the AI tailor your application..."
                          className="min-h-[150px]"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                        <Button
                          onClick={handleAnalyzeJob}
                          disabled={isAnalyzingJob}
                          variant="outline"
                          size="sm"
                          className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          {isAnalyzingJob ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analyzing Requirements...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Analyze & Optimize Content
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium flex justify-between items-center">
                          Candidate Background / Resume Context
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            onClick={() => {
                              if (resume) {
                                setClResumeContext(resume);
                                toast.success("Populated from your available background!");
                              } else {
                                toast.error("Please generate a resume first");
                              }
                            }}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Populate from Background
                          </Button>
                        </label>
                        <Textarea
                          placeholder="Paste your background or resume text here. The AI will use this to find your best matching projects and skills..."
                          className="min-h-[200px] font-mono text-xs"
                          value={clResumeContext}
                          onChange={(e) => setClResumeContext(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-dashed bg-muted/20">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm mb-4 border ring-4 ring-purple-50 dark:ring-purple-900/10">
                          <Sparkles className="h-8 w-8 text-purple-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Write Your Letter?</h3>
                        <p className="max-w-md text-center mb-6 text-sm text-muted-foreground">
                          We'll use your degree, your AI Image Generator project, and other details from your resume to build a perfect 4-paragraph cover letter.
                        </p>

                        <div className="flex gap-4">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setCoverLetter("\n\n\n\n"); // Just some space to start
                              setIsEditingCoverLetter(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Write Manually
                          </Button>
                          <Button
                            size="lg"
                            className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20 px-8"
                            onClick={handleGenerateCoverLetter}
                            disabled={isGeneratingCoverLetter || (!resume && !clResumeContext)}
                          >
                            {isGeneratingCoverLetter ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Generating Professional Letter...
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Generate with AI
                              </>
                            )}
                          </Button>
                        </div>
                        {!resume && !clResumeContext && (
                          <p className="mt-4 text-xs text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-100 dark:border-amber-900/30">
                            Please generate a resume or paste your resume text above to provide context for AI.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout >
  );
};

export default ResumeBuilder;
