
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
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { UserNav } from "@/components/layout/UserNav";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, roles: ["hospital", "professional", "provider", "admin"] },
  { href: "/assessment", label: "My Assessment", icon: ClipboardList, roles: ["hospital"] },
  { href: "/solutions", label: "Suggested Solutions", icon: LayoutGrid, roles: ["hospital"] }, // Placeholder
  { href: "/jobs", label: "Job Board", icon: Briefcase, roles: ["professional", "admin"] },
  { href: "/my-cv", label: "My CV / Applications", icon: UserCircle, roles: ["professional"] }, // Placeholder
  { href: "/admin/reports", label: "Generate Reports", icon: FileText, roles: ["admin"] },
  { href: "/admin/users", label: "Manage Users", icon: Users, roles: ["admin"] }, // Placeholder
  { href: "/services", label: "My Services", icon: LayoutGrid, roles: ["provider"] }, // Placeholder
  { href: "/settings", label: "Settings", icon: Settings, roles: ["hospital", "professional", "provider", "admin"] },
];


export function AppSidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // You might want a skeleton loader here
    return (
      <aside className="w-64 h-screen bg-sidebar text-sidebar-foreground flex flex-col p-4 border-r border-sidebar-border">
        <div className="mb-8">
          <Logo iconOnly={false} className="text-sidebar-primary-foreground" />
        </div>
        <div className="flex-grow space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-sidebar-accent/30 rounded animate-pulse" />
          ))}
        </div>
      </aside>
    );
  }

  if (!user) return null; // Or redirect, though layout should handle this

  const userNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-64 h-screen bg-sidebar text-sidebar-foreground flex flex-col p-1 border-r border-sidebar-border shadow-lg">
      <div className="p-3 mb-4">
        <Link href="/dashboard">
          <Logo iconOnly={false} />
        </Link>
      </div>
      
      <ScrollArea className="flex-grow px-2">
        <nav className="space-y-1">
          {userNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="mt-auto p-2 border-t border-sidebar-border">
        <UserNav />
      </div>
    </aside>
  );
}
