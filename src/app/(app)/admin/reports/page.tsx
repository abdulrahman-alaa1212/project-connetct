
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Assessment } from "@/types";
import { Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";

// Mock assessment data - can be expanded or moved to a shared service
export const mockAssessments: Assessment[] = [
  {
    id: "asm1",
    hospitalId: "hosp1",
    hospitalName: "City General Hospital",
    submissionDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    status: "Reviewed",
    vrNeeds: "Surgical training modules for orthopedics.",
    mrNeeds: "MR guidance for neurosurgery.",
    arNeeds: "AR for patient vein finding.",
    budget: "$50k - $200k",
    currentTech: "Some VR headsets (Oculus Quest 2)",
    goals: "Improve surgical outcomes and training efficiency.",
    adminNotes: "Followed up with Dr. Smith. They are particularly interested in the NeuroNav MR System. Sent preliminary quote."
  },
  {
    id: "asm2",
    hospitalId: "hosp2",
    hospitalName: "Rural Health Clinic",
    submissionDate: new Date(Date.now() - 86400000 * 12).toISOString(), // 12 days ago
    status: "Pending",
    vrNeeds: "Basic VR for patient distraction during minor procedures.",
    mrNeeds: "None specified.",
    arNeeds: "None specified.",
    budget: "< $10k",
    currentTech: "Standard PCs only",
    goals: "Enhance patient comfort.",
    adminNotes: ""
  },
  {
    id: "asm3",
    hospitalId: "hosp3", 
    hospitalName: "Green Valley Community Care",
    submissionDate: new Date(Date.now() - 86400000 * 8).toISOString(), 
    status: "Pending",
    vrNeeds: "VR for physical therapy and rehabilitation.",
    mrNeeds: "Not at this time.",
    arNeeds: "AR for anatomy education for junior staff.",
    budget: "$10k - $50k",
    currentTech: "Modern PCs, good Wi-Fi",
    goals: "Improve patient recovery times and staff training.",
    adminNotes: ""
  },
  {
    id: "asm4", 
    hospitalId: "hosp1",
    hospitalName: "City General Hospital",
    submissionDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    status: "Completed",
    vrNeeds: "Advanced simulation for various specialties.",
    mrNeeds: "Pre-operative planning and intraoperative navigation.",
    arNeeds: "Remote expert consultation using AR.",
    budget: "> $200k",
    currentTech: "Dedicated simulation lab, high-speed network.",
    goals: "Become a leader in medical XR technology.",
    adminNotes: "Project completed successfully. Case study pending."
  },
];


export default function ManageAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching assessments and merging with localStorage updates
    setTimeout(() => {
      const loadedAssessments = mockAssessments.map(asm => {
        if (typeof window !== 'undefined') {
          const storedNotes = localStorage.getItem(`assessment_notes_${asm.id}`);
          const storedStatus = localStorage.getItem(`assessment_status_${asm.id}`) as Assessment["status"] | null;
          return {
            ...asm,
            adminNotes: storedNotes !== null ? storedNotes : asm.adminNotes,
            status: storedStatus !== null ? storedStatus : asm.status,
          };
        }
        return asm;
      });
      setAssessments(loadedAssessments);
      setIsLoading(false);
    }, 500);
  }, []);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">Manage Hospital Assessments</CardTitle>
          <CardDescription>Review submitted technology needs assessments, add responses, and manage reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No assessments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Submission Date</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Budget</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">{assessment.hospitalName}</TableCell>
                    <TableCell className="hidden sm:table-cell">{new Date(assessment.submissionDate).toLocaleDateString()}</TableCell>
                    <TableCell className="hidden md:table-cell">
                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assessment.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        assessment.status === "Reviewed" ? "bg-blue-100 text-blue-800" :
                        assessment.status === "Completed" ? "bg-green-100 text-green-800" : ""
                       }`}>
                        {assessment.status}
                       </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{assessment.budget}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/reports/${assessment.id}/review`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Review & Respond
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
