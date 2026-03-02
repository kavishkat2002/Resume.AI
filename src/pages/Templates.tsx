import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TEMPLATE_OPTIONS, generateATSHTML, type ResumeData } from "@/components/resume-templates";
import { Briefcase, Code, LayoutTemplate, Palette, Search, Sparkles, FilterX, Eye } from "lucide-react";

const dummyData: ResumeData = {
  fullName: "Noah Mitchell",
  email: "noah@example.com",
  phone: "+1 555-0137",
  location: "Denver, CO",
  jobTitle: "Senior Architect",
  summary: "Architect experienced in site coordination, technical execution, and quality assurance. Leadership-ready profile with strategic impact highlights.",
  skills: ["AutoCAD", "Revit", "SketchUp", "Project Management", "3D Rendering"],
  experience: [
    {
      title: "Senior Architect",
      company: "Apex Design Group",
      duration: "2018 - Present",
      bullets: ["Led a team of 5 architects in mixed-use developments", "Streamlined client approval process"]
    }
  ],
  projects: [],
  education: [
    {
      degree: "Master of Architecture",
      institution: "Univ. of Colorado",
      year: "2015"
    }
  ],
  layout: {
      fontSize: 100,
      lineHeight: 100,
      sectionSpacing: 100
  },
  accentColor: "#3b82f6",
  pageStrategy: 'one_page'
};

export default function Templates() {
  const navigate = useNavigate();
  const [industryFilter, setIndustryFilter] = useState<"All" | "IT" | "Non-IT">("All");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [styleFilter, setStyleFilter] = useState("All styles");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    return TEMPLATE_OPTIONS.filter((template) => {
      // Industry Filter
      if (industryFilter === "IT" && template.category !== "IT") return false;
      if (industryFilter === "Non-IT" && template.category === "IT") return false;

      // Category filter
      if (categoryFilter !== "All categories" && template.category !== categoryFilter) return false;

      // Style Filter
      if (styleFilter !== "All styles" && template.layout !== styleFilter) return false;

      // Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!template.name.toLowerCase().includes(query) && !template.description.toLowerCase().includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [industryFilter, categoryFilter, styleFilter, searchQuery]);

  // Extract unique categories and layouts for dropdowns
  const categories = ["All categories", ...Array.from(new Set(TEMPLATE_OPTIONS.map(t => t.category)))];
  const layouts = ["All styles", ...Array.from(new Set(TEMPLATE_OPTIONS.map(t => t.layout)))];

  const handleReset = () => {
    setIndustryFilter("All");
    setCategoryFilter("All categories");
    setStyleFilter("All styles");
    setSearchQuery("");
  };

  return (
    <AppLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
        {/* Template Section Heading in Black Theme */}
        <div className="bg-zinc-900 rounded-3xl p-8 md:p-12 mb-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase mb-4 border border-blue-500/20">
              <Sparkles className="h-3 w-3" />
              Professional Designs
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Premium Resume <span className="text-blue-500">Templates</span>
            </h1>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Choose from our curated collection of ATS-optimized templates designed by recruitment experts 
              to help you land your dream role.
            </p>
          </div>
        </div>
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-zinc-900 dark:text-zinc-100">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold">{TEMPLATE_OPTIONS.length}</p>
              <p className="text-sm text-zinc-500">Templates</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold">{TEMPLATE_OPTIONS.filter(t => t.category === "IT").length}</p>
              <p className="text-sm text-zinc-500">IT Roles</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold">{TEMPLATE_OPTIONS.filter(t => t.category !== "IT" && t.category !== "All").length}</p>
              <p className="text-sm text-zinc-500">Non-IT Roles</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold">{layouts.length - 1}</p>
              <p className="text-sm text-zinc-500">Visual Styles</p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-10 space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 uppercase text-sm font-bold tracking-wider">
            <FilterX className="w-4 h-4" />
            Filter and Sort
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full w-fit">
              {['All', 'IT', 'Non-IT'].map((industry) => (
                <button
                  key={industry}
                  onClick={() => setIndustryFilter(industry as any)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    industryFilter === industry 
                      ? 'bg-blue-600 text-white shadow' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {industry === 'All' ? 'All industries' : industry}
                </button>
              ))}
            </div>
            
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <Input 
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full h-10 bg-white dark:bg-zinc-900">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 block">Style</label>
              <Select value={styleFilter} onValueChange={setStyleFilter}>
                <SelectTrigger className="w-full h-10 bg-white dark:bg-zinc-900">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  {layouts.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-start-4 flex items-end">
              <Button onClick={handleReset} variant="outline" className="w-full h-10 border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                <FilterX className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Templates Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-bold flex flex-wrap gap-2 text-zinc-900 dark:text-zinc-100">
            All Templates ({filteredTemplates.length})
          </h2>
          <Button 
            onClick={() => navigate("/resume")} 
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center pr-4"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Custom Builder
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div 
              key={template.id} 
              className={`rounded-2xl overflow-hidden relative border shadow-sm cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 bg-white dark:bg-zinc-900 flex flex-col h-full group ${template.color}`}
              onClick={() => navigate(`/template/${template.id}`)}
            >
              <div 
                className="relative w-full bg-zinc-100 dark:bg-zinc-800/50 overflow-hidden border-b border-black/5 dark:border-white/5" 
                style={{ paddingTop: '141.4%', containerType: 'inline-size' }}
              >
                <div 
                  className="absolute top-0 left-0 w-[210mm] h-[297mm] origin-top-left pointer-events-none transition-transform duration-300 group-hover:scale-[calc(100cqw/793.7+0.02)]"
                  style={{ transform: "scale(calc(100cqw / 793.7))" }}
                >
                  <iframe 
                    srcDoc={generateATSHTML({ ...dummyData, accentColor: template.id === 'modern' ? '#7c3aed' : template.id === 'professional' ? '#2563eb' : template.id === 'executive' ? '#ea580c' : '#52525b' }, template.id as any)}
                    className="w-[210mm] h-[297mm] border-0 bg-white"
                    scrolling="no"
                    sandbox="allow-same-origin"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[1px]">
                  <Button className="bg-white/90 text-blue-600 hover:bg-white shadow-lg pointer-events-none transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview & Use
                  </Button>
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{template.name}</h3>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${template.iconColor}`}>
                    <LayoutTemplate className="w-4 h-4" />
                  </div>
                </div>
                
                <p className="text-sm opacity-80 leading-relaxed mb-4 flex-grow line-clamp-2">{template.description}</p>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-black/10 dark:border-white/10">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold opacity-70">Category: {template.category}</span>
                    <span className="text-xs font-semibold opacity-70">Layout: {template.layout}</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Select →
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-500">
              <Search className="h-12 w-12 text-zinc-300 mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No templates found</h3>
              <p>Try adjusting your filters or search query.</p>
              <Button variant="outline" onClick={handleReset} className="mt-4">Clear all filters</Button>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
