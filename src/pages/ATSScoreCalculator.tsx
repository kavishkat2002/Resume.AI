import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, BarChart3, CheckCircle, XCircle, Lightbulb, AlertTriangle, TrendingUp, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SectionAnalysis {
  summary?: number;
  skills?: number;
  experience?: number;
  projects?: number;
  education?: number;
}

interface ATSScore {
  ats_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  keyword_frequency: Record<string, number>;
  section_analysis: SectionAnalysis;
  improvement_tips: string[];
  critical_gaps: string[];
  strength_areas: string[];
  overall_assessment: string;
}

const ATSScoreCalculator = () => {
  const [jobKeywords, setJobKeywords] = useState(() => localStorage.getItem("ats_jobKeywords") || "");
  const [resumeContent, setResumeContent] = useState(() => localStorage.getItem("ats_resumeContent") || "");
  const [score, setScore] = useState<ATSScore | null>(() => {
    const saved = localStorage.getItem("ats_score_result");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("ats_jobKeywords", jobKeywords);
    localStorage.setItem("ats_resumeContent", resumeContent);
    if (score) {
      localStorage.setItem("ats_score_result", JSON.stringify(score));
    } else {
      localStorage.removeItem("ats_score_result");
    }
  }, [jobKeywords, resumeContent, score]);

  const parseCommaSeparated = (text: string): string[] => {
    return text.split(",").map(s => s.trim()).filter(s => s.length > 0);
  };

  const handleCalculate = async () => {
    if (!resumeContent.trim()) {
      toast.error("Please paste your resume content");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-ats-score", {
        body: {
          jobKeywords: parseCommaSeparated(jobKeywords),
          resumeContent,
        },
      });

      if (error) throw error;
      setScore(data);
      toast.success("ATS score calculated!");
    } catch (error) {
      console.error("Error calculating ATS score:", error);
      toast.error("Failed to calculate ATS score");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    if (percentage >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">ATS Score Calculator</h1>
            <p className="text-muted-foreground">Check how well your resume matches the job requirements</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Keywords</CardTitle>
                <CardDescription>Enter keywords from the job description (comma-separated)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="React, TypeScript, Node.js, AWS, GraphQL, REST API, Git, Agile, CI/CD, Docker"
                  value={jobKeywords}
                  onChange={(e) => setJobKeywords(e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume Content</CardTitle>
                <CardDescription>Paste your resume text (plain text format works best)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your entire resume content here...
"
                  value={resumeContent}
                  onChange={(e) => setResumeContent(e.target.value)}
                  className="min-h-[300px]"
                />
                <Button onClick={handleCalculate} disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-5 w-5" />
                      Calculate ATS Score
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {score && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>ATS Score</span>
                    <div className="text-right">
                      <span className={`text-5xl font-bold ${getScoreColor(score.ats_score)}`}>
                        {score.ats_score}%
                      </span>
                      <p className={`text-sm ${getScoreColor(score.ats_score)}`}>
                        {getScoreLabel(score.ats_score)}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={score.ats_score} className="h-4" />
                  <p className="text-muted-foreground">{score.overall_assessment}</p>
                </CardContent>
              </Card>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Matched ({score.matched_keywords.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                      {score.matched_keywords.map((keyword, i) => (
                        <Badge key={i} variant="default" className="flex items-center gap-1">
                          {keyword}
                          {score.keyword_frequency[keyword] > 1 && (
                            <span className="text-xs opacity-70">×{score.keyword_frequency[keyword]}</span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      Missing ({score.missing_keywords.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                      {score.missing_keywords.map((keyword, i) => (
                        <Badge key={i} variant="destructive">{keyword}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {score.critical_gaps.length > 0 && (
                <Card className="border-orange-200 dark:border-orange-900">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Critical Gaps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {score.critical_gaps.map((gap, i) => (
                        <Badge key={i} variant="outline" className="border-orange-500 text-orange-600">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {score.strength_areas.length > 0 && (
                <Card className="border-green-200 dark:border-green-900">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Strength Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {score.strength_areas.map((strength, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Improvement Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {score.improvement_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-xs">
                          {i + 1}
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {Object.keys(score.section_analysis).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Section Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(score.section_analysis).map(([section, sectionScore]) => (
                      <div key={section} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{section}</span>
                          <span className={getScoreColor(sectionScore as number)}>{sectionScore}%</span>
                        </div>
                        <Progress value={sectionScore as number} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ATSScoreCalculator;
