
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import type { Assessment } from "@/types";
import { Eye, Loader2, ServerCrash, ListChecks } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { mockAssessments as allMockAssessments } from "@/app/(app)/admin/reports/page"; // Import shared mock data

export default function MyAssessmentsPage() {
  const { user } = useAuth();
  const [myAssessments, setMyAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user && user.hospitalId) {
      setIsLoading(true);
      // Simulate fetching assessments for the current hospital
      setTimeout(() => {
        const filteredAssessments = allMockAssessments.filter(
          (assessment) => assessment.hospitalId === user.hospitalId
        );
        setMyAssessments(filteredAssessments);
        setIsLoading(false);
      }, 500);
    } else {
      // Handle case where user is not a hospital or hospitalId is missing
      setMyAssessments([]);
      setIsLoading(false);
    }
  }, [user]);

  const handleViewDetails = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading your assessments...</p>
      </div>
    );
  }

  if (!user || user.role !== 'hospital') {
     return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive flex items-center">
            <ServerCrash className="mr-2 h-8 w-8" /> Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This page is only available for hospital users.</p>
           <Button onClick={() => window.history.back()} className="mt-4">Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
            <ListChecks className="mr-3 h-8 w-8" /> My Submitted Assessments
            </CardTitle>
          <CardDescription>Review your past technology needs assessments and their AI-generated insights.</CardDescription>
        </CardHeader>
        <CardContent>
          {myAssessments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              You have not submitted any assessments yet.
              <Button asChild variant="link" className="block mx-auto mt-2">
                <a href="/assessment">Submit a New Assessment</a>
              </Button>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submission Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Primary Goal</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>{new Date(assessment.submissionDate).toLocaleDateString()}</TableCell>
                    <TableCell className="hidden sm:table-cell">{assessment.status}</TableCell>
                    <TableCell className="hidden md:table-cell truncate max-w-xs">{assessment.goals}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(assessment)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedAssessment && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-primary">Assessment Details: {selectedAssessment.hospitalName}</DialogTitle>
              <DialogDescription>
                Submitted on: {new Date(selectedAssessment.submissionDate).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Original Needs:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground bg-muted p-3 rounded-md">
                  {selectedAssessment.vrNeeds && <li><strong>VR Needs:</strong> {selectedAssessment.vrNeeds}</li>}
                  {selectedAssessment.mrNeeds && <li><strong>MR Needs:</strong> {selectedAssessment.mrNeeds}</li>}
                  {selectedAssessment.arNeeds && <li><strong>AR Needs:</strong> {selectedAssessment.arNeeds}</li>}
                  <li><strong>Budget:</strong> {selectedAssessment.budget}</li>
                  {selectedAssessment.currentTech && <li><strong>Current Tech:</strong> {selectedAssessment.currentTech}</li>}
                  <li><strong>Goals:</strong> {selectedAssessment.goals}</li>
                </ul>
              </div>

              {selectedAssessment.aiSummary && (
                <div>
                  <h4 className="font-semibold text-foreground mb-1">AI Generated Summary:</h4>
                  <p className="whitespace-pre-wrap bg-accent/20 p-3 rounded-md text-accent-foreground">{selectedAssessment.aiSummary}</p>
                </div>
              )}

              {selectedAssessment.aiSolutions && (
                <div>
                  <h4 className="font-semibold text-foreground mb-1">AI Suggested Solutions:</h4>
                  <div className="bg-accent/20 p-3 rounded-md text-accent-foreground">
                    <p className="font-medium">Solutions:</p>
                    <p className="whitespace-pre-wrap mb-2">{selectedAssessment.aiSolutions.suggestedSolutions}</p>
                    <p className="font-medium">Reasoning:</p>
                    <p className="whitespace-pre-wrap">{selectedAssessment.aiSolutions.reasoning}</p>
                  </div>
                </div>
              )}
               <div>
                  <h4 className="font-semibold text-foreground mb-1">Admin Reports:</h4>
                  <p className="italic text-muted-foreground">(Admin-generated reports for this assessment will appear here if available.)</p>
                </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
