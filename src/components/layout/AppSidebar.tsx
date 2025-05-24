
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
  ClipboardCheck, // Added for My Applications
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
  // { href: "/jobs", label: "Job Board", icon: Briefcase, roles: ["professional", "admin"] }, // Admin also uses this to view and post
  // The above line is duplicated below, so removing this one to avoid confusion based on context.
  // Keeping the one specifically tailored for professional/admin roles based on job posting logic.
  { href: "/my-cv", label: "Manage My CV", icon: UserCircle, roles: ["professional"] },
  { href: "/my-applications", label: "View My Applications", icon: ClipboardCheck, roles: ["professional"] },

  // Provider Roles
  { href: "/services", label: "My Services", icon: Building, roles: ["provider"] }, // Placeholder icon

  // Admin Roles - Explicitly listed
  { href: "/admin/reports", label: "Manage Assessments", icon: FileText, roles: ["admin"] },
  { href: "/admin/users", label: "Manage Users", icon: Users, roles: ["admin"] },
  { href: "/jobs", label: "Post & Manage Opportunities", icon: Briefcase, roles: ["admin"] }, // Admin's version of job board
  
  // Professional Role (Job Board) - distinct from admin's version if necessary, but here it's combined logic
  { href: "/jobs", label: "Job Board", icon: Briefcase, roles: ["professional"] },

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

  // Deduplicate navItems based on href for the current user's role
  const userNavItemsMap = new Map<string, NavItem>();
  navItems
    .filter(item => item.roles.includes(user.role))
    .forEach(item => {
      if (!userNavItemsMap.has(item.href)) {
        userNavItemsMap.set(item.href, item);
      } else {
        // Prioritize admin-specific labels if both admin and another role share a link
        const existingItem = userNavItemsMap.get(item.href)!;
        if (user.role === 'admin' && item.label.includes("Admin") || item.label.includes("Manage")) {
           userNavItemsMap.set(item.href, item);
        } else if (user.role !== 'admin' && !existingItem.label.includes("Admin") && !existingItem.label.includes("Manage")) {
            // If current user is not admin, and existing item is not admin specific, keep existing (or current if more generic)
            // This logic might need refinement based on specific label preferences
        }
      }
    });
  
  const userNavItems = Array.from(userNavItemsMap.values());


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
              // Specific label override for admin on /jobs page
              if (item.href === "/jobs" && user.role === "admin" && item.label === "Post & Manage Opportunities") {
                navLabel = "Post & Manage Opportunities";
              } else if (item.href === "/jobs" && user.role === "professional"){
                navLabel = "Job Board";
              }

              return (
                <SidebarMenuItem key={item.href + '-' + user.role + '-' + navLabel}> {/* Ensure key is unique */}
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
