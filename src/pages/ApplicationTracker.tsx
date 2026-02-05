import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Briefcase, Calendar, FileText, Plus, Pencil, Trash2, ExternalLink, Building2, Clock, Upload, X, Download, Eye } from "lucide-react";
import { format } from "date-fns";

type ApplicationStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

interface Application {
  id: string;
  job_id: string;
  resume_id: string | null;
  status: ApplicationStatus;
  applied_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  jobs: {
    job_title: string;
    company_name: string | null;
    job_description: string;
  } | null;
  resumes: {
    title: string;
    ats_score: number | null;
  } | null;
  resume_history: {
    job_title: string;
  }[] | { job_title: string } | null;
  manual_resume_url?: string | null;
  resume_history_id?: string | null;
}

const statusColors: Record<ApplicationStatus, string> = {
  saved: "bg-muted text-muted-foreground",
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  interview: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusLabels: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export default function ApplicationTracker() {
  const queryClient = useQueryClient();
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<ApplicationStatus>("saved");
  const [editNotes, setEditNotes] = useState("");
  const [editAppliedDate, setEditAppliedDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Manual Job Entry State
  const [manualJobTitle, setManualJobTitle] = useState("");
  const [manualCompanyName, setManualCompanyName] = useState("");
  const [manualJobDescription, setManualJobDescription] = useState("");
  const [manualStatus, setManualStatus] = useState<string>("applied");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editResumeId, setEditResumeId] = useState<string | null>(null);
  const [editManualResumeUrl, setEditManualResumeUrl] = useState<string | null>(null);
  const [editResumeFileName, setEditResumeFileName] = useState<string | null>(null);

  const [manualResumeId, setManualResumeId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [manualResumeUrl, setManualResumeUrl] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  // Fetch applications with related job and resume data
  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          jobs (job_title, company_name, job_description),
          resumes (title, ats_score),
          resume_history (job_title)
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data as unknown) as Application[];
    },
  });

  // Fetch jobs for creating new applications
  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("jobs")
        .select("id, job_title, company_name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch both regular resumes and resume history for linking
  const { data: resumes } = useQuery({
    queryKey: ["resumes-list"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const [{ data: regularResumes }, { data: historyResumes }] = await Promise.all([
        supabase
          .from("resumes")
          .select("id, title, ats_score")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("resume_history")
          .select("id, job_title")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
      ]);

      const formattedRegular = (regularResumes || []).map(r => ({
        id: r.id,
        title: r.title,
        ats_score: r.ats_score,
        source: 'resumes' as const
      }));

      const formattedHistory = (historyResumes || []).map(r => ({
        id: r.id,
        title: `Generated: ${r.job_title}`,
        ats_score: null,
        source: 'resume_history' as const
      }));

      return [...formattedRegular, ...formattedHistory];
    },
  });

  // Update application mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes, applied_date, resume_id, resume_history_id, manual_resume_url }: { id: string; status: string; notes: string; applied_date: string | null; resume_id: string | null; resume_history_id: string | null; manual_resume_url: string | null }) => {
      const { error } = await supabase
        .from("applications")
        .update({
          status,
          notes,
          applied_date: applied_date || null,
          resume_id: resume_id || null,
          resume_history_id: resume_history_id || null,
          manual_resume_url: manual_resume_url || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application updated!");
      setIsEditDialogOpen(false);
      setEditingApp(null);
    },
    onError: (error) => {
      toast.error("Failed to update application");
      console.error(error);
    },
  });

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application removed");
    },
    onError: (error) => {
      toast.error("Failed to delete application");
      console.error(error);
    },
  });

  // Create application mutation
  const createMutation = useMutation({
    mutationFn: async ({ job_id, resume_id }: { job_id: string; resume_id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          job_id,
          resume_id: resume_id || null,
          status: "saved",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Job added to tracker!");
    },
    onError: (error) => {
      toast.error("Failed to add application");
      console.error(error);
    },
  });

  // Create manual application mutation
  const createManualMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Create the Job
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .insert({
          user_id: user.id,
          job_title: manualJobTitle,
          company_name: manualCompanyName,
          job_description: manualJobDescription || "Manually added job",
          required_skills: [], // Empty for manual entry
          keywords: []
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Determine which source the selected resume is from
      const selectedResume = resumes?.find(r => r.id === manualResumeId);

      // 2. Create the Application
      const { error: appError } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          job_id: jobData.id,
          status: manualStatus,
          applied_date: manualStatus === "applied" ? new Date().toISOString().split("T")[0] : null,
          resume_id: selectedResume?.source === 'resumes' ? manualResumeId : null,
          resume_history_id: selectedResume?.source === 'resume_history' ? manualResumeId : null,
          manual_resume_url: manualResumeUrl,
        });

      if (appError) throw appError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] }); // Also refresh jobs
      toast.success("Manual application added!");
      setIsDialogOpen(false);
      // Reset form
      setManualJobTitle("");
      setManualCompanyName("");
      setManualJobDescription("");
      setManualStatus("applied");
      setManualResumeId(null);
      setManualResumeUrl(null);
      setResumeFileName(null);
    },
    onError: (error) => {
      toast.error("Failed to add manual application");
      console.error(error);
    },
  });



  const handleEdit = (app: Application) => {
    setEditingApp(app);
    setEditStatus((app.status as ApplicationStatus) || "saved");
    setEditNotes(app.notes || "");
    setEditAppliedDate(app.applied_date || "");
    setEditResumeId(app.resume_id || app.resume_history_id || "none");
    setEditManualResumeUrl(app.manual_resume_url || null);
    setEditResumeFileName(app.manual_resume_url ? "Uploaded CV" : null);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingApp) return;

    // Determine which source the selected resume is from
    const selectedResume = resumes?.find(r => r.id === editResumeId);

    updateMutation.mutate({
      id: editingApp.id,
      status: editStatus,
      notes: editNotes,
      applied_date: editAppliedDate || null,
      resume_id: selectedResume?.source === 'resumes' ? editResumeId : null,
      resume_history_id: selectedResume?.source === 'resume_history' ? editResumeId : null,
      manual_resume_url: editResumeId === "none" ? editManualResumeUrl : null
    });
  };

  const filteredApplications = applications?.filter(app =>
    filterStatus === "all" || app.status === filterStatus
  ) || [];

  // Stats
  const stats = {
    total: applications?.length || 0,
    applied: applications?.filter(a => a.status === "applied").length || 0,
    interviews: applications?.filter(a => a.status === "interview").length || 0,
    offers: applications?.filter(a => a.status === "offer").length || 0,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Application Tracker</h1>
            <p className="text-muted-foreground">Track your job applications and stay organized</p>
          </div>

          <div className="hidden">
            {/* Hidden input for file upload, triggered programmatically */}
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setIsUploading(true);
                try {
                  const fileExt = file.name.split('.').pop();
                  const fileName = `${Math.random()}.${fileExt}`;
                  const filePath = `manual_uploads/${fileName}`;

                  const { error: uploadError } = await supabase.storage
                    .from('resumes')
                    .upload(filePath, file);

                  if (uploadError) throw uploadError;

                  const { data: { publicUrl } } = supabase.storage
                    .from('resumes')
                    .getPublicUrl(filePath);

                  setManualResumeUrl(publicUrl);
                  setResumeFileName(file.name);
                  toast.success("Resume uploaded!");
                } catch (error) {
                  console.error('Upload failed:', error);
                  toast.error("Failed to upload resume. Make sure 'resumes' bucket exists.");
                } finally {
                  setIsUploading(false);
                }
              }}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Track New Job
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Job to Tracker</DialogTitle>
                <DialogDescription>
                  Select a previously analyzed job or manually add a new one.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Tabs defaultValue="analyzed" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="analyzed">Analyzed Jobs</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  </TabsList>

                  <TabsContent value="analyzed" className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {jobs?.length ? (
                      <div className="space-y-2">
                        {jobs.map((job) => (
                          <Card
                            key={job.id}
                            className="cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => {
                              createMutation.mutate({ job_id: job.id });
                              setIsDialogOpen(false);
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{job.job_title}</p>
                                  {job.company_name && (
                                    <p className="text-sm text-muted-foreground">{job.company_name}</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-2">No analyzed jobs found.</p>
                        <Button variant="outline" size="sm" asChild>
                          <a href="/job-analyzer">Go to Analyzer</a>
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="manual" className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Job Title <span className="text-red-500">*</span></label>
                      <Input
                        placeholder="e.g. Senior React Developer"
                        value={manualJobTitle}
                        onChange={(e) => setManualJobTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company Name <span className="text-red-500">*</span></label>
                      <Input
                        placeholder="e.g. Acme Corp"
                        value={manualCompanyName}
                        onChange={(e) => setManualCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Job Description / Link</label>
                      <Textarea
                        placeholder="Paste JD or URL here..."
                        value={manualJobDescription}
                        onChange={(e) => setManualJobDescription(e.target.value)}
                        className="h-20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Initial Status</label>
                      <Select value={manualStatus} onValueChange={setManualStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="saved">Saved</SelectItem>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {manualStatus === "applied" && (
                      <div className="space-y-2 animate-in fade-in-50">
                        <label className="text-sm font-medium">Linked Resume (CV Uploaded)</label>

                        <div className="flex flex-col gap-3">
                          {!manualResumeUrl ? (
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center gap-2 border-dashed"
                                onClick={() => document.getElementById('resume-upload')?.click()}
                                disabled={isUploading}
                              >
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {isUploading ? "Uploading..." : "Upload from Device"}
                                </span>
                              </Button>

                              <div className="border rounded-md p-3 bg-muted/20 flex flex-col items-center justify-center text-center">
                                <p className="text-xs text-muted-foreground mb-2">Or select generated:</p>
                                <Select value={manualResumeId || "none"} onValueChange={(v) => setManualResumeId(v === "none" ? null : v)}>
                                  <SelectTrigger className="w-full h-8 text-xs">
                                    <SelectValue placeholder="Select Generated" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {resumes?.map((resume) => (
                                      <SelectItem key={`${resume.source}-${resume.id}`} value={resume.id}>
                                        {resume.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span className="text-sm font-medium truncate">{resumeFileName || "Uploaded Resume"}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setManualResumeUrl(null);
                                  setResumeFileName(null);
                                }}
                              >
                                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <Button
                      className="w-full mt-2"
                      disabled={!manualJobTitle || !manualCompanyName || createManualMutation.isPending}
                      onClick={() => createManualMutation.mutate()}
                    >
                      {createManualMutation.isPending ? "Adding..." : "Add Manual Application"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applied</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applied}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.interviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offers</CardTitle>
              <ExternalLink className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.offers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({applications?.length || 0})</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="applied">Applied</TabsTrigger>
            <TabsTrigger value="interview">Interview</TabsTrigger>
            <TabsTrigger value="offer">Offer</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={filterStatus} className="mt-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading applications...
                </CardContent>
              </Card>
            ) : filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-lg font-medium">No applications yet</p>
                  <p className="text-muted-foreground">
                    {filterStatus === "all"
                      ? "Start by analyzing a job and adding it to your tracker"
                      : `No applications with status "${statusLabels[filterStatus as ApplicationStatus]}"`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Resume</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">
                          {app.jobs?.job_title || "Unknown Job"}
                        </TableCell>
                        <TableCell>
                          {app.jobs?.company_name || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[app.status as ApplicationStatus]}>
                            {statusLabels[app.status as ApplicationStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {app.applied_date
                            ? format(new Date(app.applied_date), "MMM d, yyyy")
                            : "—"
                          }
                        </TableCell>
                        <TableCell>
                          {app.resumes ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{app.resumes.title}</span>
                              {app.resumes.ats_score && (
                                <Badge variant="outline" className="text-xs">
                                  {app.resumes.ats_score}%
                                </Badge>
                              )}
                            </div>
                          ) : app.resume_history ? (
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-3 w-3 text-primary" />
                              <span>
                                {Array.isArray(app.resume_history)
                                  ? app.resume_history[0]?.job_title
                                  : (app.resume_history as any).job_title || "Generated Resume"}
                              </span>
                            </div>
                          ) : app.manual_resume_url ? (
                            <a
                              href={app.manual_resume_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              <FileText className="h-3 w-3" />
                              View Uploaded CV
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(app.updated_at), "MMM d")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(app)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Remove this application?")) {
                                  deleteMutation.mutate(app.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Application</DialogTitle>
              <DialogDescription>
                {editingApp?.jobs?.job_title} {editingApp?.jobs?.company_name && `at ${editingApp.jobs.company_name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as ApplicationStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Applied Date</label>
                <Input
                  type="date"
                  value={editAppliedDate}
                  onChange={(e) => setEditAppliedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Add notes about this application..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Linked Resume</label>
                <div className="flex flex-col gap-2">
                  <Select value={editResumeId || "none"} onValueChange={setEditResumeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Manual Upload / No Resume</SelectItem>
                      {resumes?.map((resume) => (
                        <SelectItem key={`${resume.source}-${resume.id}`} value={resume.id}>
                          {resume.title} {resume.ats_score ? `(${resume.ats_score}%)` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {editResumeId === "none" && (
                    <div className="mt-2">
                      {editManualResumeUrl ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                              <span className="text-sm font-medium truncate">{editResumeFileName || "Manual Upload"}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setEditManualResumeUrl(null);
                                setEditResumeFileName(null);
                              }}
                              title="Remove Link"
                            >
                              <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full"
                              asChild
                            >
                              <a href={editManualResumeUrl} target="_blank" rel="noreferrer">
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                // Trigger download manually if browser doesn't do it automatically
                                const link = document.createElement('a');
                                link.href = editManualResumeUrl!;
                                link.download = editResumeFileName || 'resume.pdf';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-dashed"
                          onClick={() => {
                            // Re-use logic for edit context
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = '.pdf,.doc,.docx';
                            input.onchange = async (e: any) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploading(true);
                              try {
                                const fileExt = file.name.split('.').pop();
                                const fileName = `${Math.random()}.${fileExt}`;
                                const filePath = `manual_uploads/${fileName}`;
                                const { error: uploadError } = await supabase.storage.from('resumes').upload(filePath, file);
                                if (uploadError) throw uploadError;
                                const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(filePath);
                                setEditManualResumeUrl(publicUrl);
                                setEditResumeFileName(file.name);
                                toast.success("Resume uploaded!");
                              } catch (error) {
                                toast.error("Upload failed");
                              } finally {
                                setIsUploading(false);
                              }
                            };
                            input.click();
                          }}
                          disabled={isUploading}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {isUploading ? "Uploading..." : "Upload New Resume"}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
