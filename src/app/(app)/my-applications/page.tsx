
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Briefcase, ServerCrash, Hourglass, CheckCircle, XCircle } from "lucide-react";
import type { JobPosting } from "@/types"; // Assuming JobPosting might be relevant for linking later
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AppliedJob {
  id: string;
  jobTitle: string;
  company: string;
  dateApplied: string; // ISO String
  status: "Submitted" | "Viewed" | "Under Review" | "Shortlisted" | "Offered" | "Rejected" | "Withdrawn";
}

// Mock data for applications - in a real app, this would come from a backend/localStorage after applying
const mockApplications: AppliedJob[] = [
  {
    id: "app1",
    jobTitle: "VR Software Engineer",
    company: "Innovatech VR Solutions",
    dateApplied: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    status: "Under Review",
  },
  {
    id: "app2",
    jobTitle: "AR/MR Content Developer",
    company: "Healthcare XR Inc.",
    dateApplied: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
    status: "Submitted",
  },
  {
    id: "app3",
    jobTitle: "XR Project Manager (Healthcare)",
    company: "MedSimulators Co.",
    dateApplied: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    status: "Viewed",
  },
   {
    id: "app4",
    jobTitle: "VR Training Specialist",
    company: "Global Medical Training",
    dateApplied: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    status: "Rejected",
  },
];

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<AppliedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching applications for the logged-in user
    // In a real app, this would fetch from a service or localStorage where applications are stored
    setIsLoading(true);
    setTimeout(() => {
      if (user?.role === 'professional') {
        // For now, just use mock data for any professional user.
        // Later, this could be filtered by user ID if applications were stored with userId.
        setApplications(mockApplications);
      } else {
        setApplications([]);
      }
      setIsLoading(false);
    }, 500);
  }, [user]);

  const getStatusBadgeVariant = (status: AppliedJob["status"]): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "Submitted":
      case "Viewed":
        return "outline";
      case "Under Review":
      case "Shortlisted":
        return "default"; // Primary color
      case "Offered":
        return "secondary"; // Or a success variant if you add one (e.g., green)
      case "Rejected":
      case "Withdrawn":
        return "destructive";
      default:
        return "outline";
    }
  };
  
  if (user?.role !== 'professional') {
    return (
        <div className="flex items-center justify-center h-full">
            <Alert variant="destructive" className="max-w-lg">
                <XCircle className="h-5 w-5"/>
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                This page is only accessible to Professionals.
                </AlertDescription>
            </Alert>
        </div>
    );
  }


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Hourglass className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
            <ClipboardCheck className="mr-3 h-8 w-8" /> My Job Applications
          </CardTitle>
          <CardDescription>
            Track the status of your job and training applications submitted through Yura Connect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-10">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Applications Found</h3>
              <p className="text-muted-foreground">You haven&apos;t applied for any opportunities yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Company</TableHead>
                  <TableHead className="hidden md:table-cell">Date Applied</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.jobTitle}</TableCell>
                    <TableCell className="hidden sm:table-cell">{app.company}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(app.dateApplied).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusBadgeVariant(app.status)}>
                        {app.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
       <p className="text-xs text-muted-foreground text-center">
        Note: Application data is currently mocked. In a real system, this page would reflect actual applications you've submitted.
      </p>
    </div>
  );
}

