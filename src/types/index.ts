
export type UserRole = "hospital" | "professional" | "provider" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string; // URL to avatar image
  hospitalId?: string; 
  providerId?: string; // Added for provider users
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  datePosted: string; // ISO date string
  type: "Full-time" | "Part-time" | "Contract" | "Internship" | "Training";
  companyLogo?: string; // URL to company logo
  dataAiHint?: string; // For image generation hint for the logo
  postedByAdmin?: boolean; // Added to identify admin-posted jobs
}

export interface Assessment { // This is the Admin's view/management model for assessments
  id: string;
  hospitalId: string;
  hospitalName: string;
  submissionDate: string; // ISO date string
  status: "Pending" | "Reviewed" | "Completed";
  vrNeeds?: string;
  mrNeeds?: string;
  arNeeds?: string;
  budget?: string;
  currentTech?: string;
  goals?: string;
  aiSummary?: string; 
  aiSolutions?: { 
    suggestedSolutions: string;
    reasoning: string;
  };
  adminNotes?: string; // Notes from admin review
}

// For the detailed form schema
import type { z } from "zod";
import type { FullAssessmentSchema } from "@/lib/schemas";
export type FullAssessmentSchemaValues = z.infer<typeof FullAssessmentSchema>;

export interface UserSubmittedAssessment { // Hospital user's submitted assessment
  id: string;
  hospitalId: string;
  hospitalName: string; // Store for quick display
  submissionDate: string;
  status: "Submitted" | "In Review" | "Responded" | "Completed"; // More granular for hospital view
  primaryGoalsSummary?: string; // For quick display
  formData: FullAssessmentSchemaValues; // The full submission
  aiSummary?: string;
  aiSolutions?: {
    suggestedSolutions: string;
    reasoning: string;
  };
  adminResponseText?: string; // Text response from admin
  adminResponsePdfName?: string; // Filename of PDF response from admin
}


export interface CvSubmission {
  id: string;
  jobId: string;
  professionalId: string;
  cvFileUrl: string; // URL to the uploaded CV file
  submissionDate: string; // ISO date string
  status: "Submitted" | "Viewed" | "Shortlisted" | "Rejected";
}

// Smart Matching AI Output Types (placeholders based on existing AI flows)
export interface SuggestedSolution {
  name: string;
  description: string;
  suitabilityScore: number; // 0-1
}

export interface MatchedSolutionResult {
  assessmentId: string;
  suggestedSolutions: SuggestedSolution[];
  reasoning: string;
}

export interface RecommendedJobResult {
  professionalId: string;
  recommendedJobs: Pick<JobPosting, "id" | "title" | "company">[];
}

export interface ProviderService {
  id: string;
  providerId: string;
  name: string;
  description: string;
  category: "VR Development" | "AR Content Creation" | "MR Consultation" | "XR Training Solutions" | "Hardware Provision" | "Platform Services" | "Other";
  pricingModel: "Project-based" | "Hourly Rate" | "Subscription" | "Custom Quote";
  tags?: string[]; // Optional tags for better searchability
  imageUrl?: string; // Optional image for the service
  dataAiHint?: string;
}
