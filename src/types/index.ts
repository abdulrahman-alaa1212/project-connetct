
export type UserRole = "hospital" | "professional" | "provider" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string; // URL to avatar image
  hospitalId?: string; // Added for hospital users
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
  postedByAdmin?: boolean; // Added to identify admin-posted jobs
}

export interface Assessment {
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
  aiSummary?: string; // Added to store AI summary
  aiSolutions?: { // Added to store AI solutions
    suggestedSolutions: string;
    reasoning: string;
  };
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
