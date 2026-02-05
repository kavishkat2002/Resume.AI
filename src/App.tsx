import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import JobAnalyzer from "./pages/JobAnalyzer";
import GitHubAnalyzer from "./pages/GitHubAnalyzer";
import LinkedInAnalyzer from "./pages/LinkedInAnalyzer";
import SkillsMatcher from "./pages/SkillsMatcher";
import ResumeBuilder from "./pages/ResumeBuilder";
import ATSScoreCalculator from "./pages/ATSScoreCalculator";
import LearningSuggestions from "./pages/LearningSuggestions";
import ApplicationTracker from "./pages/ApplicationTracker";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analyze" element={<JobAnalyzer />} />
          <Route path="/github" element={<GitHubAnalyzer />} />
          <Route path="/linkedin" element={<LinkedInAnalyzer />} />
          <Route path="/skills" element={<SkillsMatcher />} />
          <Route path="/resume" element={<ResumeBuilder />} />
          <Route path="/ats-score" element={<ATSScoreCalculator />} />
          <Route path="/learn" element={<LearningSuggestions />} />
          <Route path="/applications" element={<ApplicationTracker />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
