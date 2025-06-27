
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Assessment } from "@/types";
import { mockAssessments as allMockAssessments } from "@/app/(app)/admin/reports/page"; // Import shared mock data
import { Loader2, ArrowLeft, Download, FileText, Brain, Lightbulb, Upload, Send, File, SaveIcon } from "lucide-react";

export default function ReviewAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const assessmentId = params.assessmentId as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Combined submission state

  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [sentPdfName, setSentPdfName] = useState<string | null>(null);

  const loadAssessmentData = useCallback(() => {
    setIsLoading(true);
    const foundAssessment = allMockAssessments.find(asm => asm.id === assessmentId);
    if (foundAssessment) {
      if (typeof window !== 'undefined') {
        const storedNotes = localStorage.getItem(`assessment_notes_${foundAssessment.id}`);
        const storedStatus = localStorage.getItem(`assessment_status_${foundAssessment.id}`) as Assessment["status"] | null;
        const storedPdfName = localStorage.getItem(`assessment_pdf_response_${foundAssessment.id}`);
        
        const currentAssessment = {
          ...foundAssessment,
          adminNotes: storedNotes !== null ? storedNotes : foundAssessment.adminNotes,
          status: storedStatus !== null ? storedStatus : foundAssessment.status,
        };
        setAssessment(currentAssessment);
        setAdminResponse(currentAssessment.adminNotes || "");
        if (storedPdfName) {
          setSentPdfName(storedPdfName);
        }
      } else {
        setAssessment(foundAssessment);
        setAdminResponse(foundAssessment.adminNotes || "");
      }
    }
    setIsLoading(false);
  }, [assessmentId]);
  
  useEffect(() => {
    if (assessmentId) {
      loadAssessmentData();
    }
  }, [assessmentId, loadAssessmentData]);

  const handleSubmitResponse = async () => {
    if (!assessment) return;
    setIsSubmitting(true);

    let newStatus: Assessment["status"] = assessment.status;
    let toastDescription = "";

    try {
      // Always save admin text response
      if (typeof window !== 'undefined') {
        localStorage.setItem(`assessment_notes_${assessment.id}`, adminResponse);
      }
      setAssessment(prev => prev ? { ...prev, adminNotes: adminResponse } : null);
      toastDescription = `Your notes for ${assessment.hospitalName} have been saved.`;
      newStatus = "Reviewed"; // Default to reviewed if only text is saved

      // Handle PDF if selected
      if (selectedPdfFile) {
        console.log("Simulating sending PDF:", selectedPdfFile.name, "for assessment:", assessment.id);
        // In a real app, upload to storage and then notify user/update backend.
        if (typeof window !== 'undefined') {
          localStorage.setItem(`assessment_pdf_response_${assessment.id}`, selectedPdfFile.name);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        setSentPdfName(selectedPdfFile.name);
        toastDescription += ` PDF response "${selectedPdfFile.name}" has been sent.`;
        newStatus = "Completed"; // If PDF is sent, status is completed
        setSelectedPdfFile(null); // Clear selection after "sending"
      } else if (sentPdfName) { 
        // If no new PDF selected, but one was previously sent, status remains Completed
        newStatus = "Completed";
      }
      
      // Update status in localStorage and state
      if (typeof window !== 'undefined') {
        localStorage.setItem(`assessment_status_${assessment.id}`, newStatus);
      }
      setAssessment(prev => prev ? { ...prev, status: newStatus } : null);

      toast({ title: "Response Processed", description: toastDescription.trim() });

    } catch (error) {
      toast({ variant: "destructive", title: "Submission Failed", description: "Could not process your response." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReport = () => {
    if (!assessment) return;

    let reportContent = `Assessment Report for: ${assessment.hospitalName}\n`;
    reportContent += `Submission Date: ${new Date(assessment.submissionDate).toLocaleDateString()}\n`;
    reportContent += `Status: ${assessment.status}\n\n`;

    reportContent += `--- Hospital Submission Details ---\n`;
    reportContent += `VR Needs: ${assessment.vrNeeds || 'N/A'}\n`;
    reportContent += `MR Needs: ${assessment.mrNeeds || 'N/A'}\n`;
    reportContent += `AR Needs: ${assessment.arNeeds || 'N/A'}\n`;
    reportContent += `Budget: ${assessment.budget || 'N/A'}\n`;
    reportContent += `Current Technology: ${assessment.currentTech || 'N/A'}\n`;
    reportContent += `Goals: ${assessment.goals || 'N/A'}\n\n`;
    
    // Use adminResponse from state for current edits, or fallback to assessment.adminNotes
    const currentAdminNotes = adminResponse || (assessment.adminNotes); 
    if (currentAdminNotes) {
      reportContent += `--- Admin Notes / Official Response ---\n${currentAdminNotes}\n\n`;
    }

    // Use sentPdfName from state for current/previous PDF
    const currentSentPdfName = sentPdfName || (typeof window !== 'undefined' ? localStorage.getItem(`assessment_pdf_response_${assessment.id}`) : null);
    if (currentSentPdfName) {
      reportContent += `--- PDF Response Sent ---\nFilename: ${currentSentPdfName}\n(Content of PDF not included in this text report)\n\n`;
    }
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `assessment_report_${assessment.hospitalName.replace(/\s+/g, '_')}_${assessment.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Report Downloaded", description: `Report for ${assessment.hospitalName} downloaded as .txt file.` });
  };

  const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedPdfFile(file);
      toast({ title: "PDF Selected", description: file.name });
    } else {
      setSelectedPdfFile(null);
      if (file) {
        toast({ variant: "destructive", title: "Invalid File Type", description: "Please select a PDF file." });
      }
    }
    event.target.value = ''; // Allow re-selecting the same file
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading assessment details...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FileText className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Assessment Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested assessment could not be found.</p>
        <Button onClick={() => router.push('/admin/reports')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Assessments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Button variant="outline" onClick={() => router.push('/admin/reports')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Assessments
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">Review Assessment: {assessment.hospitalName}</CardTitle>
          <CardDescription>
            Submitted on: {new Date(assessment.submissionDate).toLocaleString()} | Current Status: {assessment.status}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" />Hospital Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {assessment.vrNeeds && <p><strong>VR Needs:</strong> {assessment.vrNeeds}</p>}
            {assessment.mrNeeds && <p><strong>MR Needs:</strong> {assessment.mrNeeds}</p>}
            {assessment.arNeeds && <p><strong>AR Needs:</strong> {assessment.arNeeds}</p>}
            <p><strong>Budget:</strong> {assessment.budget}</p>
            {assessment.currentTech && <p><strong>Current Tech:</strong> {assessment.currentTech}</p>}
            <p><strong>Goals:</strong> {assessment.goals}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Admin Response &amp; Report Submission</CardTitle>
          <CardDescription>Enter your notes or official response. You can also attach an optional PDF report to be sent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="admin-response-textarea" className="block text-sm font-medium text-foreground mb-1">Official Text Response / Notes:</label>
            <Textarea 
              id="admin-response-textarea"
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Enter your notes or official response..."
              rows={8}
              className="text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground mb-1">Optional PDF Report:</label>
            <div className="flex items-center gap-4">
              <label htmlFor="pdf-upload-button" className="cursor-pointer">
                <Button asChild variant="outline">
                  <span><Upload className="mr-2 h-4 w-4" /> Choose PDF File</span>
                </Button>
              </label>
              <Input
                id="pdf-upload-button"
                type="file"
                accept="application/pdf"
                onChange={handlePdfFileChange}
                className="hidden"
              />
            </div>
            {selectedPdfFile && (
              <div className="flex items-center text-sm text-muted-foreground p-2 border rounded-md mt-2">
                <File className="mr-2 h-4 w-4 text-primary shrink-0" />
                <span className="truncate">Selected to send: {selectedPdfFile.name}</span>
              </div>
            )}
            {!selectedPdfFile && sentPdfName && (
               <div className="flex items-center text-sm text-green-700 bg-green-50 p-2 border border-green-200 rounded-md mt-2">
                <File className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Previously sent: {sentPdfName} (Choosing a new PDF will replace it upon submission)</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4">
          <Button onClick={handleDownloadReport} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Download Report (.txt)
          </Button>
          <Button onClick={handleSubmitResponse} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Finalize &amp; Send Response
          </Button>
        </CardFooter>
      </Card>
      
       <p className="text-xs text-muted-foreground text-center mt-2">
        Note: Text responses are saved. PDF reports, if chosen, are "sent" (simulated) and their filenames are tracked.
      </p>
    </div>
  );
}
