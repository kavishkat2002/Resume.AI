import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, GraduationCap, Lightbulb, FolderGit2, Wrench, Route, ExternalLink, Clock, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SkillToLearn {
  skill: string;
  priority: string;
  estimated_time: string;
  free_resources: { name: string; url: string }[];
  why_important: string;
}

interface ProjectIdea {
  name: string;
  description: string;
  skills_demonstrated: string[];
  difficulty: string;
  estimated_time: string;
  tech_stack: string[];
  resume_bullet: string;
}

interface ProjectImprovement {
  project_name: string;
  improvements: string[];
  new_skills_added: string[];
  impact: string;
}

interface ToolToLearn {
  tool: string;
  category: string;
  priority: string;
  free_resource: string;
  time_to_learn: string;
}

interface LearningStep {
  week: string;
  focus: string;
  goals: string[];
  deliverables: string[];
}

interface LearningSuggestions {
  skills_to_learn: SkillToLearn[];
  project_ideas: ProjectIdea[];
  project_improvements: ProjectImprovement[];
  tools_to_learn: ToolToLearn[];
  learning_path: LearningStep[];
  overall_strategy: string;
}

const LearningSuggestions = () => {
  const [missingSkills, setMissingSkills] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [existingProjects, setExistingProjects] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [suggestions, setSuggestions] = useState<LearningSuggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const parseCommaSeparated = (text: string): string[] => {
    return text.split(",").map(s => s.trim()).filter(s => s.length > 0);
  };

  const parseProjects = (text: string): { name: string; description: string }[] => {
    return text.split("\n").filter(line => line.trim()).map(line => {
      const [name, ...desc] = line.split("-");
      return { name: name.trim(), description: desc.join("-").trim() };
    });
  };

  const handleGenerate = async () => {
    const skills = parseCommaSeparated(missingSkills);
    if (skills.length === 0) {
      toast.error("Please enter missing skills");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-learning", {
        body: {
          missingSkills: skills,
          currentSkills: parseCommaSeparated(currentSkills),
          existingProjects: parseProjects(existingProjects),
          targetRole,
        },
      });

      if (error) throw error;
      setSuggestions(data);
      toast.success("Learning suggestions generated!");
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Failed to generate suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high" || priority === "essential") return "destructive";
    if (priority === "medium" || priority === "recommended") return "default";
    return "secondary";
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Learning Suggestions</h1>
            <p className="text-muted-foreground">Get personalized learning path and project ideas</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Your Input</CardTitle>
              <CardDescription>Tell us about your skill gaps and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Role</label>
                <Input
                  placeholder="e.g., Frontend Developer Intern"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Missing Skills (comma-separated)</label>
                <Textarea
                  placeholder="TypeScript, GraphQL, AWS, Docker, Testing"
                  value={missingSkills}
                  onChange={(e) => setMissingSkills(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Skills (comma-separated)</label>
                <Textarea
                  placeholder="JavaScript, React, Node.js, Git"
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Existing Projects (one per line)</label>
                <Textarea
                  placeholder="Portfolio Website - Personal site with React
Todo App - Simple task manager"
                  value={existingProjects}
                  onChange={(e) => setExistingProjects(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Get Suggestions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {suggestions && (
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Strategy Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{suggestions.overall_strategy}</p>
                </CardContent>
              </Card>

              <Tabs defaultValue="skills" className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="improvements">Improve</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="path">Path</TabsTrigger>
                </TabsList>

                <TabsContent value="skills" className="space-y-4">
                  {suggestions.skills_to_learn.map((skill, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                          {skill.skill}
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(skill.priority)}>{skill.priority}</Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {skill.estimated_time}
                            </Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{skill.why_important}</p>
                        <div>
                          <p className="text-sm font-medium mb-2">Free Resources:</p>
                          <div className="flex flex-wrap gap-2">
                            {skill.free_resources.map((resource, j) => (
                              <a
                                key={j}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                {resource.name}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                  {suggestions.project_ideas.map((project, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <FolderGit2 className="h-5 w-5" />
                            {project.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{project.difficulty}</Badge>
                            <Badge variant="outline">{project.estimated_time}</Badge>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <div>
                          <p className="text-sm font-medium mb-1">Tech Stack:</p>
                          <div className="flex flex-wrap gap-1">
                            {project.tech_stack.map((tech, j) => (
                              <Badge key={j} variant="default">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Skills Demonstrated:</p>
                          <div className="flex flex-wrap gap-1">
                            {project.skills_demonstrated.map((skill, j) => (
                              <Badge key={j} variant="outline">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="bg-muted p-3 rounded">
                          <p className="text-xs font-medium mb-1">Resume Bullet:</p>
                          <p className="text-sm italic">"{project.resume_bullet}"</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="improvements" className="space-y-4">
                  {suggestions.project_improvements.length > 0 ? (
                    suggestions.project_improvements.map((improvement, i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{improvement.project_name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-2">Suggested Improvements:</p>
                            <ul className="space-y-1">
                              {improvement.improvements.map((imp, j) => (
                                <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary">•</span>
                                  {imp}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">New Skills Added:</p>
                            <div className="flex flex-wrap gap-1">
                              {improvement.new_skills_added.map((skill, j) => (
                                <Badge key={j} variant="default">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <strong>Impact:</strong> {improvement.impact}
                          </p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No project improvements suggested. Add some existing projects to get recommendations.
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="tools" className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {suggestions.tools_to_learn.map((tool, i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Wrench className="h-4 w-4" />
                              {tool.tool}
                            </span>
                            <Badge variant={getPriorityColor(tool.priority)}>{tool.priority}</Badge>
                          </CardTitle>
                          <CardDescription>{tool.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {tool.time_to_learn}
                          </div>
                          <a
                            href={tool.free_resource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            Learn Free
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="path" className="space-y-4">
                  <div className="relative">
                    {suggestions.learning_path.map((step, i) => (
                      <div key={i} className="flex gap-4 pb-8 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                            {i + 1}
                          </div>
                          {i < suggestions.learning_path.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>
                        <Card className="flex-1">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Route className="h-5 w-5" />
                              Week {step.week}: {step.focus}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-sm font-medium mb-1">Goals:</p>
                              <ul className="space-y-1">
                                {step.goals.map((goal, j) => (
                                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary">✓</span>
                                    {goal}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Deliverables:</p>
                              <div className="flex flex-wrap gap-1">
                                {step.deliverables.map((deliverable, j) => (
                                  <Badge key={j} variant="outline">{deliverable}</Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default LearningSuggestions;
