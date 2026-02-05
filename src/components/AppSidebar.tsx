import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Github,
  Linkedin,
  Target,
  FileCheck,
  BarChart3,
  GraduationCap,
  Briefcase,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const menuItems = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Analyze",
    items: [
      { title: "Job Description", url: "/analyze", icon: FileText },
      { title: "GitHub Profile", url: "/github", icon: Github },
      { title: "LinkedIn Profile", url: "/linkedin", icon: Linkedin },
    ],
  },
  {
    group: "Optimize",
    items: [
      { title: "Skills Matcher", url: "/skills", icon: Target },
      { title: "Resume Builder", url: "/resume", icon: FileCheck },
      { title: "ATS Score", url: "/ats-score", icon: BarChart3 },
    ],
  },
  {
    group: "Track",
    items: [
      { title: "Applications", url: "/applications", icon: Briefcase },
    ],
  },
  {
    group: "Improve",
    items: [
      { title: "Learning Path", url: "/learn", icon: GraduationCap },
    ],
  },
  {
    group: "Account",
    items: [
      { title: "Profile", url: "/profile", icon: User },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">ResumeAI</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {menuItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
