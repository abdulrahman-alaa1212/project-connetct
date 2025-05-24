
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Assessment } from "@/types";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { summarizeAssessment } from "@/ai/flows/summarize-assessment";

// Mock assessment data - now includes aiSummary and aiSolutions
const mockAssessments: Assessment[] = [
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
    aiSummary: "City General Hospital requires VR for orthopedic surgical training and MR for neurosurgery guidance. They also need AR for vein finding. Their budget is substantial, and they aim to enhance surgical outcomes and training.",
    aiSolutions: {
      suggestedSolutions: "PrecisionVR Surgical Sim, NeuroNav MR System, VeinSight AR Glasses",
      reasoning: "PrecisionVR offers realistic orthopedic modules. NeuroNav MR is designed for neurosurgical accuracy. VeinSight AR improves first-attempt success for IVs."
    }
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
    aiSummary: "Rural Health Clinic needs a low-cost VR solution for patient distraction during minor procedures. They have a small budget and basic tech.",
    aiSolutions: {
      suggestedSolutions: "CalmVR Basic, DistractoApp Mobile VR",
      reasoning: "These solutions are affordable and require minimal setup, suitable for basic patient distraction needs."
    }
  },
  {
    id: "asm3",
    hospitalId: "hosp3", // Another hospital for testing filtering
    hospitalName: "Green Valley Community Care",
    submissionDate: new Date(Date.now() - 86400000 * 8).toISOString(), 
    status: "Pending",
    vrNeeds: "VR for physical therapy and rehabilitation.",
    mrNeeds: "Not at this time.",
    arNeeds: "AR for anatomy education for junior staff.",
    budget: "$10k - $50k",
    currentTech: "Modern PCs, good Wi-Fi",
    goals: "Improve patient recovery times and staff training.",
    aiSummary: "Green Valley needs VR for rehab and AR for staff anatomy training. Budget is moderate.",
    aiSolutions: {
      suggestedSolutions: "RehabVR Suite, HoloAnatomy AR",
      reasoning: "RehabVR offers diverse physical therapy modules. HoloAnatomy AR is effective for interactive learning."
    }
  },
  {
    id: "asm4", // Assessment for hosp1 again
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
    aiSummary: "City General Hospital (follow-up) is looking for comprehensive XR solutions across multiple specialties, including advanced simulation, MR for surgical planning, and AR for remote consultations. They have a large budget and advanced infrastructure.",
    aiSolutions: {
      suggestedSolutions: "SimX Enterprise Platform, MedVis MR Suite, ConnectAR Remote Assist",
      reasoning: "SimX provides broad specialty coverage. MedVis MR offers robust pre-op and intra-op tools. ConnectAR is designed for secure remote expert consultations."
    }
  },
];
// Export mockAssessments to be used by my-assessments page
export { mockAssessments };


export default function AdminReportsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate fetching assessments
    setIsLoading(true);
    setTimeout(() => {
      setAssessments(mockAssessments);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleGenerateReport = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsGeneratingReport(true);
    setReportContent(null);

    const assessmentDataString = `Hospital: ${assessment.hospitalName}. VR Needs: ${assessment.vrNeeds}. MR Needs: ${assessment.mrNeeds}. AR Needs: ${assessment.arNeeds}. Budget: ${assessment.budget}. Current Tech: ${assessment.currentTech}. Goals: ${assessment.goals}.`;
    
    try {
      // In a real scenario, this might involve more complex report generation or fetching an existing admin-prepared report.
      // For now, we re-use the summarization flow for demonstration.
      const summary = await summarizeAssessment({ assessmentData: assessmentDataString });
      // Prepend existing AI summary if available, for a more "complete" report
      const fullReport = assessment.aiSummary 
        ? `Original AI Summary:\n${assessment.aiSummary}\n\nAdmin Generated Notes (based on current summarization):\n${summary.summary}`
        : summary.summary;
      setReportContent(fullReport); 
      toast({ title: "Report Generated", description: `Report for ${assessment.hospitalName} is ready.` });
    } catch (error) {
      console.error("Report generation error:", error);
      toast({ variant: "destructive", title: "Report Generation Failed", description: (error as Error).message });
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  const handleDownloadReport = () => {
    if (!reportContent || !selectedAssessment) return;
    const blob = new Blob([`Report for: ${selectedAssessment.hospitalName}\nSubmission Date: ${new Date(selectedAssessment.submissionDate).toLocaleDateString()}\n\n${reportContent}`], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report_${selectedAssessment.hospitalName.replace(/\s+/g, '_')}_${selectedAssessment.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Report Downloaded", description: `Report for ${selectedAssessment.hospitalName} downloaded.` });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">Hospital Assessment Reports</CardTitle>
          <CardDescription>View submitted assessments and generate summary reports for hospitals.</CardDescription>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <p className="text-muted-foreground">No assessments found.</p>
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
                    <TableCell className="hidden md:table-cell">{assessment.status}</TableCell>
                    <TableCell className="hidden lg:table-cell">{assessment.budget}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleGenerateReport(assessment)}
                        disabled={isGeneratingReport && selectedAssessment?.id === assessment.id}
                      >
                        {(isGeneratingReport && selectedAssessment?.id === assessment.id) ? 
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                          <Eye className="mr-2 h-4 w-4" />
                        }
                        <span className="hidden sm:inline">
                          {(isGeneratingReport && selectedAssessment?.id === assessment.id) ? "Generating..." : "View/Generate Report"}
                        </span>
                         <span className="sm:hidden">
                          {(isGeneratingReport && selectedAssessment?.id === assessment.id) ? "..." : "View"}
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedAssessment && reportContent && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Report for: {selectedAssessment.hospitalName}</CardTitle>
            <CardDescription>Generated on: {new Date().toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="prose max-w-none dark:prose-invert">
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">{reportContent}</pre>
          </CardContent>
          <CardFooter>
            <Button onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" /> Download Report (.txt)
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {isGeneratingReport && !reportContent && (
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Generating Report for: {selectedAssessment?.hospitalName}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-8">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="ml-3 text-muted-foreground">AI is processing the assessment data...</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
