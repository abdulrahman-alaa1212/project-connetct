
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; // Added for admin response
import type { Assessment } from "@/types";
import { Download, Eye, FileText, Loader2, MessageSquare, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { summarizeAssessment } from "@/ai/flows/summarize-assessment";

// Mock assessment data - now includes aiSummary, aiSolutions, and adminNotes
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
    aiSummary: "City General Hospital requires VR for orthopedic surgical training and MR for neurosurgery guidance. They also need AR for vein finding. Their budget is substantial, and they aim to enhance surgical outcomes and training.",
    aiSolutions: {
      suggestedSolutions: "PrecisionVR Surgical Sim, NeuroNav MR System, VeinSight AR Glasses",
      reasoning: "PrecisionVR offers realistic orthopedic modules. NeuroNav MR is designed for neurosurgical accuracy. VeinSight AR improves first-attempt success for IVs."
    },
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
    aiSummary: "Rural Health Clinic needs a low-cost VR solution for patient distraction during minor procedures. They have a small budget and basic tech.",
    aiSolutions: {
      suggestedSolutions: "CalmVR Basic, DistractoApp Mobile VR",
      reasoning: "These solutions are affordable and require minimal setup, suitable for basic patient distraction needs."
    },
    adminNotes: "Initial contact made. Awaiting their feedback on budget-friendly options."
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
    aiSummary: "Green Valley needs VR for rehab and AR for staff anatomy training. Budget is moderate.",
    aiSolutions: {
      suggestedSolutions: "RehabVR Suite, HoloAnatomy AR",
      reasoning: "RehabVR offers diverse physical therapy modules. HoloAnatomy AR is effective for interactive learning."
    }
    // adminNotes intentionally left blank for this one
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
    aiSummary: "City General Hospital (follow-up) is looking for comprehensive XR solutions across multiple specialties, including advanced simulation, MR for surgical planning, and AR for remote consultations. They have a large budget and advanced infrastructure.",
    aiSolutions: {
      suggestedSolutions: "SimX Enterprise Platform, MedVis MR Suite, ConnectAR Remote Assist",
      reasoning: "SimX provides broad specialty coverage. MedVis MR offers robust pre-op and intra-op tools. ConnectAR is designed for secure remote expert consultations."
    },
    adminNotes: "Project completed successfully. Case study pending."
  },
];


export default function ManageAssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setAssessments(mockAssessments);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleOpenReviewModal = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setAdminResponse(assessment.adminNotes || ""); // Pre-fill with existing notes
    setIsReviewModalOpen(true);
  };
  
  const handleSaveAdminResponse = () => {
    if (!selectedAssessment) return;
    // Simulate saving the response
    console.log("Saving admin response for", selectedAssessment.id, ":", adminResponse);
    // Update the mock data (in a real app, this would be an API call)
    const updatedAssessments = assessments.map(asm => 
      asm.id === selectedAssessment.id ? { ...asm, adminNotes: adminResponse, status: "Reviewed" as Assessment["status"] } : asm
    );
    setAssessments(updatedAssessments);
    setSelectedAssessment(prev => prev ? { ...prev, adminNotes: adminResponse, status: "Reviewed" } : null);

    toast({ title: "Response Saved", description: `Your notes for ${selectedAssessment.hospitalName} have been saved.` });
    // setIsReviewModalOpen(false); // Optionally close modal on save
  };

  const handleDownloadReport = () => {
    if (!selectedAssessment) return;

    let reportContent = `Assessment Report for: ${selectedAssessment.hospitalName}\n`;
    reportContent += `Submission Date: ${new Date(selectedAssessment.submissionDate).toLocaleDateString()}\n`;
    reportContent += `Status: ${selectedAssessment.status}\n\n`;

    reportContent += `--- Hospital Submission Details ---\n`;
    reportContent += `VR Needs: ${selectedAssessment.vrNeeds || 'N/A'}\n`;
    reportContent += `MR Needs: ${selectedAssessment.mrNeeds || 'N/A'}\n`;
    reportContent += `AR Needs: ${selectedAssessment.arNeeds || 'N/A'}\n`;
    reportContent += `Budget: ${selectedAssessment.budget || 'N/A'}\n`;
    reportContent += `Current Technology: ${selectedAssessment.currentTech || 'N/A'}\n`;
    reportContent += `Goals: ${selectedAssessment.goals || 'N/A'}\n\n`;

    if (selectedAssessment.aiSummary) {
      reportContent += `--- AI Generated Summary ---\n${selectedAssessment.aiSummary}\n\n`;
    }
    if (selectedAssessment.aiSolutions) {
      reportContent += `--- AI Suggested Solutions ---\n`;
      reportContent += `Solutions: ${selectedAssessment.aiSolutions.suggestedSolutions}\n`;
      reportContent += `Reasoning: ${selectedAssessment.aiSolutions.reasoning}\n\n`;
    }
    if (selectedAssessment.adminNotes) {
      reportContent += `--- Admin Notes / Official Response ---\n${selectedAssessment.adminNotes}\n\n`;
    } else if (adminResponse && selectedAssessment?.id === selectedAssessment.id) { // include current unsaved response if downloading for current modal
       reportContent += `--- Admin Notes / Official Response (Current Edits) ---\n${adminResponse}\n\n`;
    }
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `assessment_report_${selectedAssessment.hospitalName.replace(/\s+/g, '_')}_${selectedAssessment.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Report Downloaded", description: `Report for ${selectedAssessment.hospitalName} downloaded.` });
  };

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
          <CardDescription>Review submitted technology needs assessments, add responses, and generate reports.</CardDescription>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenReviewModal(assessment)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Review & Respond
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
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-primary">Review Assessment: {selectedAssessment.hospitalName}</DialogTitle>
              <DialogDescription>
                Submitted on: {new Date(selectedAssessment.submissionDate).toLocaleString()} | Status: {selectedAssessment.status}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid md:grid-cols-2 gap-6 py-4 text-sm">
              <Card>
                <CardHeader><CardTitle className="text-base">Hospital Submission</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {selectedAssessment.vrNeeds && <p><strong>VR Needs:</strong> {selectedAssessment.vrNeeds}</p>}
                  {selectedAssessment.mrNeeds && <p><strong>MR Needs:</strong> {selectedAssessment.mrNeeds}</p>}
                  {selectedAssessment.arNeeds && <p><strong>AR Needs:</strong> {selectedAssessment.arNeeds}</p>}
                  <p><strong>Budget:</strong> {selectedAssessment.budget}</p>
                  {selectedAssessment.currentTech && <p><strong>Current Tech:</strong> {selectedAssessment.currentTech}</p>}
                  <p><strong>Goals:</strong> {selectedAssessment.goals}</p>
                </CardContent>
              </Card>
              
              <div className="space-y-4">
                {selectedAssessment.aiSummary && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">AI Generated Summary</CardTitle></CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-xs bg-muted p-3 rounded-md">{selectedAssessment.aiSummary}</p>
                    </CardContent>
                  </Card>
                )}

                {selectedAssessment.aiSolutions && (
                   <Card>
                    <CardHeader><CardTitle className="text-base">AI Suggested Solutions</CardTitle></CardHeader>
                    <CardContent className="text-xs space-y-1">
                      <p className="font-medium">Solutions:</p>
                      <p className="whitespace-pre-wrap bg-muted p-2 rounded-md">{selectedAssessment.aiSolutions.suggestedSolutions}</p>
                      <p className="font-medium mt-1">Reasoning:</p>
                      <p className="whitespace-pre-wrap bg-muted p-2 rounded-md">{selectedAssessment.aiSolutions.reasoning}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="space-y-2 py-4">
              <h4 className="font-semibold text-foreground">Admin Notes / Official Response:</h4>
              <Textarea 
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Enter your notes, official response, or recommendations here..."
                rows={5}
                className="text-sm"
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button onClick={handleDownloadReport} variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" /> Download Report (.txt)
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <DialogClose asChild>
                  <Button variant="ghost" className="w-full sm:w-auto">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveAdminResponse} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" /> Save Admin Response
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
