
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import type * as z from "zod";
import { FullAssessmentSchema } from "@/lib/schemas";
import type { FullAssessmentSchemaValues, UserSubmittedAssessment } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2, Save, Eye, FilePenLine, Info, Undo2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { summarizeAssessment, type SummarizeAssessmentOutput } from "@/ai/flows/summarize-assessment";
import { matchVrArSolutions, type MatchVrArSolutionsOutput } from "@/ai/flows/match-vr-ar-solutions";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";


const hospitalTypes = ["Public", "Private", "University", "Military", "Charity", "Other"];
const departmentExamples = [
  "Surgery (all types)", "Radiology and Diagnostics", "Medical Education and Training",
  "Emergency Medicine", "Intensive Care", "Rehabilitation", "Nursing",
  "Marketing and Patient Relations", "General Administration", "Other (Please specify)"
];
const yesNoOptions = ["Yes", "No"];
const yesNoMaybeOptions = ["Yes", "No", "Maybe in the future", "Not sure"];
const kpiStatusOptions = ["Yes, we have clear indicators", "We are working on defining them", "No, we haven't defined them yet and need help with that"];
const wifiPerformanceOptions = ["Yes", "No", "Partially", "Not sure"];
const techTeamOptions = ["Yes, full internal team", "Yes, limited internal team", "No, we rely on external support", "Other"];
const experienceLevelOptions = ["Very Low", "Low", "Medium", "High", "Very High", "Not sure"];
const yesNoLaterOptions = ["Yes", "No", "Will be determined later"];
const marketingInterestOptions = [
  "Yes, we are seriously considering it and consider it a priority",
  "Yes, we are considering it but it is not a top priority currently",
  "Maybe, the idea is on the table but has not been studied in depth",
  "No, we are not currently considering it",
  "Other",
];
const budgetAllocationOptions = [
  "Yes, a specific budget has been allocated",
  "Yes, there is an estimated budget but it is flexible",
  "No, a budget has not been allocated yet, but we are in the cost study phase",
  "No, and we need cost estimates based on recommendations",
];
const timelineOptions = [
  "Within the next 3 months", "Within 3-6 months", "Within 6-12 months",
  "Within the next year", "Not yet determined/depends on assessment results"
];
const communicationPreferenceOptions = [
  "Via registered email", "Via phone call",
  "Schedule an online meeting", "Schedule an in-person meeting (if possible)"
];

const mainGoalsOptions = [
  { id: "improveDiagnosis", label: "Improve medical diagnosis accuracy." },
  { id: "improveSurgicalOutcomes", label: "Improve surgical outcomes and reduce complications." },
  { id: "enhanceTraining", label: "Enhance the efficiency and effectiveness of medical staff training (doctors, nurses, technicians)." },
  { id: "reduceLearningCurve", label: "Reduce the learning curve for new or complex medical procedures." },
  { id: "reduceMedicalErrors", label: "Reduce potential medical errors." },
  { id: "improvePatientExperience", label: "Improve patient experience and increase satisfaction." },
  { id: "enhancePatientEngagement", label: "Enhance patient engagement in their treatment plan and awareness of their condition." },
  { id: "increaseWorkflowEfficiency", label: "Increase workflow efficiency and reduce time spent on certain procedures." },
  { id: "lowerCosts", label: "Lower operational or long-term training costs." },
  { id: "enhanceInnovation", label: "Promote innovation and leadership for the hospital." },
  { id: "other", label: "Other (Please specify)" },
];

const departmentProcedureTypes = [
  "Mostly traditional and heavily reliant on human skills and experience",
  "Modern and heavily reliant on advanced technologies and devices",
  "A balanced mix of traditional and modern methods",
];

const departmentOpportunities = [
    { id: "improveAccuracy", label: "Improve accuracy of medical or diagnostic procedures.", fieldName: "improveAccuracyDetails" },
    { id: "reduceTime", label: "Reduce procedure time.", fieldName: "reduceTimeDetails" },
    { id: "enhanceSafety", label: "Enhance patient safety.", fieldName: "enhanceSafetyDetails" },
    { id: "improveTraining", label: "Improve training for doctors, surgeons, nurses, or technicians.", fieldName: "improveTrainingDetails" },
    { id: "facilitatePlanning", label: "Facilitate planning for complex procedures (e.g., surgical operations).", fieldName: "facilitatePlanningDetails" },
    { id: "improveCommunication", label: "Improve communication among medical team members.", fieldName: "improveCommunicationDetails" },
    { id: "improvePatientExperience", label: "Improve patient experience or awareness of their condition/treatment plan.", fieldName: "improvePatientExperienceDetails" },
    { id: "reduceResourceDependency", label: "Reduce dependency on costly resources (e.g., physical anatomical models, cadaver training).", fieldName: "reduceResourceDependencyDetails" },
    { id: "other", label: "Other areas (Please specify and explain):", fieldName: "otherDetails", otherSpecifyField: "otherField" },
];


export function AssessmentForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("editId");

  const [isEditMode, setIsEditMode] = useState(!!editId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [submissionResult, setSubmissionResult] = useState<SummarizeAssessmentOutput | null>(null);
  const [solutionMatches, setSolutionMatches] = useState<MatchVrArSolutionsOutput | null>(null);
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

  const draftStorageKey = user?.hospitalId ? `assessment_form_draft_${user.hospitalId}` : null;
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<FullAssessmentSchemaValues>({
    resolver: zodResolver(FullAssessmentSchema),
    defaultValues: {
      // ... (existing default values from previous implementation)
      s1_hospitalName: "", s1_hospitalType: undefined, s1_hospitalTypeOther: "", s1_location: "", s1_bedCount: "", s1_concernedDepartments: [], s1_concernedDepartmentsOther: "", s1_contactName: "", s1_contactPosition: "", s1_contactEmail: "", s1_contactPhone: "", s1_hasClearVision: undefined, s1_visionDetails: "", s1_explorePriorityDepartments: "", s2_hasPreviousExperience: undefined, s2_experiences: [], s3_mainGoals: [], s3_mainGoalsOther: "", s3_currentChallenges: "", s3_hasKPIs: undefined, s3_kpiDetails: "", s4_wifiPerformance: undefined, s4_wifiDetails: "", s4_bandwidthConstraints: undefined, s4_bandwidthDetails: "", s4_networkSecurityPolicies: undefined, s4_networkSecurityDetails: "", s4_hasSpecializedEquipment: undefined, s4_equipmentDetails: "", s4_hasHighSpecComputers: undefined, s4_computerDetails: "", s4_mainInformationSystems: "", s4_mainInformationSystemsOther: "", s4_needsIntegration: undefined, s4_integrationDetails: "", s4_itSupportTeam: undefined, s4_itSupportTeamOther: "", s4_itTeamExperience: undefined, s4_itContactPoint: undefined, s4_itContactName: "", s4_staffTechSavviness: undefined, s4_resistanceToChangePlan: "", s5_marketingInterest: undefined, s5_marketingInterestOther: "", s5_marketingGoals: "", s6_departmentAnalyses: [], s7_hasInitialBudget: undefined, s7_budgetRange: "", s7_expectedTimeline: undefined, s7_hasCriticalDeadlines: undefined, s7_deadlineDetails: "", s8_dataSecurityConcerns: undefined, s8_securityConcernDetails: "", s8_regulatoryRequirements: undefined, s8_regulatoryDetails: "", s8_otherInnovationProjects: "", s8_keyStakeholders: "", s9_questionsForYura: "", s9_additionalInfo: "", s9_communicationPreferences: [], s9_preferredContactTimes: "",
    },
  });

  // Autosave draft functionality
  const watchedValues = form.watch();
  useEffect(() => {
    if (isInitializing || !draftStorageKey || isSubmittedSuccessfully || isEditMode) return; // Don't autosave during init, if submitted, or in edit mode (edit has its own load)

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (form.formState.isDirty) { // Only save if form has been touched
        localStorage.setItem(draftStorageKey, JSON.stringify(watchedValues));
        // console.log("Draft autosaved");
      }
    }, 1000); // Debounce time: 1 second

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [watchedValues, draftStorageKey, isInitializing, isSubmittedSuccessfully, form.formState.isDirty, isEditMode]);


  // Load draft or existing assessment for editing
  useEffect(() => {
    setIsEditMode(!!editId);
    setIsInitializing(true);
    setIsSubmittedSuccessfully(false); // Reset submission state on load/editId change

    const loadData = async () => {
      if (editId && user && user.hospitalId) {
        const storageKey = `user_assessments_${user.hospitalId}`;
        const storedAssessments = localStorage.getItem(storageKey);
        if (storedAssessments) {
          const assessments: UserSubmittedAssessment[] = JSON.parse(storedAssessments);
          const assessmentToEdit = assessments.find(a => a.id === editId);
          if (assessmentToEdit) {
            form.reset(assessmentToEdit.formData);
          } else {
            toast({ variant: "destructive", title: "Error", description: "Assessment not found for editing." });
            router.push("/my-assessments");
          }
        }
      } else if (draftStorageKey && !editId) { // Only load draft if not in edit mode
        const draftDataJson = localStorage.getItem(draftStorageKey);
        if (draftDataJson) {
          try {
            const draftData = JSON.parse(draftDataJson);
            // Simple prompt to restore draft
            if (window.confirm("You have a saved draft. Would you like to restore it?")) {
              form.reset(draftData);
              toast({ title: "Draft Restored", description: "Your previously saved draft has been loaded."});
            } else {
              localStorage.removeItem(draftStorageKey); // User chose not to restore
              form.reset(); // Reset to default values
            }
          } catch (e) {
            console.error("Failed to parse draft data", e);
            localStorage.removeItem(draftStorageKey); // Clear corrupted draft
            form.reset();
          }
        } else {
            form.reset(); // Reset to defaults if no draft and not editing
        }
      } else {
         form.reset(); // Ensure form is reset if no editId and no draft key (e.g. user not logged in yet)
      }
      setIsInitializing(false);
    };
    
    loadData();

  }, [editId, user, draftStorageKey, form, toast, router]);


  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: "s2_experiences",
  });

  const { fields: departmentAnalysisFields, append: appendDepartmentAnalysis, remove: removeDepartmentAnalysis } = useFieldArray({
    control: form.control,
    name: "s6_departmentAnalyses",
  });

  // Watchers (kept for conditional rendering logic)
  const watchS1HospitalType = form.watch("s1_hospitalType");
  const watchS1ConcernedDepartments = form.watch("s1_concernedDepartments");
  const watchS1HasClearVision = form.watch("s1_hasClearVision");
  const watchS2HasPreviousExperience = form.watch("s2_hasPreviousExperience");
  const watchS3MainGoals = form.watch("s3_mainGoals");
  const watchS3HasKPIs = form.watch("s3_hasKPIs");
  const watchS4WifiPerformance = form.watch("s4_wifiPerformance");
  const watchS4BandwidthConstraints = form.watch("s4_bandwidthConstraints");
  const watchS4NetworkSecurityPolicies = form.watch("s4_networkSecurityPolicies");
  const watchS4HasSpecializedEquipment = form.watch("s4_hasSpecializedEquipment");
  const watchS4HasHighSpecComputers = form.watch("s4_hasHighSpecComputers");
  const watchS4NeedsIntegration = form.watch("s4_needsIntegration");
  const watchS4ITSupportTeam = form.watch("s4_itSupportTeam");
  const watchS4ITContactPoint = form.watch("s4_itContactPoint");
  const watchS5MarketingInterest = form.watch("s5_marketingInterest");
  const watchS7HasCriticalDeadlines = form.watch("s7_hasCriticalDeadlines");
  const watchS8DataSecurityConcerns = form.watch("s8_dataSecurityConcerns");
  const watchS8RegulatoryRequirements = form.watch("s8_regulatoryRequirements");


  function generateAssessmentDataString(values: FullAssessmentSchemaValues): string {
    let dataString = "";
    dataString += `Section 1: General Information\n`;
    dataString += `Hospital Name: ${values.s1_hospitalName}\n`;
    dataString += `Hospital Type: ${values.s1_hospitalType}${values.s1_hospitalType === "Other" ? ` (${values.s1_hospitalTypeOther})` : ''}\n`;
    dataString += `Location: ${values.s1_location}\n`;
    dataString += `Bed Count: ${values.s1_bedCount}\n`;
    dataString += `Concerned Departments: ${values.s1_concernedDepartments.join(', ')}${values.s1_concernedDepartments.includes("Other (Please specify)") ? ` (${values.s1_concernedDepartmentsOther})` : ''}\n`;
    dataString += `Contact Person: ${values.s1_contactName}, ${values.s1_contactPosition}, ${values.s1_contactEmail}, ${values.s1_contactPhone}\n`;
    dataString += `Clear Vision for Application: ${values.s1_hasClearVision}\n`;
    if (values.s1_hasClearVision === "Yes, we have a clear and specific vision.") dataString += `Vision Details: ${values.s1_visionDetails}\n`;
    if (values.s1_hasClearVision === "No, but we are interested in exploring possibilities generally in specific department(s).") dataString += `Priority Departments for Exploration: ${values.s1_explorePriorityDepartments}\n`;

    dataString += `\nSection 2: Previous Experiences\n`;
    dataString += `Previous Experience with VR/AR/MR: ${values.s2_hasPreviousExperience}\n`;
    if (values.s2_hasPreviousExperience === "Yes" && values.s2_experiences) {
      values.s2_experiences.forEach((exp, i) => {
        dataString += `Experience ${i + 1}:\n`;
        dataString += `  Company/Developer: ${exp.companyName}\n`;
        dataString += `  Product/Description: ${exp.productDescription}\n`;
        dataString += `  Positives: ${exp.positives}\n`;
        dataString += `  Negatives/Challenges: ${exp.negatives}\n`;
        dataString += `  Still in Use: ${exp.stillInUse}${exp.stillInUse === "No" ? ` (Reason: ${exp.stillInUseReason})` : ''}\n`;
      });
    }

    dataString += `\nSection 3: Goals and Challenges\n`;
    dataString += `Main Goals: ${values.s3_mainGoals.join(', ')}${values.s3_mainGoals.includes("Other (Please specify)") ? ` (${values.s3_mainGoalsOther})` : ''}\n`;
    dataString += `Current Challenges: ${values.s3_currentChallenges}\n`;
    dataString += `Defined KPIs: ${values.s3_hasKPIs}\n`;
    if (values.s3_hasKPIs === "Yes, we have clear indicators" || values.s3_hasKPIs === "We are working on defining them") dataString += `KPI Details: ${values.s3_kpiDetails}\n`;

    dataString += `\nSection 4: Infrastructure and Resources\n`;
    dataString += `Wi-Fi Performance: ${values.s4_wifiPerformance}${values.s4_wifiPerformance === "Partially" || values.s4_wifiPerformance === "No" ? ` (Details: ${values.s4_wifiDetails})` : ''}\n`;
    dataString += `Bandwidth Constraints: ${values.s4_bandwidthConstraints}${values.s4_bandwidthConstraints === "Yes" ? ` (Details: ${values.s4_bandwidthDetails})` : ''}\n`;
    dataString += `Network Security Policies: ${values.s4_networkSecurityPolicies}${values.s4_networkSecurityPolicies === "Yes" ? ` (Details: ${values.s4_networkSecurityDetails})` : ''}\n`;
    dataString += `Has Specialized VR/AR/MR Equipment: ${values.s4_hasSpecializedEquipment}${values.s4_hasSpecializedEquipment === "Yes" ? ` (Details: ${values.s4_equipmentDetails})` : ''}\n`;
    dataString += `Has High-Spec Computers: ${values.s4_hasHighSpecComputers}${values.s4_hasHighSpecComputers === "Yes" || values.s4_hasHighSpecComputers === "Partially" ? ` (Details: ${values.s4_computerDetails})` : ''}\n`;
    dataString += `Main Information Systems: ${values.s4_mainInformationSystems}${values.s4_mainInformationSystemsOther ? ` (Other: ${values.s4_mainInformationSystemsOther})` : ''}\n`;
    dataString += `Needs Integration with Current Systems: ${values.s4_needsIntegration}${values.s4_needsIntegration === "Yes" || values.s4_needsIntegration === "Maybe in the future" ? ` (Integration Details: ${values.s4_integrationDetails})` : ''}\n`;
    dataString += `IT Support Team: ${values.s4_itSupportTeam}${values.s4_itSupportTeam === "Other" ? ` (${values.s4_itSupportTeamOther})` : ''}\n`;
    dataString += `IT Team Experience with New Tech: ${values.s4_itTeamExperience}\n`;
    dataString += `IT Contact Point for AR/MR Projects: ${values.s4_itContactPoint}${values.s4_itContactPoint === "Yes" ? ` (Contact Name: ${values.s4_itContactName})` : ''}\n`;
    dataString += `Staff Tech Savviness: ${values.s4_staffTechSavviness}\n`;
    dataString += `Plan for Resistance to Change: ${values.s4_resistanceToChangePlan}\n`;

    dataString += `\nSection 5: VR/AR in Marketing\n`;
    dataString += `Interest in VR/AR for Marketing: ${values.s5_marketingInterest}${values.s5_marketingInterest === "Other" ? ` (${values.s5_marketingInterestOther})` : ''}\n`;
    if (values.s5_marketingInterest && values.s5_marketingInterest !== "No, we are not currently considering it") dataString += `Marketing Goals/Ideas: ${values.s5_marketingGoals}\n`;

    if (values.s6_departmentAnalyses && values.s6_departmentAnalyses.length > 0) {
      dataString += `\nSection 6: Department Analyses\n`;
      values.s6_departmentAnalyses.forEach((dept, i) => {
        dataString += `Department Analysis ${i + 1}:\n`;
        dataString += `  Department Name: ${dept.departmentName}\n`;
        dataString += `  Main Equipment: ${dept.mainEquipment}\n`;
        dataString += `  Current Procedures: ${dept.currentProcedures}\n`;
        dataString += `  Procedure Type: ${dept.procedureType}\n`;
        if(dept.procedureType === "Mostly traditional and heavily reliant on human skills and experience") dataString += `  Traditional Problems: ${dept.traditionalProblems}\n`;
        if(dept.procedureType === "Modern and heavily reliant on advanced technologies and devices") dataString += `  Modern Problems: ${dept.modernProblems}\n`;
        dataString += `  General Problems: ${dept.generalProblems}\n`;
        if(dept.opportunities){
            dataString += `  Opportunities:\n`;
            if(dept.opportunities.improveAccuracy) dataString += `    - Improve Accuracy: ${dept.opportunities.improveAccuracyDetails}\n`;
            if(dept.opportunities.reduceTime) dataString += `    - Reduce Time: ${dept.opportunities.reduceTimeDetails}\n`;
            if(dept.opportunities.enhanceSafety) dataString += `    - Enhance Safety: ${dept.opportunities.enhanceSafetyDetails}\n`;
            if(dept.opportunities.improveTraining) dataString += `    - Improve Training: ${dept.opportunities.improveTrainingDetails}\n`;
            if(dept.opportunities.facilitatePlanning) dataString += `    - Facilitate Planning: ${dept.opportunities.facilitatePlanningDetails}\n`;
            if(dept.opportunities.improveCommunication) dataString += `    - Improve Communication: ${dept.opportunities.improveCommunicationDetails}\n`;
            if(dept.opportunities.improvePatientExperience) dataString += `    - Improve Patient Experience: ${dept.opportunities.improvePatientExperienceDetails}\n`;
            if(dept.opportunities.reduceResourceDependency) dataString += `    - Reduce Resource Dependency: ${dept.opportunities.reduceResourceDependencyDetails}\n`;
            if(dept.opportunities.other && dept.opportunities.otherField) dataString += `    - Other (${dept.opportunities.otherField}): ${dept.opportunities.otherDetails}\n`;
        }
      });
    }

    dataString += `\nSection 7: Budget and Timeline\n`;
    dataString += `Initial Budget Allocated: ${values.s7_hasInitialBudget}\n`;
    if (values.s7_budgetRange) dataString += `Budget Range: ${values.s7_budgetRange}\n`;
    dataString += `Expected Timeline for First Project: ${values.s7_expectedTimeline}\n`;
    dataString += `Critical Deadlines: ${values.s7_hasCriticalDeadlines}${values.s7_hasCriticalDeadlines === "Yes" ? ` (Details: ${values.s7_deadlineDetails})` : ''}\n`;

    dataString += `\nSection 8: Other Concerns and Considerations\n`;
    dataString += `Data Security Concerns: ${values.s8_dataSecurityConcerns}${values.s8_dataSecurityConcerns === "Yes" ? ` (Details: ${values.s8_securityConcernDetails})` : ''}\n`;
    dataString += `Regulatory Requirements: ${values.s8_regulatoryRequirements}${values.s8_regulatoryRequirements === "Yes" || values.s8_regulatoryRequirements === "Not sure" ? ` (Details: ${values.s8_regulatoryDetails})` : ''}\n`;
    dataString += `Other Innovation Projects: ${values.s8_otherInnovationProjects}\n`;
    dataString += `Key Stakeholders: ${values.s8_keyStakeholders}\n`;

    dataString += `\nSection 9: Additional Questions and Closing\n`;
    dataString += `Questions for Yura Team: ${values.s9_questionsForYura}\n`;
    dataString += `Additional Information: ${values.s9_additionalInfo}\n`;
    dataString += `Communication Preferences: ${values.s9_communicationPreferences.join(', ')}\n`;
    dataString += `Preferred Contact Times: ${values.s9_preferredContactTimes}\n`;

    return dataString;
  }


  async function onSubmit(values: FullAssessmentSchemaValues) {
    if (!user || !user.hospitalId) {
      toast({ variant: "destructive", title: "Error", description: "User not authenticated or hospital ID missing." });
      return;
    }
    setIsSubmitting(true);
    setSubmissionResult(null);
    setSolutionMatches(null);

    const assessmentDataString = generateAssessmentDataString(values);

    try {
      const summaryOutput = await summarizeAssessment({ assessmentData: assessmentDataString });
      setSubmissionResult(summaryOutput);
      const solutionsOutput = await matchVrArSolutions({ assessmentData: assessmentDataString });
      setSolutionMatches(solutionsOutput);

      const storageKey = `user_assessments_${user.hospitalId}`;
      const storedAssessments = localStorage.getItem(storageKey);
      let assessments: UserSubmittedAssessment[] = storedAssessments ? JSON.parse(storedAssessments) : [];

      if (isEditMode && editId) {
        assessments = assessments.map(asm =>
          asm.id === editId
          ? {
              ...asm,
              formData: values,
              hospitalName: values.s1_hospitalName,
              primaryGoalsSummary: values.s3_mainGoals.slice(0, 2).join(', ') + (values.s3_mainGoals.length > 2 ? '...' : ''),
              aiSummary: summaryOutput.summary,
              aiSolutions: solutionsOutput,
              submissionDate: new Date().toISOString(),
              status: "Submitted"
            }
          : asm
        );
        toast({ title: "Assessment Updated", description: "Your assessment has been successfully updated and re-analyzed." });
      } else {
        const newAssessmentId = Date.now().toString();
        const newAssessment: UserSubmittedAssessment = {
          id: newAssessmentId,
          hospitalId: user.hospitalId,
          hospitalName: values.s1_hospitalName,
          submissionDate: new Date().toISOString(),
          status: "Submitted",
          primaryGoalsSummary: values.s3_mainGoals.slice(0, 2).join(', ') + (values.s3_mainGoals.length > 2 ? '...' : ''),
          formData: values,
          aiSummary: summaryOutput.summary,
          aiSolutions: solutionsOutput,
          adminResponseText: "",
          adminResponsePdfName: ""
        };
        assessments.push(newAssessment);
        toast({ title: "Assessment Submitted", description: "Your assessment has been successfully submitted and analyzed." });
        if (draftStorageKey) {
            localStorage.removeItem(draftStorageKey); // Clear draft on successful submission
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(assessments));
      setIsSubmittedSuccessfully(true); // Set flag to show results view

      if (isEditMode) {
        router.push("/my-assessments");
      }
      // For new submissions, AI results are displayed below due to isSubmittedSuccessfully flag.

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: isEditMode ? "Update Failed" : "Submission Failed",
        description: (error as Error).message || `Could not ${isEditMode ? 'update' : 'process'} the assessment.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleStartNewAssessment = () => {
    if (draftStorageKey) {
        localStorage.removeItem(draftStorageKey);
    }
    form.reset();
    setIsSubmittedSuccessfully(false);
    setSubmissionResult(null);
    setSolutionMatches(null);
    setIsEditMode(false); // Ensure we are not in edit mode
    router.replace('/assessment', undefined); // Clear editId from URL if present
  };

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading assessment form...</p>
      </div>
    );
  }

  const pageTitle = isEditMode ? "Edit Hospital Technology Needs Assessment" : "Hospital Technology Needs Assessment";
  const pageDescription = isEditMode
    ? "Please review and update the details of your assessment. Your answers will help us refine our understanding and recommendations."
    : "Please answer the following questions with as much detail and accuracy as possible. Your answers will help us better understand your needs and provide appropriate recommendations.";
  const submitButtonText = isEditMode ? "Update Assessment" : "Submit Assessment & Get AI Analysis";

  if (isSubmittedSuccessfully && !isEditMode) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">Assessment Submitted Successfully!</CardTitle>
            <CardDescription>Thank you. Your assessment has been processed. Below are the AI-generated insights.</CardDescription>
          </CardHeader>
        </Card>
        {submissionResult && (
          <Card>
            <CardHeader><CardTitle className="text-xl text-primary">AI Generated Summary</CardTitle></CardHeader>
            <CardContent><pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">{submissionResult.summary}</pre></CardContent>
          </Card>
        )}
        {solutionMatches && (
          <Card>
            <CardHeader><CardTitle className="text-xl text-primary">AI Suggested Solutions</CardTitle></CardHeader>
            <CardContent>
              <h3 className="font-semibold">Solutions:</h3>
              <pre className="whitespace-pre-wrap mb-2 bg-muted p-4 rounded-md text-sm">{solutionMatches.suggestedSolutions}</pre>
              <h3 className="font-semibold">Reasoning:</h3>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">{solutionMatches.reasoning}</pre>
            </CardContent>
          </Card>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => router.push("/my-assessments")} variant="outline">
            <Eye className="mr-2 h-4 w-4" /> View My Assessments
          </Button>
          <Button onClick={handleStartNewAssessment}>
            <FilePenLine className="mr-2 h-4 w-4" /> Submit Another Assessment
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">{pageTitle}</CardTitle>
          <CardDescription>{pageDescription}</CardDescription>
           {!isEditMode && (
            <p className="text-sm text-muted-foreground pt-2 flex items-center">
              <Info className="mr-2 h-4 w-4 text-primary" />
              Your progress is automatically saved as a draft.
            </p>
          )}
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Section 1: General Information */}
          <Card>
            <CardHeader>
              <CardTitle>Section 1: General Information about the Hospital and Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="s1_hospitalName" render={({ field }) => ( <FormItem> <FormLabel>1. Hospital Name:</FormLabel> <FormControl><Input placeholder="Hospital Name" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="s1_hospitalType" render={({ field }) => ( <FormItem> <FormLabel>2. Hospital Type:</FormLabel> <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select hospital type" /></SelectTrigger></FormControl> <SelectContent>{hospitalTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
              {watchS1HospitalType === "Other" && ( <FormField control={form.control} name="s1_hospitalTypeOther" render={({ field }) => ( <FormItem> <FormLabel>Please specify other hospital type:</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} /> )}
              <FormField control={form.control} name="s1_location" render={({ field }) => ( <FormItem> <FormLabel>3. Location (City/Governorate):</FormLabel> <FormControl><Input placeholder="City/Governorate" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="s1_bedCount" render={({ field }) => ( <FormItem> <FormLabel>4. Approximate Bed Count (as an indicator of hospital size):</FormLabel> <FormControl><Input type="number" placeholder="Number of beds" {...field} /></FormControl> <FormMessage /> </FormItem> )} />

              <FormField control={form.control} name="s1_concernedDepartments" render={({ field }) => (
                <FormItem>
                  <FormLabel>5. Medical and administrative departments primarily concerned with technology application (select multiple):</FormLabel>
                  {departmentExamples.map((item) => (
                    <FormField key={item} control={form.control} name="s1_concernedDepartments" render={({ field: checkField }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 my-2">
                        <FormControl>
                          <Checkbox
                            checked={checkField.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? checkField.onChange([...(checkField.value || []), item])
                                : checkField.onChange(
                                    (checkField.value || []).filter(
                                      (value) => value !== item
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{item}</FormLabel>
                      </FormItem>
                    )} />
                  ))}
                  <FormDescription>Examples: Surgery, Radiology, Medical Education, Emergency, ICU, Rehab, Nursing, Marketing, Admin.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              {watchS1ConcernedDepartments?.includes("Other (Please specify)") && ( <FormField control={form.control} name="s1_concernedDepartmentsOther" render={({ field }) => ( <FormItem> <FormLabel>Please specify other department:</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} /> )}

              <FormLabel className="font-semibold block pt-2">6. Primary Contact Information for this assessment/project:</FormLabel>
              <FormField control={form.control} name="s1_contactName" render={({ field }) => ( <FormItem> <FormLabel>Full Name:</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="s1_contactPosition" render={({ field }) => ( <FormItem> <FormLabel>Position/Job Title:</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="s1_contactEmail" render={({ field }) => ( <FormItem> <FormLabel>Official Email:</FormLabel> <FormControl><Input type="email" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="s1_contactPhone" render={({ field }) => ( <FormItem> <FormLabel>Work Phone (with country/city code):</FormLabel> <FormControl><Input type="tel" {...field} /></FormControl> <FormMessage /> </FormItem> )} />

              <FormField control={form.control} name="s1_hasClearVision" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>7. Do you have a clear and specific vision for the application/use of AR or MR technology?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} defaultValue={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl><RadioGroupItem value="Yes, we have a clear and specific vision." /></FormControl> <FormLabel className="font-normal">Yes, we have a clear and specific vision.</FormLabel> </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl><RadioGroupItem value="No, but we are interested in exploring possibilities generally in specific department(s)." /></FormControl> <FormLabel className="font-normal">No, but we are interested in exploring possibilities generally in specific department(s).</FormLabel> </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl><RadioGroupItem value="No, and we want to generally explore possibilities in the hospital as a whole." /></FormControl> <FormLabel className="font-normal">No, and we want to generally explore possibilities in the hospital as a whole.</FormLabel> </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {watchS1HasClearVision === "Yes, we have a clear and specific vision." && ( <FormField control={form.control} name="s1_visionDetails" render={({ field }) => ( <FormItem> <FormLabel>8. Please describe the proposed application/project in detail (Problem it aims to solve? How do you envision using the tech? Target users?):</FormLabel> <FormControl><Textarea rows={4} {...field} /></FormControl> <FormMessage /> </FormItem> )} /> )}
              {watchS1HasClearVision === "No, but we are interested in exploring possibilities generally in specific department(s)." && ( <FormField control={form.control} name="s1_explorePriorityDepartments" render={({ field }) => ( <FormItem> <FormLabel>9. Please specify these priority departments for exploration:</FormLabel> <FormControl><Textarea {...field} /></FormControl> <FormMessage /> </FormItem> )} /> )}
            </CardContent>
          </Card>

          {/* Section 2: Previous Experiences */}
          <Card>
            <CardHeader><CardTitle>Section 2: Previous Experiences with VR/AR/MR Technologies</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="s2_hasPreviousExperience" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>1. Has the hospital or any of its departments previously dealt with or used any VR, AR, or MR technology?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} defaultValue={field.value} className="flex flex-row space-x-3">
                      {yesNoOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>(If "No", please proceed to Section 3)</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              {watchS2HasPreviousExperience === "Yes" && (
                <div className="space-y-4">
                  <FormLabel>2. If "Yes", please clarify for each previous experience (add more experiences if necessary):</FormLabel>
                  {experienceFields.map((item, index) => (
                    <Card key={item.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-lg text-primary">Experience ({index + 1})</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(index)}><Trash2 className="text-destructive h-5 w-5" /></Button>
                      </div>
                      <FormField control={form.control} name={`s2_experiences.${index}.companyName`} render={({ field }) => (<FormItem><FormLabel>a. Who did you deal with (Company/Developer/Entity name)?</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`s2_experiences.${index}.productDescription`} render={({ field }) => (<FormItem><FormLabel>b. What was the product, application, or project? (Brief description, VR/AR/MR tech used)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`s2_experiences.${index}.positives`} render={({ field }) => (<FormItem><FormLabel>c. What were the main positives or benefits achieved?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`s2_experiences.${index}.negatives`} render={({ field }) => (<FormItem><FormLabel>d. What were the main drawbacks, challenges, or problems faced?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`s2_experiences.${index}.stillInUse`} render={({ field }) => (
                        <FormItem className="space-y-2"><FormLabel>e. Is this product/application/project still in use?</FormLabel>
                          <RadioGroup onValueChange={field.onChange} value={field.value} defaultValue={field.value} className="flex flex-row space-x-3">
                           {yesNoOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                          </RadioGroup>
                          <FormMessage />
                        </FormItem>)} />
                      {form.watch(`s2_experiences.${index}.stillInUse`) === "No" && (
                         <FormField control={form.control} name={`s2_experiences.${index}.stillInUseReason`} render={({ field }) => (<FormItem><FormLabel>If No, why is it no longer in use?</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      )}
                    </Card>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendExperience({ companyName: "", productDescription: "", positives: "", negatives: "", stillInUse: undefined, stillInUseReason: "" })}> <PlusCircle className="mr-2 h-4 w-4" /> Add Another Experience</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Current Goals and Challenges */}
          <Card>
            <CardHeader><CardTitle>Section 3: Current Goals and Challenges (related to potential AR/MR application)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="s3_mainGoals" render={() => (
                <FormItem>
                  <FormLabel>1. What are the main goals you aim to achieve by implementing AR/MR technologies in the identified areas? (Select multiple, or prioritize if possible)</FormLabel>
                  {mainGoalsOptions.map((item) => (
                    <FormField key={item.id} control={form.control} name="s3_mainGoals" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 my-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.label)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.label])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== item.label
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{item.label}</FormLabel>
                      </FormItem>
                    )} />
                  ))}
                  <FormMessage />
                </FormItem>
              )} />
              {watchS3MainGoals?.includes("Other (Please specify)") && (
                <FormField control={form.control} name="s3_mainGoalsOther" render={({ field }) => ( <FormItem> <FormLabel>Please specify the other goal:</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>)} />
              )}
              <FormField control={form.control} name="s3_currentChallenges" render={({ field }) => (<FormItem><FormLabel>2. What are the main current challenges or problems in the targeted departments/applications that you hope AR/MR technologies will help address or overcome? (Detailed description for each challenge)</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="s3_hasKPIs" render={({ field }) => (
                <FormItem className="space-y-3"><FormLabel>3. Have you defined Key Performance Indicators (KPIs), quantitative or qualitative, to measure the success of applying these technologies in achieving the mentioned goals?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} defaultValue={field.value} className="flex flex-col space-y-1">
                      {kpiStatusOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {(watchS3HasKPIs === "Yes, we have clear indicators" || watchS3HasKPIs === "We are working on defining them") && (
                <FormField control={form.control} name="s3_kpiDetails" render={({ field }) => (<FormItem><FormLabel>4. Please list the most important of these indicators (or examples):</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
              )}
            </CardContent>
          </Card>

          {/* Section 4: Technical Infrastructure and Current Resources */}
          <Card>
            <CardHeader><CardTitle>Section 4: Technical Infrastructure and Current Resources</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormLabel className="font-semibold block">1. Hospital Network Infrastructure:</FormLabel>
              <FormField control={form.control} name="s4_wifiPerformance" render={({ field }) => (
                <FormItem><FormLabel>a. Is there a high-performance Wi-Fi network with good and stable coverage in potential technology application areas?</FormLabel>
                <Controller control={form.control} name="s4_wifiPerformance" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                    {wifiPerformanceOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {(watchS4WifiPerformance === "No" || watchS4WifiPerformance === "Partially") && <FormField control={form.control} name="s4_wifiDetails" render={({ field }) => (<FormItem><FormLabel>Wi-Fi Clarification:</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />}

              <FormField control={form.control} name="s4_bandwidthConstraints" render={({ field }) => (
                <FormItem><FormLabel>b. Are there known network bandwidth limitations that might affect AR/MR applications?</FormLabel>
                <Controller control={form.control} name="s4_bandwidthConstraints" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                    {["Yes", "No", "Not sure"].map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {(watchS4BandwidthConstraints === "Yes") && <FormField control={form.control} name="s4_bandwidthDetails" render={({ field }) => (<FormItem><FormLabel>Bandwidth Clarification:</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />}

              <FormField control={form.control} name="s4_networkSecurityPolicies" render={({ field }) => (
                <FormItem><FormLabel>c. Are there strict network security policies that might require special configurations for AR/MR devices or applications?</FormLabel>
                <Controller control={form.control} name="s4_networkSecurityPolicies" render={({field: controllerField}) => (
                 <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                    {["Yes", "No", "Not sure"].map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {(watchS4NetworkSecurityPolicies === "Yes") && <FormField control={form.control} name="s4_networkSecurityDetails" render={({ field }) => (<FormItem><FormLabel>Security Policies Clarification:</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />}

              <FormLabel className="font-semibold block pt-2">2. Current Technical Devices and Equipment:</FormLabel>
              <FormField control={form.control} name="s4_hasSpecializedEquipment" render={({ field }) => (
                <FormItem><FormLabel>a. Does the hospital currently own any specialized VR headsets, AR headsets/glasses, or MR headsets?</FormLabel>
                 <Controller control={form.control} name="s4_hasSpecializedEquipment" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-row space-x-3">
                    {yesNoOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {watchS4HasSpecializedEquipment === "Yes" && <FormField control={form.control} name="s4_equipmentDetails" render={({ field }) => (<FormItem><FormLabel>Please list types, quantity, and condition (new, used, etc.):</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />}

              <FormField control={form.control} name="s4_hasHighSpecComputers" render={({ field }) => (
                <FormItem><FormLabel>b. Are high-specification desktop/laptop computers or workstations available (powerful processors, advanced graphics cards, sufficient RAM) that can be dedicated to running AR/MR applications (if necessary)?</FormLabel>
                <Controller control={form.control} name="s4_hasHighSpecComputers" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                    {wifiPerformanceOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {(watchS4HasHighSpecComputers === "Yes" || watchS4HasHighSpecComputers === "Partially") && <FormField control={form.control} name="s4_computerDetails" render={({ field }) => (<FormItem><FormLabel>Computer Details Clarification:</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />}

              <FormLabel className="font-semibold block pt-2">3. Current Health Information Systems:</FormLabel>
              <FormField control={form.control} name="s4_mainInformationSystems" render={({ field }) => (<FormItem><FormLabel>a. What are the main information systems currently used in the hospital? (e.g., HIS, EMR/EHR, PACS, LIS, etc.)</FormLabel><FormControl><Textarea rows={3} {...field} placeholder="List systems or select from options if provided" /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="s4_needsIntegration" render={({ field }) => (
                <FormItem><FormLabel>b. Is there a need or desire to integrate AR/MR applications with any of these current systems?</FormLabel>
                <Controller control={form.control} name="s4_needsIntegration" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                    {yesNoMaybeOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {(watchS4NeedsIntegration === "Yes" || watchS4NeedsIntegration === "Maybe in the future") && <FormField control={form.control} name="s4_integrationDetails" render={({ field }) => (<FormItem><FormLabel>Please clarify the nature of the required or envisioned integration (e.g., pulling patient data from EMR for AR display, sending training simulation results to LMS):</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />}

              <FormLabel className="font-semibold block pt-2">4. IT Support Team:</FormLabel>
              <FormField control={form.control} name="s4_itSupportTeam" render={({ field }) => (
                <FormItem><FormLabel>a. Does the hospital have a specialized internal IT support team?</FormLabel>
                <Controller control={form.control} name="s4_itSupportTeam" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col space-y-1">
                    {techTeamOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {watchS4ITSupportTeam === "Other" && <FormField control={form.control} name="s4_itSupportTeamOther" render={({ field }) => (<FormItem><FormLabel>Other Support Team Type Clarification:</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />}

              <FormField control={form.control} name="s4_itTeamExperience" render={({ field }) => (
                <FormItem><FormLabel>b. How experienced is this team (or external entity) in handling new advanced technologies or specialized hardware/software requirements (like those for AR/MR)?</FormLabel>
                <Controller control={form.control} name="s4_itTeamExperience" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col sm:flex-row flex-wrap space-y-1 sm:space-y-0 sm:space-x-3">
                    {experienceLevelOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0 my-1"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />

              <FormField control={form.control} name="s4_itContactPoint" render={({ field }) => (
                <FormItem><FormLabel>c. Is there a specific person/team in the IT department who could be a contact point or responsible for supporting AR/MR projects?</FormLabel>
                <Controller control={form.control} name="s4_itContactPoint" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                    {yesNoLaterOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {watchS4ITContactPoint === "Yes" && <FormField control={form.control} name="s4_itContactName" render={({ field }) => (<FormItem><FormLabel>Name of Responsible Person/Team:</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />}

              <FormLabel className="font-semibold block pt-2">5. Tech Savviness & Readiness for Change of Targeted Medical and Administrative Staff:</FormLabel>
              <FormField control={form.control} name="s4_staffTechSavviness" render={({ field }) => (
                <FormItem><FormLabel>General tech savviness of staff:</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select savviness level" /></SelectTrigger></FormControl> <SelectContent>{experienceLevelOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent> </Select> <FormMessage />
                </FormItem>)} />
              <FormField control={form.control} name="s4_resistanceToChangePlan" render={({ field }) => (<FormItem><FormLabel>Do you anticipate any resistance to change when introducing these new technologies? How do you plan to handle it?</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>

          {/* Section 5: VR/AR in Marketing */}
          <Card>
            <CardHeader><CardTitle>Section 5: Using VR/AR in Marketing and Hospital Promotion (if applicable)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="s5_marketingInterest" render={({ field }) => (
                <FormItem><FormLabel>1. Is there current interest or consideration in using VR or AR models as a means of marketing the hospital or introducing the public to its facilities, capabilities, and services?</FormLabel>
                  <Controller control={form.control} name="s5_marketingInterest" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col space-y-1">
                    {marketingInterestOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {watchS5MarketingInterest === "Other" && <FormField control={form.control} name="s5_marketingInterestOther" render={({ field }) => (<FormItem><FormLabel>Please clarify:</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />}
              {watchS5MarketingInterest && watchS5MarketingInterest !== "No, we are not currently considering it" && (
                <FormField control={form.control} name="s5_marketingGoals" render={({ field }) => (<FormItem><FormLabel>2. If there is an intention (even future) to use VR/AR in marketing or hospital promotion, what are the desired goals or outcomes? Or what are the initial ideas for applications?</FormLabel><FormControl><Textarea rows={3} {...field} placeholder="e.g., interactive virtual tours for potential patients, interactive display of advanced medical services, training materials for new staff..."/></FormControl><FormMessage /></FormItem>)} />
              )}
            </CardContent>
          </Card>

          {/* Section 6: Analysis of Current Departments and Processes */}
          <Card>
            <CardHeader>
              <CardTitle>Section 6: Analysis of Current Departments and Processes</CardTitle>
              <CardDescription>Please repeat answering the following set of questions for each main department in the hospital where you see potential for AR/MR application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {departmentAnalysisFields.map((item, index) => (
                <Card key={item.id} className="p-4 space-y-3 border-border border">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg text-primary">Department Analysis ({index + 1})</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDepartmentAnalysis(index)}><Trash2 className="text-destructive h-5 w-5" /></Button>
                  </div>
                  <FormField control={form.control} name={`s6_departmentAnalyses.${index}.departmentName`} render={({ field }) => (<FormItem><FormLabel>1. Department Name:</FormLabel><FormControl><Input {...field} placeholder="Should be from previously mentioned departments or added new" /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`s6_departmentAnalyses.${index}.mainEquipment`} render={({ field }) => (<FormItem><FormLabel>2. a. What are the main medical or technical devices and equipment currently used extensively in this department? (Please provide specific examples)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`s6_departmentAnalyses.${index}.currentProcedures`} render={({ field }) => (<FormItem><FormLabel>3. b. What are the basic diagnostic, therapeutic, training, or administrative methods and procedures (protocols) currently followed in this department that you see could benefit from development? (Please describe briefly)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name={`s6_departmentAnalyses.${index}.procedureType`} render={({ field }) => (
                    <FormItem><FormLabel>4. c. Are the methods and procedures followed in this department (mentioned in "b"):</FormLabel>
                    <Controller control={form.control} name={`s6_departmentAnalyses.${index}.procedureType`} render={({field: controllerField}) => (
                      <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col space-y-1">
                        {departmentProcedureTypes.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                      </RadioGroup>)} /> <FormMessage />
                    </FormItem>)} />

                  <FormLabel className="font-semibold block pt-2">5. d. What are the most prominent problems, challenges, weaknesses, or limitations you currently face in the methods and procedures followed in this department (whether traditional or modern)?</FormLabel>
                  {form.watch(`s6_departmentAnalyses.${index}.procedureType`) === departmentProcedureTypes[0] &&
                    <FormField control={form.control} name={`s6_departmentAnalyses.${index}.traditionalProblems`} render={({ field }) => (<FormItem><FormLabel>If traditional, what are its problems? (e.g., difficulty in standardization, reliance on individual experience, time-consuming, potential for human error)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  }
                  {form.watch(`s6_departmentAnalyses.${index}.procedureType`) === departmentProcedureTypes[1] &&
                    <FormField control={form.control} name={`s6_departmentAnalyses.${index}.modernProblems`} render={({ field }) => (<FormItem><FormLabel>If modern, what are its problems? (e.g., cost of devices, complexity of operation, need for intensive training, difficulty integrating with other systems)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  }
                   <FormField control={form.control} name={`s6_departmentAnalyses.${index}.generalProblems`} render={({ field }) => (<FormItem><FormLabel>General problems facing the department in its operations:</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />

                  <FormLabel className="font-semibold block pt-2">6. e. Do you see any potential opportunities or specific areas within this department where VR, AR, or MR technologies could directly contribute to: (Please clarify with practical examples for each point you select)</FormLabel>
                    {departmentOpportunities.map(opp => (
                        <div key={opp.id} className="space-y-2 my-2 p-3 border rounded-md bg-muted/30">
                        <FormField
                            control={form.control}
                            name={`s6_departmentAnalyses.${index}.opportunities.${opp.id}` as any}
                            render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">{opp.label}</FormLabel>
                            </FormItem>
                            )}
                        />
                        {form.watch(`s6_departmentAnalyses.${index}.opportunities.${opp.id}` as any) && opp.otherSpecifyField && (
                             <FormField control={form.control} name={`s6_departmentAnalyses.${index}.opportunities.${opp.otherSpecifyField}` as any} render={({ field }) => (<FormItem className="mt-2"><FormLabel className="text-sm">Please specify other area:</FormLabel><FormControl><Input {...field} className="mt-1" /></FormControl><FormMessage /></FormItem>)} />
                        )}
                        {form.watch(`s6_departmentAnalyses.${index}.opportunities.${opp.id}` as any) && opp.fieldName && (
                             <FormField control={form.control} name={`s6_departmentAnalyses.${index}.opportunities.${opp.fieldName}` as any} render={({ field }) => (<FormItem className="mt-2"><FormLabel className="text-sm">Clarification for "{opp.label}":</FormLabel><FormControl><Textarea rows={2} {...field} className="mt-1" /></FormControl><FormMessage /></FormItem>)} />
                        )}
                        </div>
                    ))}
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={() => appendDepartmentAnalysis({ departmentName: "", mainEquipment: "", currentProcedures: "", procedureType: undefined, traditionalProblems: "", modernProblems: "", generalProblems: "", opportunities: {} })}> <PlusCircle className="mr-2 h-4 w-4" /> Add New Department Analysis</Button>
            </CardContent>
          </Card>

          {/* Section 7: Budget and Expected Timeline */}
          <Card>
            <CardHeader><CardTitle>Section 7: Budget and Expected Timeline (for the project as a whole or the first phase)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="s7_hasInitialBudget" render={({ field }) => (
                <FormItem><FormLabel>1. Has an initial or estimated budget been allocated for development projects based on AR/MR technologies in the hospital?</FormLabel>
                <Controller control={form.control} name="s7_hasInitialBudget" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col space-y-1">
                    {budgetAllocationOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              <FormField control={form.control} name="s7_budgetRange" render={({ field }) => (<FormItem><FormLabel>2. Approximate budget range (optional, helps guide solutions):</FormLabel><FormControl><Input {...field} placeholder="e.g., $50,000 - $100,000" /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="s7_expectedTimeline" render={({ field }) => (
                <FormItem><FormLabel>3. What is the expected or desired timeline to start the first pilot project or initial implementation phase of AR/MR technologies?</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger></FormControl> <SelectContent>{timelineOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent> </Select> <FormMessage />
                </FormItem>)} />
              <FormField control={form.control} name="s7_hasCriticalDeadlines" render={({ field }) => (
                <FormItem><FormLabel>4. Are there any critical internal or external deadlines related to this project or the need to find solutions to the mentioned challenges?</FormLabel>
                <Controller control={form.control} name="s7_hasCriticalDeadlines" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-row space-x-3">
                    {yesNoOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {watchS7HasCriticalDeadlines === "Yes" && <FormField control={form.control} name="s7_deadlineDetails" render={({ field }) => (<FormItem><FormLabel>Please clarify:</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />}
            </CardContent>
          </Card>

          {/* Section 8: Other Concerns and Considerations */}
          <Card>
            <CardHeader><CardTitle>Section 8: Other Concerns and Considerations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="s8_dataSecurityConcerns" render={({ field }) => (
                <FormItem><FormLabel>1. Are there any specific concerns related to data security and patient confidentiality when considering these technologies?</FormLabel>
                <Controller control={form.control} name="s8_dataSecurityConcerns" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-row space-x-3">
                    {yesNoOptions.map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {watchS8DataSecurityConcerns === "Yes" && <FormField control={form.control} name="s8_securityConcernDetails" render={({ field }) => (<FormItem><FormLabel>Please describe these concerns in detail:</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />}
              <FormField control={form.control} name="s8_regulatoryRequirements" render={({ field }) => (
                <FormItem><FormLabel>2. Are there any local or international regulatory, legal, or accreditation requirements that proposed AR/MR solutions must comply with in the healthcare sector in your country or specifically in your specialty?</FormLabel>
                <Controller control={form.control} name="s8_regulatoryRequirements" render={({field: controllerField}) => (
                  <RadioGroup onValueChange={controllerField.onChange} value={controllerField.value} defaultValue={controllerField.value} className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-3">
                    {["Yes", "No", "Not sure"].map(opt => (<FormItem key={opt} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={opt} /></FormControl><FormLabel className="font-normal">{opt}</FormLabel></FormItem>))}
                  </RadioGroup>)} /> <FormMessage />
                </FormItem>)} />
              {(watchS8RegulatoryRequirements === "Yes" || watchS8RegulatoryRequirements === "Not sure") && <FormField control={form.control} name="s8_regulatoryDetails" render={({ field }) => (<FormItem><FormLabel>Please state what you know or what you need to verify:</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />}
              <FormField control={form.control} name="s8_otherInnovationProjects" render={({ field }) => (<FormItem><FormLabel>3. Are there any other ongoing or planned technological innovation or digital transformation projects in the hospital that could integrate with or benefit from AR/MR projects? (e.g., patient app development, AI in diagnosis, etc.)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="s8_keyStakeholders" render={({ field }) => (<FormItem><FormLabel>4. Who are the key stakeholders within the hospital who should be involved in the decision-making process regarding the adoption of these technologies? (e.g., hospital management, department heads, doctors, IT team, quality department, etc.)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
          </Card>

          {/* Section 9: Additional Questions and Closing */}
          <Card>
            <CardHeader><CardTitle>Section 9: Additional Questions and Closing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="s9_questionsForYura" render={({ field }) => (<FormItem><FormLabel>1. Are there any specific questions you would like to ask our team at this stage?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="s9_additionalInfo" render={({ field }) => (<FormItem><FormLabel>2. Is there any additional information, suggestions, or points not covered in this form that you would like to share with us regarding your vision for integrating AR/MR technologies in the hospital?</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="s9_communicationPreferences" render={() => (
                <FormItem>
                  <FormLabel>3. How would you prefer to be contacted to discuss the results of this assessment and the next steps?</FormLabel>
                  {communicationPreferenceOptions.map((item) => (
                    <FormField key={item} control={form.control} name="s9_communicationPreferences" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 my-2">
                        <FormControl>
                           <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== item
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{item}</FormLabel>
                      </FormItem>
                    )} />
                  ))}
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="s9_preferredContactTimes" render={({ field }) => (<FormItem><FormLabel>Preferred contact times (optional):</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
             <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        if (draftStorageKey) localStorage.removeItem(draftStorageKey);
                        form.reset();
                        toast({ title: "Form Cleared", description: "All fields have been reset."});
                    }}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                >
                    <Undo2 className="mr-2 h-4 w-4" /> Clear Form & Delete Draft
                </Button>
                <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {submitButtonText}
                </Button>
             </CardFooter>
          </Card>
           {!isEditMode && (
            <p className="text-xs text-muted-foreground text-center">
                Note: Your progress is automatically saved as a draft in your browser. This draft will be cleared upon successful submission or if you use the "Clear Form & Delete Draft" button.
            </p>
           )}
        </form>
      </Form>
    </div>
  );
}
