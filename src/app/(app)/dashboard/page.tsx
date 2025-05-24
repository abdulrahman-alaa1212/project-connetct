"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ClipboardList, Briefcase, FileText, Users, BarChart3 } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null; // Or a loading state, though layout should handle auth check
  }

  const getRoleSpecificGreeting = () => {
    switch (user.role) {
      case "hospital":
        return "Manage your hospital's technology assessments and explore solutions.";
      case "professional":
        return "Discover new career opportunities and manage your profile.";
      case "provider":
        return "Showcase your VR/MR/AR solutions to hospitals in need.";
      case "admin":
        return "Oversee platform operations, manage users, and generate insights.";
      default:
        return "Explore the platform's features.";
    }
  };

  const quickActions = [
    ...(user.role === "hospital" ? [
      { label: "Submit New Assessment", href: "/assessment", icon: ClipboardList, description: "Detail your technology needs." },
      { label: "View Solution Matches", href: "/solutions", icon: BarChart3, description: "See AI-powered recommendations." },
    ] : []),
    ...(user.role === "professional" ? [
      { label: "Browse Job Board", href: "/jobs", icon: Briefcase, description: "Find your next opportunity." },
      { label: "Manage My CV", href: "/my-cv", icon: FileText, description: "Keep your profile up-to-date." },
    ] : []),
    ...(user.role === "admin" ? [
      { label: "Generate Reports", href: "/admin/reports", icon: FileText, description: "Analyze assessment data." },
      { label: "Manage Users", href: "/admin/users", icon: Users, description: "Oversee platform members." },
    ] : []),
     ...(user.role === "provider" ? [
      { label: "List My Services", href: "/services", icon: ClipboardList, description: "Showcase your offerings." },
      { label: "View Matched Needs", href: "/provider/matches", icon: BarChart3, description: "Find hospitals needing your tech." },
    ] : []),
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-3xl font-bold text-primary">Welcome back, {user.name}!</CardTitle>
          <CardDescription className="text-lg">{getRoleSpecificGreeting()}</CardDescription>
        </CardHeader>
        <CardContent>
            <Image 
              src="https://placehold.co/1200x300.png"
              alt="Dashboard banner"
              data-ai-hint="technology healthcare"
              width={1200}
              height={300}
              className="w-full h-auto rounded-md object-cover"
            />
        </CardContent>
      </Card>

      {quickActions.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Card key={action.href} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <action.icon className="h-8 w-8 text-primary" />
                    <CardTitle className="text-xl">{action.label}</CardTitle>
                  </div>
                   <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={action.href}>
                      Go to {action.label.split(" ")[0]} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Platform Activity Overview</CardTitle>
          <CardDescription>Summary of recent activities and insights. (Content TBD)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detailed charts and summaries will be displayed here based on user role.</p>
           <Image 
              src="https://placehold.co/800x200.png"
              alt="Activity chart placeholder"
              data-ai-hint="data chart"
              width={800}
              height={200}
              className="w-full h-auto rounded-md object-cover mt-4"
            />
        </CardContent>
      </Card>
    </div>
  );
}
