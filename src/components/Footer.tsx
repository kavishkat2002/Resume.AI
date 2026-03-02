import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border py-8 px-4 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2026 Creative Lab. All rights reserved.
          </p>
          <p className="text-[10px] text-zinc-400 text-center md:text-left">
            Powered by ResumAI • Humanatic Compliance
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/privacy" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/terms" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};
