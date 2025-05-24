
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UserSubmittedAssessment } from "@/types";
import { Eye, Loader2, ServerCrash, ListChecks, Edit3, Trash2, FilePenLine } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function MyAssessmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [myAssessments, setMyAssessments] = useState<UserSubmittedAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssessmentForView, setSelectedAssessmentForView] = useState<UserSubmittedAssessment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const [assessmentIdToDelete, setAssessmentIdToDelete] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const loadAssessments = useCallback(() => {
    if (user && user.hospitalId) {
      setIsLoading(true);
      const storageKey = `user_assessments_${user.hospitalId}`;
      const storedAssessments = localStorage.getItem(storageKey);
      if (storedAssessments) {
        setMyAssessments(JSON.parse(storedAssessments));
      } else {
        setMyAssessments([]);
      }
      setIsLoading(false);
    } else {
      setMyAssessments([]);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  const handleViewDetails = (assessment: UserSubmittedAssessment) => {
    setSelectedAssessmentForView(assessment);
    setIsViewModalOpen(true);
  };

  const openDeleteConfirmation = (assessmentId: string) => {
    setAssessmentIdToDelete(assessmentId);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteAssessment = () => {
    if (!assessmentIdToDelete || !user || !user.hospitalId) return;

    const storageKey = `user_assessments_${user.hospitalId}`;
    const updatedAssessments = myAssessments.filter(
      (assessment) => assessment.id !== assessmentIdToDelete
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedAssessments));
    setMyAssessments(updatedAssessments);
    toast({ title: "Assessment Deleted", description: "The assessment has been successfully deleted." });
    setAssessmentIdToDelete(null);
    setIsDeleteConfirmOpen(false);
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
           <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary flex items-center">
              <ListChecks className="mr-3 h-8 w-8" /> My Submitted Assessments
            </CardTitle>
            <CardDescription>Review your past technology needs assessments and their AI-generated insights. You can also edit or delete your submissions.</CardDescription>
          </div>
           <Button asChild>
            <Link href="/assessment">
              <FilePenLine className="mr-2 h-4 w-4" /> Submit New Assessment
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {myAssessments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              You have not submitted any assessments yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Primary Goal</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>{assessment.hospitalName}</TableCell>
                    <TableCell className="hidden sm:table-cell">{new Date(assessment.submissionDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assessment.status === "Submitted" ? "bg-blue-100 text-blue-800" :
                        assessment.status === "In Review" ? "bg-yellow-100 text-yellow-800" : // Example, adjust as needed
                        assessment.status === "Responded" ? "bg-green-100 text-green-800" : 
                        assessment.status === "Completed" ? "bg-purple-100 text-purple-800" : // Example
                        "bg-gray-100 text-gray-800" 
                       }`}>
                        {assessment.status}
                       </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell truncate max-w-xs">{assessment.primaryGoalsSummary}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(assessment)}
                      >
                        <Eye className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/assessment?editId=${assessment.id}`}>
                          <Edit3 className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
                        </Link>
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => openDeleteConfirmation(assessment.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedAssessmentForView && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-primary">Assessment Details: {selectedAssessmentForView.hospitalName}</DialogTitle>
              <DialogDescription>
                Submitted on: {new Date(selectedAssessmentForView.submissionDate).toLocaleString()} | Status: {selectedAssessmentForView.status}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Original Submission Details:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground bg-muted p-3 rounded-md">
                  {selectedAssessmentForView.formData.s1_visionDetails && <li><strong>Vision Details:</strong> {selectedAssessmentForView.formData.s1_visionDetails}</li>}
                  {selectedAssessmentForView.formData.s1_explorePriorityDepartments && <li><strong>Priority Departments:</strong> {selectedAssessmentForView.formData.s1_explorePriorityDepartments}</li>}
                  <li><strong>Budget Range:</strong> {selectedAssessmentForView.formData.s7_budgetRange || selectedAssessmentForView.formData.s7_hasInitialBudget}</li>
                  <li><strong>Timeline:</strong> {selectedAssessmentForView.formData.s7_expectedTimeline}</li>
                  <li><strong>Key Goals:</strong> {selectedAssessmentForView.primaryGoalsSummary}</li>
                  {/* Add more key fields from formData as needed */}
                </ul>
              </div>

              {selectedAssessmentForView.aiSummary && (
                <div>
                  <h4 className="font-semibold text-foreground mb-1">AI Generated Summary:</h4>
                  <p className="whitespace-pre-wrap bg-accent/20 p-3 rounded-md text-accent-foreground">{selectedAssessmentForView.aiSummary}</p>
                </div>
              )}

              {selectedAssessmentForView.aiSolutions && (
                <div>
                  <h4 className="font-semibold text-foreground mb-1">AI Suggested Solutions:</h4>
                  <div className="bg-accent/20 p-3 rounded-md text-accent-foreground">
                    <p className="font-medium">Solutions:</p>
                    <p className="whitespace-pre-wrap mb-2">{selectedAssessmentForView.aiSolutions.suggestedSolutions}</p>
                    <p className="font-medium">Reasoning:</p>
                    <p className="whitespace-pre-wrap">{selectedAssessmentForView.aiSolutions.reasoning}</p>
                  </div>
                </div>
              )}
               <div>
                  <h4 className="font-semibold text-foreground mb-1">Admin Feedback/Report:</h4>
                  {selectedAssessmentForView.adminResponseText ? 
                    <p className="whitespace-pre-wrap bg-blue-50 p-3 rounded-md text-blue-700">{selectedAssessmentForView.adminResponseText}</p> 
                    : <p className="italic text-muted-foreground">(No admin feedback provided yet.)</p>
                  }
                  {selectedAssessmentForView.adminResponsePdfName && 
                    <p className="text-sm mt-2 text-muted-foreground">Admin PDF Report Sent: <span className="font-medium">{selectedAssessmentForView.adminResponsePdfName}</span></p>
                  }
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

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the assessment submitted
              for "{myAssessments.find(a => a.id === assessmentIdToDelete)?.hospitalName || 'this hospital'}"
              on {myAssessments.find(a => a.id === assessmentIdToDelete) ? new Date(myAssessments.find(a => a.id === assessmentIdToDelete)!.submissionDate).toLocaleDateString() : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAssessmentIdToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssessment}>Delete Assessment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}


    