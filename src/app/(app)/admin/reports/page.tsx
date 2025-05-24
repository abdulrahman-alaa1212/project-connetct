"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Assessment } from "@/types";
import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { summarizeAssessment } from "@/ai/flows/summarize-assessment";

// Mock assessment data
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
  },
  {
    id: "asm3",
    hospitalId: "hosp3",
    hospitalName: "University Medical Center",
    submissionDate: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    status: "Completed",
    vrNeeds: "Advanced simulation for various specialties.",
    mrNeeds: "Pre-operative planning and intraoperative navigation.",
    arNeeds: "Remote expert consultation using AR.",
    budget: "> $200k",
    currentTech: "Dedicated simulation lab, high-speed network.",
    goals: "Become a leader in medical XR technology.",
  },
];

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
      const summary = await summarizeAssessment({ assessmentData: assessmentDataString });
      // For MVP, report is the summary. In future, this could be a more structured document.
      setReportContent(summary.summary); 
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
          <CardTitle className="text-3xl font-bold text-primary">Hospital Assessment Reports</CardTitle>
          <CardDescription>View submitted assessments and generate summary reports.</CardDescription>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <p className="text-muted-foreground">No assessments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital Name</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">{assessment.hospitalName}</TableCell>
                    <TableCell>{new Date(assessment.submissionDate).toLocaleDateString()}</TableCell>
                    <TableCell>{assessment.status}</TableCell>
                    <TableCell>{assessment.budget}</TableCell>
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
                        { (isGeneratingReport && selectedAssessment?.id === assessment.id) ? "Generating..." : "View/Generate Report"}
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
