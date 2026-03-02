import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <header className="mb-8 container mx-auto px-4">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ResumAI</span>
        </Link>
        <Link to={-1 as any}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
      </header>

      <main className="container mx-auto px-4 max-w-4xl">
        <Card className="border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
            <p className="text-muted-foreground italic mt-2">
              Last updated: March 2026 • Humanatic Compliance Verified
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">1. Data Collection</h2>
              <p>
                ResumAI collects information provided during resume generation, account creation, and integration with third-party platforms like GitHub and LinkedIn. This data is used solely to enhance your job-seeking experience.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">2. Humanatic Compliance</h2>
              <p>
                Our data processing systems are built with Humanatic-verified security protocols. This ensures that your professional data is handled with the highest standards of integrity and transparency.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To generate and optimize ATS-friendly resumes.</li>
                <li>To provide job matching and skills GAP analysis.</li>
                <li>To improve our AI-powered career advisory services.</li>
                <li>To secure and protect your professional identity.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">4. Your Rights</h2>
              <p>
                You have the right to access, export, or delete your data at any time through your Profile settings. Your privacy is our priority.
              </p>
            </section>
            
            <footer className="mt-12 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                For questions regarding this policy, please contact us at support@creativelab.com
              </p>
            </footer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Privacy;
