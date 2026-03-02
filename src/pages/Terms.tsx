import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Terms = () => {
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
            <CardTitle className="text-3xl font-bold">Terms & Conditions</CardTitle>
            <p className="text-muted-foreground italic mt-2">
              Last updated: March 2026 • Humanatic Usage Framework
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>
                By using ResumAI, you agree to these Terms and Conditions. Our platform is designed to provide career planning, ATS optimization, and AI-powered skill analysis.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">2. Humanatic Integration</h2>
              <p>
                The platform utilizes Humanatic-verified benchmarks to ensure your profile is optimized for modern recruiters. Use of the system for unlawful or unethical purposes is strictly prohibited.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">3. Intellectual Property</h2>
              <p>
                The AI models, algorithms, and interface of ResumAI are the property of Creative Lab. Any unauthorized duplication or distribution is prohibited.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">4. Disclaimer of Warranty</h2>
              <p>
                While our algorithms aim to maximize your job chances, we cannot guarantee job placement. ResumAI is provided "as is" with no warranty for specific outcomes.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-3">5. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws applicable to Creative Lab's jurisdiction.
              </p>
            </section>
            
            <footer className="mt-12 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                For legal inquiries, please contact us at info.kavishkathilakarathna@gmail.com
                <br />
                © 2026 Creative Lab. All rights reserved.
              </p>
            </footer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Terms;
