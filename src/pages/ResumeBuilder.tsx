import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, FileText, Download, Copy, Sparkles, User, Briefcase, GraduationCap, FolderGit2, Edit, Save, History, Clock, RotateCcw, Type, AlignLeft, LayoutGrid, Settings2, Eye, TrendingUp } from "lucide-react";
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
import { ModernTemplate, ClassicTemplate, SimpleTemplate, ElegantTemplate, TEMPLATE_OPTIONS, generateATSHTML, type TemplateId, type ResumeData } from '@/components/resume-templates';
import { useRef } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, SectionType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface ProjectItem {
  id: string;
  name: string;
  tech: string;
  dates: string;
  bullets: string;
}

const ResumeBuilder = () => {
  const routerLocation = useLocation();
  const searchParams = new URLSearchParams(routerLocation.search);
  const templateFromUrl = searchParams.get('template') as TemplateId | null;
  const locationState = routerLocation.state;
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
  const [additionalSkills, setAdditionalSkills] = useState(() => localStorage.getItem("resume_additionalSkills") || "");
  const [skillGroups, setSkillGroups] = useState<Array<{id: string, name: string, items: string}>>(() => {
    const saved = localStorage.getItem("resume_skillGroups");
    if (saved) return JSON.parse(saved);
    return [
      { id: crypto.randomUUID(), name: "Core Tools", items: "TypeScript, React, Node.js" },
      { id: crypto.randomUUID(), name: "Delivery", items: "Testing, CI/CD, Code Reviews" },
    ];
  });
  const [projectList, setProjectList] = useState<ProjectItem[]>(() => {
    const saved = localStorage.getItem("resume_projectList");
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [experience, setExperience] = useState(() => localStorage.getItem("resume_experience") || "");
  const [eduList, setEduList] = useState<Array<{id: string, degree: string, school: string, dates: string, details: string}>>(() => {
    const saved = localStorage.getItem("resume_eduList");
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [certList, setCertList] = useState<Array<{id: string, name: string, issuer: string, date: string}>>(() => {
    const saved = localStorage.getItem("resume_certList");
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [education, setEducation] = useState(() => localStorage.getItem("resume_education") || "");
  const [achievements, setAchievements] = useState(() => localStorage.getItem("resume_achievements") || "");
  const [additionalInfo, setAdditionalInfo] = useState(() => localStorage.getItem("resume_additionalInfo") || "");
  const [pubList, setPubList] = useState<Array<{id: string, title: string, publisher: string, date: string}>>(() => {
    const saved = localStorage.getItem("resume_pubList");
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [refList, setRefList] = useState<Array<{id: string, name: string, role: string, organization: string, phone: string, email: string}>>(() => {
    const saved = localStorage.getItem("resume_refList");
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [summary, setSummary] = useState(() => localStorage.getItem("resume_summary") || "");
  const [workExperience, setWorkExperience] = useState<any[]>(() => {
    const saved = localStorage.getItem("resume_workExperience");
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [resume, setResume] = useState(() => localStorage.getItem("resume_resumeText") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem("resume_jobDescription") || "");
  const [isAnalyzingJob, setIsAnalyzingJob] = useState(false);
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("pdf_modern");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | 'txt' | 'docx'>(templateFromUrl || 'modern');
  const templateRef = useRef<HTMLDivElement>(null);
  const [resumeHistory, setResumeHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(() => localStorage.getItem("resume_history_current_id"));
  const [isAddingToTracker, setIsAddingToTracker] = useState(false);
  
  // ATS Score State
  const [atsScore, setAtsScore] = useState<{
    ats_score: number;
    matched_keywords: string[];
    missing_keywords: string[];
    keyword_frequency: Record<string, number>;
    section_analysis: any;
    improvement_tips: string[];
    critical_gaps: string[];
    strength_areas: string[];
    overall_assessment: string;
  } | null>(null);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);

  // Layout Adjustments State
  const [fontSize, setFontSize] = useState(100);
  const [lineHeight, setLineHeight] = useState(100);
  const [sectionSpacing, setSectionSpacing] = useState(100);
  const [pageStrategy, setPageStrategy] = useState<'one_page' | 'standard'>(() => (localStorage.getItem("resume_pageStrategy") as any) || "standard");
  
  // Style Settings
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem("resume_accentColor") || "#5c2d1b");
  const [profileImageUri, setProfileImageUri] = useState(() => localStorage.getItem("resume_profileImageUri") || "");
  const [customContacts, setCustomContacts] = useState<Array<{id: string, label: string, value: string}>>(() => {
    const saved = localStorage.getItem("resume_customContacts");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const calculateATS = async (resumeText: string, keywords: string) => {
    if (!resumeText.trim()) return;
    
    if (!keywords.trim()) {
      console.log("ATS Scan skipped: No keywords provided.");
      return;
    }
    
    console.log("ATS Scan starting for keywords:", keywords.substring(0, 50) + "...");
    setIsCalculatingScore(true);
    setAtsScore(null); // Reset previous score while scanning
    
    try {
      const { data, error } = await supabase.functions.invoke("calculate-ats-score", {
        body: {
          jobKeywords: parseCommaSeparated(keywords),
          resumeContent: resumeText,
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("No data returned from ATS analysis");
      }

      console.log("ATS Scan successful:", data.ats_score);
      setAtsScore(data);
      localStorage.setItem("resume_builder_ats_score", JSON.stringify(data));
    } catch (error: any) {
      console.error("Error calculating ATS score:", error);
      toast.error(error.message || "Failed to calculate ATS score. Please try again.");
    } finally {
      setIsCalculatingScore(false);
      console.log("ATS Scan process finalized.");
    }
  };

  const handleResetLayout = () => {
    setFontSize(100);
    setLineHeight(100);
    setSectionSpacing(100);
  };

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
    localStorage.setItem("resume_additionalSkills", additionalSkills);
    localStorage.setItem("resume_projectList", JSON.stringify(projectList));
    localStorage.setItem("resume_experience", experience);
    localStorage.setItem("resume_education", education);
    localStorage.setItem("resume_resumeText", resume);
    localStorage.setItem("resume_jobDescription", jobDescription);
    localStorage.setItem("resume_summary", summary);
    localStorage.setItem("resume_workExperience", JSON.stringify(workExperience));
    localStorage.setItem("resume_skillGroups", JSON.stringify(skillGroups));
    localStorage.setItem("resume_eduList", JSON.stringify(eduList));
    localStorage.setItem("resume_certList", JSON.stringify(certList));
    localStorage.setItem("resume_pubList", JSON.stringify(pubList));
    localStorage.setItem("resume_refList", JSON.stringify(refList));
    localStorage.setItem("resume_achievements", achievements);
    localStorage.setItem("resume_additionalInfo", additionalInfo);
    localStorage.setItem("resume_accentColor", accentColor);
    localStorage.setItem("resume_profileImageUri", profileImageUri);
    localStorage.setItem("resume_customContacts", JSON.stringify(customContacts));
    localStorage.setItem("resume_pageStrategy", pageStrategy);
    if (currentResumeId) {
      localStorage.setItem("resume_history_current_id", currentResumeId);
    } else {
      localStorage.removeItem("resume_history_current_id");
    }
  }, [fullName, email, phone, github, linkedin, portfolio, location, jobTitle, companyName, jobKeywords, skills, additionalSkills, skillGroups, eduList, certList, pubList, refList, achievements, additionalInfo, projectList, experience, education, summary, workExperience, resume, jobDescription, currentResumeId, accentColor, profileImageUri, customContacts]);

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
      if (locationState.skills || locationState.additionalSkills) {
        const groups: any[] = [];
        if (locationState.skills) {
          groups.push({ id: crypto.randomUUID(), name: "Technical Skills", items: locationState.skills });
        }
        if (locationState.additionalSkills) {
          groups.push({ id: crypto.randomUUID(), name: "Additional Skills", items: locationState.additionalSkills });
        }
        if (groups.length > 0) {
          setSkillGroups(groups);
        }
      }
      if (locationState.responsibilities) {
        setJobDescription(locationState.responsibilities);
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

            if (matchedProjects.length > 0 && (projectList.length === 0 || forceRefresh)) {
              const newProjects = matchedProjects.map((p: any) => ({
                id: crypto.randomUUID(),
                name: p.name,
                tech: p.language || "Tech stack",
                dates: new Date(p.updated_at).getFullYear().toString(),
                bullets: p.description || "Portfolio project"
              }));
              setProjectList(newProjects);
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
        projects: projectList as any,
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
      localStorage.setItem("resume_history_current_id", data.id);
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
          job_title: jobTitle || "Untitled Position",
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
          status: "saved", // Default to saved instead of applied
          applied_date: new Date().toISOString().split("T")[0]
        });

      if (appError) throw appError;

      toast.success("Added to Application Tracker!");
    } catch (error: any) {
      console.error("Failed to add to tracker:", error);
      if (error.code === '23503') { // Foreign key violation
        toast.error("Resume ID mismatch. Please click 'Generate ATS Resume' again to create a trackable record.");
      } else {
        toast.error(`Failed to add to tracker: ${error.message || "Unknown error"}`);
      }
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

      setProjectList(historyItem.projects || []);

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

    // Auto-calculate ATS Score when loading from history
    if (historyItem.resume_text && historyItem.job_keywords?.length > 0) {
      calculateATS(historyItem.resume_text, historyItem.job_keywords.join(", "));
    }

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
          const newProjects = matchedProjects.map((p: any) => ({
            id: crypto.randomUUID(),
            name: p.name,
            tech: p.language || "Tech stack",
            dates: new Date(p.updated_at).getFullYear().toString(),
            bullets: p.description || "Portfolio project"
          }));

          setProjectList(prev => [...prev, ...newProjects]);
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
          const formattedExpBlocks = lData.work_experience.map((job: any) => ({
            id: crypto.randomUUID(),
            title: job.title || "",
            company: job.company || "",
            location: job.location || "",
            dates: job.duration || "",
            bullets: job.bullets.map((b: string) => b.startsWith("-") || b.startsWith("•") ? b : "- " + b).join("\n")
          }));

          setWorkExperience(prev => [...prev, ...formattedExpBlocks]);
          
          const formattedExpText = lData.work_experience.map((job: any) => {
            return `${job.title}\n${job.company}\n${job.duration}\n${job.bullets.map((b: string) => b.startsWith("-") ? b : "- " + b).join("\n")}`;
          }).join("\n\n");

          setExperience(prev => prev ? prev + "\n\n" + formattedExpText : formattedExpText);
          toast.success("Imported structured LinkedIn work experience");
        }
        // 2. Fallback to Experience Highlights (Old Format)
        else if (lData.experience_highlights && Array.isArray(lData.experience_highlights) && lData.experience_highlights.length > 0) {
          const title = lData.headline || "Professional Experience";
          const company = "LinkedIn Profile Highlights";
          const duration = "Recent";
          const bulletsText = lData.experience_highlights
            .map((exp: string) => `- ${exp.replace(/^-\s*/, '')}`)
            .join("\n");

          setWorkExperience(prev => [...prev, {
            id: crypto.randomUUID(),
            title,
            company,
            location: "",
            dates: duration,
            bullets: bulletsText
          }]);

          const expText = `${title}\n${company}\n${duration}\n${bulletsText}`;
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
          additionalSkills: parseCommaSeparated(additionalSkills),
          jobDescription: jobDescription,
          projects: projectList as any,
          experience: parseExperience(experience),
          education: parseEducation(education),
        },
      });

      console.log("Resume generation raw response data:", data);

      if (error) throw error;

      const generatedContent = data?.content || data?.resume || (typeof data === 'string' ? data : null);

      if (generatedContent) {
        setResume(generatedContent);
        
        // Extract summary from the newly generated content and update the summary field
        const summarySection = extractSection(generatedContent, 'PROFESSIONAL SUMMARY|SUMMARY');
        const cleanSummary = cleanText(summarySection);
        if (cleanSummary) {
          setSummary(cleanSummary);
        }

        // Extract skills and update skills field with categories
        const extractedSkills = parseResumeSkills(generatedContent);
        if (extractedSkills && extractedSkills.length > 0) {
          const groups = extractedSkills.map(s => {
            if (s.includes(':')) {
              const [name, items] = s.split(':').map(part => part.trim());
              return { id: crypto.randomUUID(), name, items };
            }
            return { id: crypto.randomUUID(), name: "General", items: s };
          });
          setSkillGroups(groups);
          setSkills(extractedSkills.join("\n"));
        }
        
        // Extract experience and populate structured field
        const extractedExp = parseResumeExperience(generatedContent);
        if (extractedExp && extractedExp.length > 0) {
          setWorkExperience(extractedExp.map(exp => ({
            id: crypto.randomUUID(),
            title: exp.title,
            company: exp.company,
            location: "",
            dates: exp.duration,
            bullets: exp.bullets.join("\n")
          })));
        }
        
        // Extract education and populate structured field
        const extractedEdu = parseResumeEducation(generatedContent);
        if (extractedEdu && extractedEdu.length > 0 && Array.isArray(extractedEdu)) {
          setEduList(extractedEdu.map(edu => ({
            id: crypto.randomUUID(),
            degree: edu.degree,
            school: edu.institution,
            dates: edu.year,
            details: ""
          })));
        }

        // Extract certifications and populate structured field
        const extractedCert = parseResumeCertifications(generatedContent);
        if (extractedCert && extractedCert.length > 0) {
          setCertList(extractedCert.map(cert => ({
            id: crypto.randomUUID(),
            name: cert.name,
            issuer: cert.issuer,
            date: cert.date
          })));
        }

        // Save to history
        await saveResumeToHistory(generatedContent);
        
        // Auto-calculate ATS Score if keywords exist
        if (jobKeywords.trim()) {
          calculateATS(generatedContent, jobKeywords);
        }
        
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

  const downloadAsText = () => {
    const blob = new Blob([resume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const nameParts = fullName.trim().split(/\s+/);
    const cvFileName = nameParts.length >= 2
      ? `${nameParts[0]}_${nameParts.slice(1).join('_')}_CV`
      : (fullName.replace(/\s+/g, '_') || 'Resume') + '_CV';
    a.download = `${cvFileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded!");
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
    const headers = ['PROFESSIONAL SUMMARY', 'SUMMARY', 'CORE SKILLS', 'TECHNICAL SKILLS', 'SKILLS', 'PROJECTS', 'KEY PROJECTS', 'EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'WORK EXPERIENCE', 'EDUCATION', 'CERTIFICATIONS', 'ACHIEVEMENTS'];

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
    if (!projectsSection) {
      return projectList.map(p => ({
        name: p.name,
        description: p.bullets,
        tech: p.tech
      }));
    }

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

  const parseResumeCertifications = (resumeText: string): Array<{name: string, issuer: string, date: string}> => {
    const certSection = extractSection(resumeText, 'CERTIFICATIONS|LICENSES');
    if (!certSection) return [];

    const certLines = certSection.split('\n').map(l => cleanText(l)).filter(l => l);
    const certItems: Array<{name: string, issuer: string, date: string}> = [];

    certLines.forEach(line => {
      // Common format: Name - Issuer (Year) or Name, Issuer, Year
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      const date = yearMatch ? yearMatch[0] : '';
      
      let name = line;
      let issuer = '';
      
      if (line.includes('|')) {
        const parts = line.split('|').map(s => s.trim());
        name = parts[0];
        issuer = parts[1] || '';
      } else if (line.includes(',')) {
        const parts = line.split(',').map(s => s.trim());
        name = parts[0];
        issuer = parts[1] || '';
      } else if (line.includes('-')) {
        const parts = line.split('-').map(s => s.trim());
        name = parts[0];
        issuer = parts[1] || '';
      }
      
      // Clean name and issuer if they contain the date
      if (date) {
        name = name.replace(date, '').replace(/[()]|[,|]/g, '').trim();
        issuer = issuer.replace(date, '').replace(/[()]|[,|]/g, '').trim();
      }

      if (name) {
        certItems.push({ name, issuer, date });
      }
    });

    return certItems;
  };

  const parseResumeSkills = (resumeText: string): string[] => {
    const skillsSection = extractSection(resumeText, 'CORE SKILLS|TECHNICAL SKILLS|SKILLS');
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
      summary: summary || cleanSummary || "",
      skills: skillGroups.length > 0 
        ? skillGroups.map(g => `${g.name}: ${g.items}`)
        : [
            ...(skills ? skills.split("\n").map(k => k.trim()) : parseResumeSkills(resume)),
            ...(additionalSkills ? additionalSkills.split("\n").map(k => k.trim()) : [])
          ].filter(Boolean),
      additionalSkills: [], // SkillGroups covers both now
      projects: projectList.length > 0 
        ? projectList.map(proj => ({
            name: proj.name,
            tech: proj.tech,
            dates: proj.dates,
            description: proj.bullets
          }))
        : parseResumeProjects(resume),
      experience: workExperience.length > 0 ? workExperience.map(exp => ({
        title: exp.title,
        company: exp.company,
        location: exp.location,
        duration: exp.dates,
        bullets: exp.bullets.split("\n").map((b: string) => b.trim()).filter((b: string) => b)
      })) : parseResumeExperience(resume),
      education: eduList.length > 0 
        ? eduList.map(edu => ({
            degree: edu.degree,
            institution: edu.school,
            year: edu.dates
          }))
        : parseResumeEducation(resume),
      certifications: certList.length > 0
        ? certList.map(cert => ({
            name: cert.name,
            issuer: cert.issuer,
            date: cert.date
          }))
        : [],
      publications: pubList.length > 0
        ? pubList.map(pub => ({
            title: pub.title,
            publisher: pub.publisher,
            date: pub.date
          }))
        : [],
      achievements: achievements || "",
      additionalInfo: additionalInfo || "",
      references: refList.length > 0 ? refList.map(r => ({
        name: r.name,
        role: r.role,
        organization: r.organization,
        phone: r.phone,
        email: r.email,
      })) : [],
      profileImageUri: profileImageUri || "",
      jobTitle: jobTitle || "",
      accentColor: accentColor || undefined,
      customContacts: customContacts.filter(c => c.value.trim() !== ""),
      layout: {
        fontSize,
        lineHeight,
        sectionSpacing
      },
      pageStrategy
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
            ...(data.jobTitle ? [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: data.jobTitle,
                    bold: true,
                    size: 24,
                    font: "Calibri",
                  }),
                ],
              })
            ] : []),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: [
                    data.email, 
                    data.phone, 
                    data.location, 
                    ...(data.customContacts?.slice(0, 2).map((c: any) => c.value) || [])
                  ].filter(Boolean).join(" | "),
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
                  text: [
                    data.linkedin, 
                    data.github, 
                    data.portfolio,
                    ...(data.customContacts?.slice(2).map((c: any) => c.value) || [])
                  ].filter(Boolean).join(" | "),
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
      const nameParts = data.fullName.trim().split(/\s+/);
      const cvFileName = nameParts.length >= 2
        ? `${nameParts[0]}_${nameParts.slice(1).join('_')}_CV`
        : (data.fullName.replace(/\s+/g, '_') || 'Resume') + '_CV';
      saveAs(blob, `${cvFileName}.docx`);
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
      toast.info("Opening print dialog... Use your browser's 'Save as PDF' option for best results.");

      // Prepare resume data
      const resumeData = prepareResumeData();

      // Generate HTML with selected template
      const htmlContent = generateATSHTML(resumeData, selectedTemplate as any);

      // Open in a new hidden iframe and trigger browser print
      // The browser's print engine correctly handles all CSS page-break rules
      const printFrame = document.createElement('iframe');
      printFrame.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;border:none;';
      document.body.appendChild(printFrame);

      const doc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (!doc) throw new Error("Could not create document");

      doc.open();
      doc.write(htmlContent);
      doc.close();

      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Trigger the browser's native print-to-PDF dialog
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();

      // Remove the iframe after the print dialog closes (small delay)
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 2000);

    } catch (error) {
      console.error("PDF Generation Error:", error);
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

    const nameParts = fullName.trim().split(/\s+/);
    const cvFileName = nameParts.length >= 2
      ? `${nameParts[0]}_${nameParts.slice(1).join('_')}_CV`
      : (fullName.replace(/\s+/g, '_') || 'Resume') + '_CV';
    const fileName = `${cvFileName}.pdf`;
    doc.save(fileName);
    toast.success(`Resume downloaded as ${downloadFormat.toUpperCase()}!`);
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
      "resume_companyName", "resume_jobKeywords", "resume_skills", "resume_projectList",
      "resume_experience", "resume_education", "resume_resumeText",
      "resume_jobDescription", "resume_history_current_id"
    ];
    keys.forEach(k => localStorage.removeItem(k));

    // Reset State
    setFullName(""); setEmail(""); setPhone(""); setGithub(""); setLinkedin("");
    setPortfolio(""); setLocation(""); setJobTitle(""); setJobKeywords("");
    setSkills(""); setProjectList([]); setExperience(""); setEducation("");
    setResume(""); setJobDescription("");
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

        {/* Educational Content End */}

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-8">
              
              {/* Page Layout Adjustments */}
              <Card className="bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900 shadow-sm overflow-hidden">
                <CardHeader className="py-3 px-4 bg-indigo-100/50 dark:bg-indigo-900/30 border-b border-indigo-100 dark:border-indigo-900 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-indigo-600" />
                    <CardTitle className="text-sm font-bold uppercase tracking-tight">Layout & Preview</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const resumeData = prepareResumeData();
                        const htmlContent = generateATSHTML(resumeData, selectedTemplate as any);
                        const win = window.open('', '_blank');
                        if (win) {
                          win.document.open();
                          win.document.write(htmlContent);
                          win.document.close();
                        }
                      }}
                      className="h-7 text-[10px] border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Live Preview
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleResetLayout} className="h-7 text-[10px]">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Page Strategy */}
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Page Strategy</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant={pageStrategy === 'one_page' ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => setPageStrategy('one_page')}
                          className="text-[11px] h-8"
                        >
                          One Page Fit
                        </Button>
                        <Button 
                          variant={pageStrategy === 'standard' ? 'default' : 'outline'} 
                          size="sm" 
                          onClick={() => setPageStrategy('standard')}
                          className="text-[11px] h-8"
                        >
                          Standard (Multi)
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Font</Label>
                          <span className="text-[10px] font-bold text-indigo-600">{fontSize}%</span>
                        </div>
                        <Slider value={[fontSize]} min={80} max={120} step={1} onValueChange={(val) => setFontSize(val[0])} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Line</Label>
                          <span className="text-[10px] font-bold text-indigo-600">{lineHeight}%</span>
                        </div>
                        <Slider value={[lineHeight]} min={85} max={140} step={1} onValueChange={(val) => setLineHeight(val[0])} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Space</Label>
                          <span className="text-[10px] font-bold text-indigo-600">{sectionSpacing}%</span>
                        </div>
                        <Slider value={[sectionSpacing]} min={50} max={150} step={5} onValueChange={(val) => setSectionSpacing(val[0])} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Basic Details Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 border-b pb-4">Basic Details</h3>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Full Name</Label>
                    <Input 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="h-11 shadow-sm font-medium"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Role Title</Label>
                    <Input 
                      value={jobTitle} 
                      onChange={e => setJobTitle(e.target.value)}
                      placeholder="Frontend Developer Intern"
                      className="h-11 shadow-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={accentColor} 
                        onChange={e => setAccentColor(e.target.value)}
                        className="h-11 w-16 p-1 cursor-pointer"
                      />
                      <Input 
                        value={accentColor} 
                        onChange={e => setAccentColor(e.target.value)}
                        className="h-11 flex-1 shadow-sm font-medium uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Profile Image URI (Optional)</Label>
                    <Input 
                      value={profileImageUri}
                      onChange={e => setProfileImageUri(e.target.value)}
                      placeholder="https://images.example.com/profile.jpg"
                      className="h-11 shadow-sm font-medium"
                    />
                    <p className="text-xs text-zinc-500 font-medium">Use a direct public image link (`.jpg`, `.png`, `.webp`) so it appears in preview and PDF.</p>
                  </div>
                </div>
              </div>


              {/* Contacts Table */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Contacts</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Standard Contacts */}
                    {[
                      { label: "Email", value: email, setter: setEmail, placeholder: "john@example.com" },
                      { label: "Phone", value: phone, setter: setPhone, placeholder: "+1 (555) 000-0000" },
                      { label: "Location", value: location, setter: setLocation, placeholder: "San Francisco, CA" },
                      { label: "LinkedIn", value: linkedin, setter: setLinkedin, placeholder: "linkedin.com/in/username" },
                      { label: "Website", value: portfolio, setter: setPortfolio, placeholder: "yourportfolio.com" },
                      { label: "GitHub", value: github, setter: setGithub, placeholder: "github.com/username" },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5 flex flex-col group">
                        <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pl-1">
                          {item.label}
                        </Label>
                        <div className="flex gap-2">
                          <div className="h-10 px-3 flex items-center bg-zinc-50 border border-zinc-200 rounded-md shrink-0">
                            <span style={{ fontWeight: '700', color: '#111827', fontSize: '12px' }}>{item.label}:</span>
                          </div>
                          <Input 
                            placeholder={item.placeholder} 
                            value={item.value} 
                            onChange={e => item.setter(e.target.value)} 
                            className="h-10 text-sm shadow-sm flex-1" 
                          />
                        </div>
                      </div>
                    ))}

                    {/* Custom Contacts */}
                    {customContacts.map((contact, idx) => (
                      <div key={contact.id} className="space-y-1.5 flex flex-col group">
                        <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pl-1">
                          Custom Link
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1 max-w-[120px]">
                            <Input 
                              placeholder="Label" 
                              value={contact.label} 
                              onChange={e => {
                                const newContacts = [...customContacts];
                                newContacts[idx].label = e.target.value;
                                setCustomContacts(newContacts);
                              }} 
                              style={{ fontWeight: '700', color: '#111827' }}
                              className="h-10 text-xs shadow-sm bg-zinc-50 focus:bg-white truncate pr-4" 
                            />
                            {contact.label && <span className="absolute right-1 top-2.5 text-zinc-400">:</span>}
                          </div>
                          <Input 
                            placeholder="Value" 
                            value={contact.value} 
                            onChange={e => {
                              const newContacts = [...customContacts];
                              newContacts[idx].value = e.target.value;
                              setCustomContacts(newContacts);
                            }} 
                            className="h-10 text-sm shadow-sm flex-1" 
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setCustomContacts(customContacts.filter((_, i) => i !== idx));
                            }} 
                            className="h-10 w-10 text-zinc-400 hover:text-red-600 shrink-0 bg-red-50 dark:bg-red-950/20"
                          >
                            <span aria-hidden="true">✕</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full mt-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => {
                      setCustomContacts([...customContacts, { id: crypto.randomUUID(), label: "", value: "" }]);
                    }}
                  >
                    + Add Custom Contact
                  </Button>
                </div>
              </div>

              {/* Professional Summary Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 border-b pb-4">Professional Summary</h3>
                <div className="space-y-4">
                  <p className="text-sm text-zinc-500 mb-2">Write a short and impactful summary of your professional background and key achievements.</p>
                  <Textarea 
                    placeholder="Results-driven professional with 5+ years of experience in..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="min-h-[120px] p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                  />
                </div>
              </div>

              {/* Target Job & Skills Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 border-b pb-4">Target Job & Skills</h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Job Keywords (comma-separated)</Label>
                    <Textarea
                      placeholder="React, TypeScript, REST API, Git, Agile"
                      value={jobKeywords}
                      onChange={(e) => setJobKeywords(e.target.value)}
                      className="min-h-[80px] p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm text-sm"
                    />
                    {jobKeywords && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {jobKeywords.split(",").map(k => k.trim()).filter(k => k).map((keyword, i) => (
                          <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Skills</Label>
                      <Button 
                        size="sm" 
                        variant="default" 
                        onClick={() => setSkillGroups([...skillGroups, { id: crypto.randomUUID(), name: "", items: "" }])}
                        className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold"
                      >
                        Add group
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {skillGroups.map((group, idx) => (
                        <div key={group.id} className="grid grid-cols-1 md:grid-cols-[1fr,2fr,auto] gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Group</Label>
                            <Input 
                              placeholder="e.g. Core Tools"
                              value={group.name}
                              onChange={(e) => {
                                const newGroups = [...skillGroups];
                                newGroups[idx].name = e.target.value;
                                setSkillGroups(newGroups);
                              }}
                              className="h-10 text-sm shadow-sm font-semibold text-zinc-900 dark:text-zinc-100"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Items</Label>
                            <Input 
                              placeholder="e.g. TypeScript, React, Node.js"
                              value={group.items}
                              onChange={(e) => {
                                const newGroups = [...skillGroups];
                                newGroups[idx].items = e.target.value;
                                setSkillGroups(newGroups);
                              }}
                              className="h-10 text-sm shadow-sm"
                            />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSkillGroups(skillGroups.filter(g => g.id !== group.id))}
                            className="h-10 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium px-4"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Experience</h3>
                  <Button 
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-md h-9"
                    onClick={() => setWorkExperience([...workExperience, { id: crypto.randomUUID(), title: "", company: "", location: "", dates: "", bullets: "" }])}
                  >
                    Add role
                  </Button>
                </div>

                <div className="space-y-6">
                  {workExperience.map((exp, idx) => (
                    <div key={exp.id} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 space-y-5">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-zinc-700 dark:text-zinc-300">Role {idx + 1}</h4>
                        <Button 
                          variant="outline" size="sm" 
                          className="border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-semibold shadow-sm h-8 px-3"
                          onClick={() => setWorkExperience(workExperience.filter(e => e.id !== exp.id))}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Title</Label>
                          <Input 
                            value={exp.title} 
                            onChange={e => {
                              const newExp = [...workExperience];
                              newExp[idx].title = e.target.value;
                              setWorkExperience(newExp);
                            }}
                            placeholder="DevOps Engineer"
                            className="h-10 text-sm shadow-sm bg-white" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Company</Label>
                          <Input 
                            value={exp.company} 
                            onChange={e => {
                              const newExp = [...workExperience];
                              newExp[idx].company = e.target.value;
                              setWorkExperience(newExp);
                            }}
                            placeholder="Northwind Group"
                            className="h-10 text-sm shadow-sm bg-white" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Location</Label>
                          <Input 
                            value={exp.location} 
                            onChange={e => {
                              const newExp = [...workExperience];
                              newExp[idx].location = e.target.value;
                              setWorkExperience(newExp);
                            }}
                            placeholder="Austin, TX"
                            className="h-10 text-sm shadow-sm bg-white" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Dates</Label>
                          <Input 
                            value={exp.dates} 
                            onChange={e => {
                              const newExp = [...workExperience];
                              newExp[idx].dates = e.target.value;
                              setWorkExperience(newExp);
                            }}
                            placeholder="2023 - Present"
                            className="h-10 text-sm shadow-sm bg-white" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Bullets (One per line)</Label>
                        <Textarea 
                          className="w-full min-h-[140px] p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y bg-white"
                          value={exp.bullets}
                          onChange={e => {
                            const newExp = [...workExperience];
                            newExp[idx].bullets = e.target.value;
                            setWorkExperience(newExp);
                          }}
                          placeholder="Owned core devops engineer workflows..."
                        />
                      </div>
                    </div>
                  ))}

                  {workExperience.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
                      <p className="text-zinc-500 text-sm font-medium">No experience added yet. Click "Add role" or Import from LinkedIn.</p>
                    </div>
                  )}
                  
                  <div className="flex justify-center mt-2">
                    <Button variant="outline" size="sm" onClick={handleImportExperience} disabled={isFetchingProfile} className="h-8 text-xs shadow-sm bg-zinc-50 hover:bg-zinc-100 font-semibold border-dashed">
                      <Briefcase className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
                      Import from LinkedIn
                    </Button>
                  </div>
                </div>
              </div>

              {/* Projects Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Projects</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleImportProjects} disabled={isFetchingProfile} className="h-8 text-[11px] shadow-sm bg-white font-bold uppercase tracking-wider">
                      <FolderGit2 className="h-3.5 w-3.5 mr-1.5" /> Import Repos
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-8 text-[11px] uppercase tracking-wider shadow-md px-4"
                      onClick={() => setProjectList([...projectList, { id: crypto.randomUUID(), name: "", tech: "", dates: "", bullets: "" }])}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Add Project
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {projectList.map((proj, idx) => (
                    <div key={proj.id} className="group relative bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 transition-all hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/30">
                      <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                            {idx + 1}
                          </div>
                          <h4 className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-xs">Project Entry</h4>
                        </div>
                        <Button 
                          variant="ghost" size="sm" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 p-0 rounded-full"
                          onClick={() => setProjectList(projectList.filter(p => p.id !== proj.id))}
                        >
                          <RotateCcw className="h-4 w-4 rotate-45" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] ml-1">Project Name</Label>
                          <Input 
                            value={proj.name} 
                            onChange={e => {
                              const newList = [...projectList];
                              newList[idx].name = e.target.value;
                              setProjectList(newList);
                            }}
                            placeholder="e.g. AI-Powered CRM Dashboard"
                            className="h-11 text-sm shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20" 
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] ml-1">Tech Stack</Label>
                          <Input 
                            value={proj.tech} 
                            onChange={e => {
                              const newList = [...projectList];
                              newList[idx].tech = e.target.value;
                              setProjectList(newList);
                            }}
                            placeholder="e.g. Next.js, TypeScript, Tailwind"
                            className="h-11 text-sm shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20" 
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] ml-1">Project Dates</Label>
                          <Input 
                            value={proj.dates} 
                            onChange={e => {
                              const newList = [...projectList];
                              newList[idx].dates = e.target.value;
                              setProjectList(newList);
                            }}
                            placeholder="e.g. Jan 2024 - Present"
                            className="h-11 text-sm shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20" 
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em] ml-1">Key Contributions & Features</Label>
                          <Textarea 
                            className="min-h-[100px] text-sm shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                            value={proj.bullets}
                            onChange={e => {
                              const newList = [...projectList];
                              newList[idx].bullets = e.target.value;
                              setProjectList(newList);
                            }}
                            placeholder="• Implemented real-time data sync using WebSockets"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {projectList.length === 0 && (
                    <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 transition-all hover:bg-zinc-100/50">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 mb-4">
                        <FolderGit2 className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-1">No Projects Added</h4>
                      <p className="text-zinc-500 text-[11px] mb-6 max-w-[240px] mx-auto italic">Import your top repos or add manual projects to highlight your key achievements.</p>
                      <Button 
                        onClick={() => setProjectList([{ id: crypto.randomUUID(), name: "", tech: "", dates: "", bullets: "" }])}
                        variant="outline"
                        className="h-9 border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Education Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mt-6">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Education</h3>
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={() => setEduList([...eduList, { id: crypto.randomUUID(), degree: "", school: "", dates: "", details: "" }])}
                    className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm px-4"
                  >
                    Add education
                  </Button>
                </div>

                <div className="space-y-6">
                  {eduList.map((edu, idx) => (
                    <div key={edu.id} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-zinc-700 dark:text-zinc-300 uppercase text-xs tracking-wider">Education {idx + 1}</h4>
                        <Button 
                          variant="outline" size="sm" 
                          className="border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-semibold shadow-sm h-8 px-3"
                          onClick={() => setEduList(eduList.filter(e => e.id !== edu.id))}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Degree</Label>
                          <Input 
                            placeholder="Diploma / Degree in Relevant Field"
                            value={edu.degree}
                            onChange={(e) => {
                              const newList = [...eduList];
                              newList[idx].degree = e.target.value;
                              setEduList(newList);
                            }}
                            className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">School</Label>
                          <Input 
                            placeholder="Metropolitan College of Professional"
                            value={edu.school}
                            onChange={(e) => {
                              const newList = [...eduList];
                              newList[idx].school = e.target.value;
                              setEduList(newList);
                            }}
                            className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Dates</Label>
                          <Input 
                            placeholder="2018 - 2021"
                            value={edu.dates}
                            onChange={(e) => {
                              const newList = [...eduList];
                              newList[idx].dates = e.target.value;
                              setEduList(newList);
                            }}
                            className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Details</Label>
                          <Input 
                            placeholder="Focused on software engineering fundamentals..."
                            value={edu.details}
                            onChange={(e) => {
                              const newList = [...eduList];
                              newList[idx].details = e.target.value;
                              setEduList(newList);
                            }}
                            className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {eduList.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <p className="text-zinc-400 text-xs font-medium">No education entries added. Click "Add education".</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Certifications Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mt-6">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Certifications</h3>
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={() => setCertList([...certList, { id: crypto.randomUUID(), name: "", issuer: "", date: "" }])}
                    className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm px-4"
                  >
                    Add certification
                  </Button>
                </div>

                <div className="space-y-6">
                  {certList.map((cert, idx) => (
                    <div key={cert.id} className="grid grid-cols-1 md:grid-cols-[2fr,2fr,1fr,auto] gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Name</Label>
                        <Input 
                          placeholder="Professional Software Developer"
                          value={cert.name}
                          onChange={(e) => {
                            const newList = [...certList];
                            newList[idx].name = e.target.value;
                            setCertList(newList);
                          }}
                          className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900 font-semibold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Issuer</Label>
                        <Input 
                          placeholder="Global Technology Institute"
                          value={cert.issuer}
                          onChange={(e) => {
                            const newList = [...certList];
                            newList[idx].issuer = e.target.value;
                            setCertList(newList);
                          }}
                          className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Date</Label>
                        <Input 
                          placeholder="2024"
                          value={cert.date}
                          onChange={(e) => {
                            const newList = [...certList];
                            newList[idx].date = e.target.value;
                            setCertList(newList);
                          }}
                          className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setCertList(certList.filter(c => c.id !== cert.id))}
                        className="h-10 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium px-4"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {certList.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <p className="text-zinc-400 text-xs font-medium">No certifications added. Click "Add certification".</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Achievements Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mt-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-6 border-b pb-4">Achievements</h3>
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Delivered measurable improvements in devops engineer execution quality. Maintained high consistency on timelines, compliance, and stakeholder communication."
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    className="min-h-[100px] p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y bg-white dark:bg-zinc-900"
                  />
                </div>
              </div>

              {/* Publications Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mt-6">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">Publications</h3>
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={() => setPubList([...pubList, { id: crypto.randomUUID(), title: "", publisher: "", date: "" }])}
                    className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm px-4"
                  >
                    Add publication
                  </Button>
                </div>

                <div className="space-y-6">
                  {pubList.map((pub, idx) => (
                    <div key={pub.id} className="grid grid-cols-1 md:grid-cols-[2fr,2fr,1fr,auto] gap-4 items-end animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Title</Label>
                        <Input 
                          placeholder="Research Paper Name"
                          value={pub.title}
                          onChange={(e) => {
                            const newList = [...pubList];
                            newList[idx].title = e.target.value;
                            setPubList(newList);
                          }}
                          className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900 font-semibold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Publisher</Label>
                        <Input 
                          placeholder="Journal or Platform"
                          value={pub.publisher}
                          onChange={(e) => {
                            const newList = [...pubList];
                            newList[idx].publisher = e.target.value;
                            setPubList(newList);
                          }}
                          className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Date</Label>
                        <Input 
                          placeholder="2024"
                          value={pub.date}
                          onChange={(e) => {
                            const newList = [...pubList];
                            newList[idx].date = e.target.value;
                            setPubList(newList);
                          }}
                          className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setPubList(pubList.filter(p => p.id !== pub.id))}
                        className="h-10 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium px-4"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {pubList.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <p className="text-zinc-400 text-xs font-medium">No publications added. Click "Add publication".</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mt-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-6 border-b pb-4">Additional Information</h3>
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Contributes to internal playbooks and onboarding documentation."
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="min-h-[100px] p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-y bg-white dark:bg-zinc-900"
                  />
                </div>
              </div>

              {/* References Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 mt-6">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">References</h3>
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={() => setRefList([...refList, { id: crypto.randomUUID(), name: "", role: "", organization: "", phone: "", email: "" }])}
                    className="h-8 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-sm px-4"
                  >
                    Add reference
                  </Button>
                </div>

                <div className="space-y-6">
                  {refList.map((ref, idx) => (
                    <div key={ref.id} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-center mb-5">
                        <h4 className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">Reference {idx + 1}</h4>
                        <Button 
                          variant="outline" size="sm" 
                          className="border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-semibold shadow-sm h-8 px-3"
                          onClick={() => setRefList(refList.filter(r => r.id !== ref.id))}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Name</Label>
                          <Input 
                            placeholder="Name"
                            value={ref.name}
                            onChange={(e) => {
                              const n = [...refList]; n[idx].name = e.target.value; setRefList(n);
                            }}
                            className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900 font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Role</Label>
                          <Input 
                            placeholder="Role"
                            value={ref.role}
                            onChange={(e) => {
                              const n = [...refList]; n[idx].role = e.target.value; setRefList(n);
                            }}
                            className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Organization</Label>
                          <Input 
                            placeholder="Organization"
                            value={ref.organization}
                            onChange={(e) => {
                              const n = [...refList]; n[idx].organization = e.target.value; setRefList(n);
                            }}
                            className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Phone</Label>
                          <Input 
                            placeholder="Phone"
                            value={ref.phone}
                            onChange={(e) => {
                              const n = [...refList]; n[idx].phone = e.target.value; setRefList(n);
                            }}
                            className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Email</Label>
                          <Input 
                            placeholder="Email"
                            value={ref.email}
                            onChange={(e) => {
                              const n = [...refList]; n[idx].email = e.target.value; setRefList(n);
                            }}
                            className="h-10 text-sm shadow-sm bg-white dark:bg-zinc-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {refList.length === 0 && (
                    <div className="text-center py-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                      <p className="text-zinc-400 text-xs font-medium">No references added. Click "Add reference".</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

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

          <Card className="h-fit lg:col-span-7 sticky top-6">
            <CardHeader className="pb-4">
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
            <CardContent className="space-y-6">
              {/* ATS Score Display */}
              {resume && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 mb-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                      <div className="relative h-24 w-24 flex-shrink-0">
                        <svg className="h-full w-full transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="44"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-zinc-800"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="44"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 44}
                            strokeDashoffset={2 * Math.PI * 44 * (1 - (atsScore?.ats_score || 0) / 100)}
                            className={`${(atsScore?.ats_score || 0) >= 80 ? 'text-emerald-500' : (atsScore?.ats_score || 0) >= 60 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black">{isCalculatingScore ? '...' : (atsScore?.ats_score || 0)}%</span>
                          <span className="text-[8px] font-bold tracking-widest uppercase opacity-50">Match</span>
                        </div>
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <div className={`h-2 w-2 rounded-full animate-pulse ${(atsScore?.ats_score || 0) >= 80 ? 'bg-emerald-500' : (atsScore?.ats_score || 0) >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                          <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">ATS Compatibility Analysis</span>
                        </div>
                        <h4 className="text-lg font-bold mb-2">
                          {isCalculatingScore ? 'Analyzing compatibility...' : (atsScore?.ats_score || 0) >= 80 ? 'Excellent Match! Ready to Apply.' : (atsScore?.ats_score || 0) >= 60 ? 'Strong Match with Minor Gaps.' : 'Needs Optimization for this Role.'}
                        </h4>
                        <p className="text-sm text-zinc-400 max-w-md line-clamp-2">
                          {atsScore?.overall_assessment || 'Generate a detailed analysis to see how your resume stacks up against the job requirements.'}
                        </p>
                      </div>

                      <Button 
                        size="sm" 
                        onClick={() => calculateATS(resume, jobKeywords)} 
                        disabled={isCalculatingScore}
                        className="bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-6 h-10 rounded-xl flex-shrink-0"
                      >
                        {isCalculatingScore ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                        Re-Scan
                      </Button>
                    </div>

                    {atsScore && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Matched</p>
                          <p className="text-lg font-bold text-emerald-500">{atsScore.matched_keywords.length}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Missing</p>
                          <p className="text-lg font-bold text-rose-500">{atsScore.missing_keywords.length}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Gaps</p>
                          <p className="text-lg font-bold text-amber-500">{atsScore.critical_gaps.length}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Strengths</p>
                          <p className="text-lg font-bold text-blue-500">{atsScore.strength_areas.length}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                        <SelectItem value="docx">Word Document (.docx)</SelectItem>
                        <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                        {TEMPLATE_OPTIONS.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      variant="default" 
                      onClick={handleDownload} 
                      disabled={isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 font-semibold"
                    >
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
                    selectedTemplate === 'txt' || selectedTemplate === 'docx' ? (
                      <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg max-h-[600px] overflow-y-auto border">
                        {resume}
                      </pre>
                    ) : (
                      <div className="bg-slate-100/80 dark:bg-zinc-900/50 py-8 px-2 md:px-8 rounded-xl w-full border border-slate-200 dark:border-zinc-800 shadow-inner h-[calc(100vh-250px)] min-h-[800px] overflow-y-auto overflow-x-auto custom-scrollbar flex flex-col items-center">
                        <div className={`w-[210mm] min-w-[210mm] ${pageStrategy === 'one_page' ? 'h-[297mm]' : 'h-auto min-h-[297mm]'} bg-white shadow-xl hover:shadow-2xl transition-shadow shrink-0 origin-top transform scale-[0.8] md:scale-[0.85] lg:scale-[0.75] xl:scale-[0.9] 2xl:scale-100 ${pageStrategy === 'one_page' ? 'mb-4' : 'mb-20'} mx-auto block overflow-hidden`}>
                           <iframe 
                             srcDoc={generateATSHTML(prepareResumeData(), selectedTemplate as any)} 
                             title="Resume Preview"
                             className={`w-full border-0 block ${pageStrategy === 'one_page' ? 'h-[297mm]' : 'h-[3500px]'}`}
                             scrolling="no"
                             sandbox="allow-same-origin"
                           />
                        </div>
                        {pageStrategy !== 'one_page' && <div className="h-20" />} {/* Spacer for multi-page */}
                      </div>
                    )
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border rounded-lg border-dashed">
                  <FileText className="h-12 w-12 mb-4 opacity-50" />
                  <p>Generate your resume first</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ResumeBuilder;
