
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Briefcase,
  FileText,
  Users,
  Settings,
  UserCircle,
  LayoutGrid,
  ListChecks, 
  Building, // For Provider services - can be refined
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

// Updated NavItems for clarity and admin focus
const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, roles: ["hospital", "professional", "provider", "admin"] },
  
  // Hospital Roles
  { href: "/assessment", label: "Submit New Assessment", icon: ClipboardList, roles: ["hospital"] },
  { href: "/my-assessments", label: "View My Assessments", icon: ListChecks, roles: ["hospital"] },
  
  // Professional Roles
  { href: "/jobs", label: "Job Board", icon: Briefcase, roles: ["professional", "admin"] }, // Admin also uses this to view and post
  { href: "/my-cv", label: "My CV / Applications", icon: UserCircle, roles: ["professional"] },
  
  // Provider Roles
  { href: "/services", label: "My Services", icon: Building, roles: ["provider"] }, // Placeholder icon

  // Admin Roles - Explicitly listed
  { href: "/admin/reports", label: "Manage Assessments", icon: FileText, roles: ["admin"] },
  { href: "/admin/users", label: "Manage Users", icon: Users, roles: ["admin"] },
  
  // Common
  { href: "/settings", label: "Settings", icon: Settings, roles: ["hospital", "professional", "provider", "admin"] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoading: authIsLoading } = useAuth();
  const { state, isMobile } = useSidebar(); 

  const isLoading = authIsLoading || typeof state === 'undefined'; 

  if (isLoading) {
    return (
      <>
        <SidebarHeader className="p-4">
          <Skeleton className="h-8 w-32" />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter className="p-2">
          <Skeleton className="h-12 w-full" />
        </SidebarFooter>
      </>
    );
  }

  if (!user) return null;

  const userNavItems = navItems.filter(item => item.roles.includes(user.role));
  const isCollapsed = state === 'collapsed' && !isMobile;

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/dashboard" className="flex h-14 items-center px-4">
          <Logo iconOnly={isCollapsed} />
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="p-0">
        <ScrollArea className="h-full py-2 group-data-[collapsible=icon]:py-2">
          <SidebarMenu className="px-2 group-data-[collapsible=icon]:px-1">
            {userNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              let navLabel = item.label;
              if (item.href === "/jobs" && user.role === "admin") {
                navLabel = "Post & Manage Opportunities";
              }
              return (
                <SidebarMenuItem key={item.href + '-' + user.role}> {/* Ensure key is unique if label changes */}
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={{ children: navLabel, side: "right" }}
                    className="justify-start" 
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">{navLabel}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <UserNav compact={isCollapsed} />
      </SidebarFooter>
    </>
  );
}
