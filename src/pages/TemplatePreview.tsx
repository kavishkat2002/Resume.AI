import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Save, FileEdit, LogOut, Layout, Eye, FileDown, Trash2, Settings2, RotateCcw, Type, AlignLeft, LayoutGrid } from "lucide-react";
import { TEMPLATE_OPTIONS, generateATSHTML } from "@/components/resume-templates";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

// Dummy data for the preview
const dummyData = {
  fullName: "Noah Mitchell",
  email: "noahmitchell@example.com",
  phone: "+1 (555) 0137-1659",
  location: "Denver, CO",
  linkedin: "linkedin.com/in/noahmitchell",
  portfolio: "portfolio.example/architect",
  github: "",
  jobTitle: "Architect",
  customContacts: [] as any[],
  summary: "Architect experienced in site coordination, technical execution, and quality assurance. Leadership-ready profile with strategic impact highlights, skilled in managing cross-functional teams to deliver high-quality residential and commercial projects on time.",
  skills: [
    "Design: AutoCAD, Revit, SketchUp, Adobe Creative Suite",
    "Management: Project Lifecycle, Client Communication, Budgeting",
    "Technical: Building Codes, Vendor Management, 3D Rendering"
  ],
  experience: [
    {
      title: "Senior Architect",
      company: "Apex Design Group",
      duration: "2018 - Present",
      bullets: [
        "Led a team of 5 junior architects in designing mixed-use developments",
        "Streamlined the client approval process reducing average project turnaround by 15%",
        "Coordinated with structural engineers to ensure all models met regional compliance standards"
      ]
    },
    {
      title: "Junior Architect",
      company: "Urban Edge Associates",
      duration: "2015 - 2018",
      bullets: [
        "Assisted in drafting floor plans and 3D mockups for over 30 commercial spaces",
        "Managed document control and RFIs during the construction phase",
        "Conducted site visits and documented progress for stakeholder updates"
      ]
    }
  ],
  projects: [
    {
      name: "The Skyline Residences",
      description: "A 40-story luxury apartment complex featuring sustainable green roofing and energy-efficient systems.",
      tech: "LEED Certification, Revit, AutoCad"
    }
  ],
  education: [
    {
      degree: "Master of Architecture",
      institution: "University of Colorado Denver",
      year: "2015"
    },
    {
      degree: "B.S. in Environmental Design",
      institution: "University of Colorado Boulder",
      year: "2013"
    }
  ]
};

const TemplatePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const template = TEMPLATE_OPTIONS.find((t) => t.id === id) || TEMPLATE_OPTIONS.find((t) => t.id === "modern")!;

  const [htmlContent, setHtmlContent] = useState<string>("");

  // Form State
  const [activeData, setActiveData] = useState(dummyData);
  const [accentColor, setAccentColor] = useState(
    template.id === 'modern' ? '#7c3aed' : 
    template.id === 'professional' ? '#2563eb' : 
    template.id === 'executive' ? '#ea580c' : '#52525b'
  );
  const [profileImageUri, setProfileImageUri] = useState("");

  // Layout Adjustments
  const [fontSize, setFontSize] = useState(100);
  const [lineHeight, setLineHeight] = useState(100);
  const [sectionSpacing, setSectionSpacing] = useState(100);
  const [pageStrategy, setPageStrategy] = useState<'one_page' | 'standard'>('one_page');

  useEffect(() => {
    // Inject accent color and profile image for real usage if we had them, 
    // but the template system doesn't directly support these standardly without modifying the HTML or CSS manually yet.
    // We'll pass them in via Layout for now, if we added them in generateHTML.ts.
    // For now we just re-generate the HTML when settings change.
    const customData = {
      ...activeData,
      accentColor,
      profileImageUri,
      pageStrategy,
      layout: {
        fontSize,
        lineHeight,
        sectionSpacing
      }
    };
    const html = generateATSHTML(customData as any, template.id as any);
    setHtmlContent(html);
  }, [template, activeData, fontSize, lineHeight, sectionSpacing, accentColor, profileImageUri]);

  const handleResetLayout = () => {
    setFontSize(100);
    setLineHeight(100);
    setSectionSpacing(100);
  };

  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Template not found</h2>
        <Button onClick={() => navigate("/templates")}>Back to Templates</Button>
      </div>
    );
  }

  const handleUseTemplate = () => {
    // Navigate to resume builder and pass the template parameter
    navigate(`/resume?template=${template.id}`);
    toast.success(`Selected ${template.name} template`);
  };

  return (
    <AppLayout>
      <main className="max-w-[1400px] mx-auto px-4 py-8">
        
        {/* Top Action Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 flex flex-wrap items-center justify-between mb-8 gap-4">
          <Button variant="outline" className="font-semibold" onClick={() => navigate("/templates")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Templates
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md px-6" onClick={handleUseTemplate}>
             <Layout className="w-4 h-4 mr-2" /> Use This Template
          </Button>
        </div>

        {/* Template Preview Section */}
        <div className="w-full flex justify-center">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-2 md:p-8 rounded-xl w-full flex items-start justify-center border border-zinc-200 dark:border-zinc-700 shadow-inner overflow-y-auto overflow-x-auto min-h-[1000px] h-[calc(100vh-250px)] custom-scrollbar">
              <div className={`w-[210mm] min-w-[210mm] ${pageStrategy === 'one_page' ? 'h-[297mm]' : 'h-auto min-h-[297mm]'} bg-white shadow-2xl transform origin-top mx-auto block scale-[0.5] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.7] xl:scale-[0.85] 2xl:scale-100 mb-20`}>
                 <iframe 
                   srcDoc={htmlContent} 
                   title="Resume Preview"
                   className={`w-[210mm] min-w-[210mm] border-0 pointer-events-none block ${pageStrategy === 'one_page' ? 'h-[297mm]' : 'h-[3500px]'}`}
                   sandbox="allow-same-origin"
                   scrolling="no"
                 />
              </div>
            </div>
          </div>
      </main>
    </AppLayout>
  );
};

export default TemplatePreview;
