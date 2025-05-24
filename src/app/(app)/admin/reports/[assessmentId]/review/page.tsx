
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
import { Loader2, ArrowLeft, Save, Download, FileText, Brain, Lightbulb, Upload, Send, File } from "lucide-react";

export default function ReviewAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const assessmentId = params.assessmentId as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New states for PDF
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isSendingPdf, setIsSendingPdf] = useState(false);
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

  const handleSaveAdminResponse = () => {
    if (!assessment) return;
    setIsSaving(true);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`assessment_notes_${assessment.id}`, adminResponse);
        localStorage.setItem(`assessment_status_${assessment.id}`, "Reviewed");
      }
      
      setAssessment(prev => prev ? { ...prev, adminNotes: adminResponse, status: "Reviewed" } : null);
      toast({ title: "Response Saved", description: `Your notes for ${assessment.hospitalName} have been saved.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save your response." });
    } finally {
      setIsSaving(false);
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

    if (assessment.aiSummary) {
      reportContent += `--- AI Generated Summary ---\n${assessment.aiSummary}\n\n`;
    }
    if (assessment.aiSolutions) {
      reportContent += `--- AI Suggested Solutions ---\n`;
      reportContent += `Solutions: ${assessment.aiSolutions.suggestedSolutions}\n`;
      reportContent += `Reasoning: ${assessment.aiSolutions.reasoning}\n\n`;
    }
    const currentAdminResponse = adminResponse || assessment.adminNotes;
    if (currentAdminResponse) {
      reportContent += `--- Admin Notes / Official Response ---\n${currentAdminResponse}\n\n`;
    }
    if (sentPdfName) {
      reportContent += `--- PDF Response Sent ---\nFilename: ${sentPdfName}\n(Content of PDF not included in this text report)\n\n`;
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

  const handleSendPdfResponse = async () => {
    if (!assessment || !selectedPdfFile) {
      toast({ variant: "destructive", title: "Error", description: "No PDF file selected or assessment missing." });
      return;
    }
    setIsSendingPdf(true);
    console.log("Simulating sending PDF:", selectedPdfFile.name, "for assessment:", assessment.id);
    try {
      // In a real app, upload to storage and then notify user/update backend.
      // For mock: store filename in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`assessment_pdf_response_${assessment.id}`, selectedPdfFile.name);
        localStorage.setItem(`assessment_status_${assessment.id}`, "Completed"); // Update status
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      setSentPdfName(selectedPdfFile.name);
      setAssessment(prev => prev ? { ...prev, status: "Completed" } : null);
      toast({ title: "PDF Sent (Simulated)", description: `"${selectedPdfFile.name}" has been sent as a response for ${assessment.hospitalName}.` });
      setSelectedPdfFile(null); // Clear selection after sending

    } catch (error) {
      toast({ variant: "destructive", title: "PDF Send Failed", description: "Could not send the PDF response." });
    } finally {
      setIsSendingPdf(false);
    }
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
        
        <div className="space-y-4">
          {assessment.aiSummary && (
            <Card>
              <CardHeader><CardTitle className="text-xl flex items-center"><Brain className="mr-2 h-5 w-5 text-primary" />AI Generated Summary</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-md">{assessment.aiSummary}</p>
              </CardContent>
            </Card>
          )}

          {assessment.aiSolutions && (
             <Card>
              <CardHeader><CardTitle className="text-xl flex items-center"><Lightbulb className="mr-2 h-5 w-5 text-primary" />AI Suggested Solutions</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="font-semibold">Solutions:</p>
                <p className="whitespace-pre-wrap bg-muted p-3 rounded-md">{assessment.aiSolutions.suggestedSolutions}</p>
                <p className="font-semibold mt-2">Reasoning:</p>
                <p className="whitespace-pre-wrap bg-muted p-3 rounded-md">{assessment.aiSolutions.reasoning}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Admin Notes / Official Response</CardTitle>
          <CardDescription>Enter your notes, official response, or recommendations here. This will be included in the report.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={adminResponse}
            onChange={(e) => setAdminResponse(e.target.value)}
            placeholder="Enter your notes or official response..."
            rows={8}
            className="text-sm"
          />
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button onClick={handleDownloadReport} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download Report (.txt)
          </Button>
          <Button onClick={handleSaveAdminResponse} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Response
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">PDF Response</CardTitle>
          <CardDescription>Upload and send an official PDF response to the hospital.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="pdf-upload-button" className="cursor-pointer w-full sm:w-auto">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <span><Upload className="mr-2 h-4 w-4" /> Choose PDF File</span>
              </Button>
            </label>
            <Input
              id="pdf-upload-button" // Changed id to match label's htmlFor
              type="file"
              accept="application/pdf"
              onChange={handlePdfFileChange}
              className="hidden" // Keep it hidden, Button acts as the trigger
            />
            {selectedPdfFile && (
              <div className="flex items-center text-sm text-muted-foreground p-2 border rounded-md">
                <File className="mr-2 h-4 w-4 text-primary shrink-0" />
                <span className="truncate">Selected: {selectedPdfFile.name}</span>
              </div>
            )}
            {!selectedPdfFile && sentPdfName && (
               <div className="flex items-center text-sm text-green-700 bg-green-50 p-2 border border-green-200 rounded-md">
                <File className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Previously sent: {sentPdfName} (You can send a new one to replace it)</span>
              </div>
            )}
          </div>
          <Button onClick={handleSendPdfResponse} disabled={!selectedPdfFile || isSendingPdf} className="w-full sm:w-auto">
            {isSendingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isSendingPdf ? "Sending..." : "Upload & Send PDF"}
          </Button>
        </CardContent>
      </Card>
       <p className="text-xs text-muted-foreground text-center mt-2">
        Note: PDF reports are "sent" (simulated) and their filenames are tracked. Text reports include a note about PDF responses.
      </p>
    </div>
  );
}
