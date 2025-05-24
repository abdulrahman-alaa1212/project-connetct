
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
  Building2, // Using Building2 for provider services for better distinction
  ClipboardCheck, 
  BarChart3, // For solution matches
  Lightbulb, // For Provider matches
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

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, roles: ["hospital", "professional", "provider", "admin"] },
  
  // Hospital Roles
  { href: "/assessment", label: "Submit New Assessment", icon: ClipboardList, roles: ["hospital"] },
  { href: "/my-assessments", label: "View My Assessments", icon: ListChecks, roles: ["hospital"] },
  { href: "/solutions", label: "View Solution Matches", icon: BarChart3, roles: ["hospital"] },
  
  // Professional Roles
  { href: "/my-cv", label: "Manage My CV", icon: UserCircle, roles: ["professional"] },
  { href: "/my-applications", label: "View My Applications", icon: ClipboardCheck, roles: ["professional"] },
  { href: "/jobs", label: "Job Board", icon: Briefcase, roles: ["professional"] },

  // Provider Roles
  { href: "/services", label: "Manage My Services", icon: Building2, roles: ["provider"] }, 
  { href: "/provider/matches", label: "View Matched Needs", icon: Lightbulb, roles: ["provider"] },


  // Admin Roles
  { href: "/admin/reports", label: "Manage Assessments", icon: FileText, roles: ["admin"] },
  { href: "/admin/users", label: "Manage Users", icon: Users, roles: ["admin"] },
  { href: "/jobs", label: "Post & Manage Opportunities", icon: Briefcase, roles: ["admin"] }, // Admin's version of job board
  
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

  const userNavItemsMap = new Map<string, NavItem>();
  navItems
    .filter(item => item.roles.includes(user.role))
    .forEach(item => {
      const mapKey = `${item.href}-${user.role}`; // Ensure uniqueness for role-specific labels on same href
      if (!userNavItemsMap.has(mapKey)) {
          // If admin has a specific label for a shared route, prioritize that.
          if (user.role === 'admin' && item.href === '/jobs' && item.label === "Post & Manage Opportunities") {
            userNavItemsMap.set(mapKey, item);
          } else if (user.role === 'professional' && item.href === '/jobs' && item.label === "Job Board"){
             userNavItemsMap.set(mapKey, item);
          }
          // For other roles or non-conflicting admin routes
          else if (!userNavItemsMap.has(item.href)) { // Check if base href already added by another role
             userNavItemsMap.set(item.href, item); // Add if href not present
          } else if (userNavItemsMap.has(item.href) && !userNavItemsMap.get(item.href)!.label.includes("Post & Manage")) {
            // If href exists, but current one isn't an admin specific one, we might overwrite if current is more specific
            // This logic can be tricky if multiple non-admin roles share a link but need different labels.
            // For now, the admin check above handles the main conflict.
            // To be absolutely sure, ensure distinct hrefs if labels must differ for non-admin roles.
             userNavItemsMap.set(item.href, item);
          }
      }
    });
  
  // A simpler filter after map construction to ensure one item per href
  const finalUserNavItems: NavItem[] = [];
  const seenHrefs = new Set<string>();
  
  Array.from(userNavItemsMap.values()).forEach(item => {
      if (user.role === 'admin' && item.href === '/jobs' && item.label === "Post & Manage Opportunities") {
          if (!seenHrefs.has(item.href)) {
              finalUserNavItems.push(item);
              seenHrefs.add(item.href);
          }
      } else if (user.role === 'professional' && item.href === '/jobs' && item.label === "Job Board"){
          if (!seenHrefs.has(item.href)) {
              finalUserNavItems.push(item);
              seenHrefs.add(item.href);
          }
      } else if (!seenHrefs.has(item.href)) {
          finalUserNavItems.push(item);
          seenHrefs.add(item.href);
      }
  });


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
            {finalUserNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              let navLabel = item.label;
              
              // Specific label override for admin on /jobs page has been handled by map logic

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
