
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const SignupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["hospital", "professional", "provider", "admin"], {
    required_error: "You need to select a role.",
  }),
});

export const SimpleAssessmentSchema = z.object({
  hospitalName: z.string().min(3, "Hospital name is required."),
  vrNeeds: z.string().optional(),
  mrNeeds: z.string().optional(),
  arNeeds: z.string().optional(),
  budget: z.enum(["< $10k", "$10k - $50k", "$50k - $200k", "> $200k", "Flexible"], {
    required_error: "Please select a budget range.",
  }),
  currentTech: z.string().optional(),
  goals: z.string().min(10, "Please describe your goals (min 10 characters)."),
});


const HospitalTypeEnum = z.enum([
  "Public",
  "Private",
  "University",
  "Military",
  "Charity",
  "Other",
]);

const YesNoEnum = z.enum(["Yes", "No"]);
const YesNoMaybeEnum = z.enum(["Yes", "No", "Maybe in the future", "Not sure"]);
const YesNoWorkingOnItEnum = z.enum([
  "Yes, we have clear indicators",
  "We are working on defining them",
  "No, we haven't defined them yet and need help with that",
]);
const WifiPerformanceEnum = z.enum([
  "Yes",
  "No",
  "Partially",
  "Not sure",
]);
const TechTeamEnum = z.enum([
  "Yes, full internal team",
  "Yes, limited internal team",
  "No, we rely on external support",
  "Other",
]);
const ExperienceLevelEnum = z.enum([
  "Very Low",
  "Low",
  "Medium",
  "High",
  "Very High",
  "Not sure",
]);
const YesNoLaterEnum = z.enum(["Yes", "No", "Will be determined later"]);
const MarketingInterestEnum = z.enum([
  "Yes, we are seriously considering it and consider it a priority",
  "Yes, we are considering it but it is not a top priority currently",
  "Maybe, the idea is on the table but has not been studied in depth",
  "No, we are not currently considering it",
  "Other",
]);
const DepartmentProcedureTypeEnum = z.enum([
  "Mostly traditional and heavily reliant on human skills and experience",
  "Modern and heavily reliant on advanced technologies and devices",
  "A balanced mix of traditional and modern methods",
]);

const BudgetAllocationEnum = z.enum([
  "Yes, a specific budget has been allocated",
  "Yes, there is an estimated budget but it is flexible",
  "No, a budget has not been allocated yet, but we are in the cost study phase",
  "No, and we need cost estimates based on recommendations",
]);

const TimelineEnum = z.enum([
  "Within the next 3 months",
  "Within 3-6 months",
  "Within 6-12 months",
  "Within the next year",
  "Not yet determined/depends on assessment results",
]);

const CommunicationPreferenceEnum = z.enum([
  "Via registered email",
  "Via phone call",
  "Schedule an online meeting",
  "Schedule an in-person meeting (if possible)",
]);

const PreviousExperienceSchema = z.object({
  companyName: z.string().optional(),
  productDescription: z.string().optional(),
  positives: z.string().optional(),
  negatives: z.string().optional(),
  stillInUse: YesNoEnum.optional(),
  stillInUseReason: z.string().optional(),
});

const DepartmentAnalysisSchema = z.object({
  departmentName: z.string().min(1, "Department name is required"),
  mainEquipment: z.string().optional(),
  currentProcedures: z.string().optional(),
  procedureType: DepartmentProcedureTypeEnum.optional(),
  traditionalProblems: z.string().optional(),
  modernProblems: z.string().optional(),
  generalProblems: z.string().optional(),
  opportunities: z.object({
    improveAccuracy: z.boolean().optional(),
    improveAccuracyDetails: z.string().optional(),
    reduceTime: z.boolean().optional(),
    reduceTimeDetails: z.string().optional(),
    enhanceSafety: z.boolean().optional(),
    enhanceSafetyDetails: z.string().optional(),
    improveTraining: z.boolean().optional(),
    improveTrainingDetails: z.string().optional(),
    facilitatePlanning: z.boolean().optional(),
    facilitatePlanningDetails: z.string().optional(),
    improveCommunication: z.boolean().optional(),
    improveCommunicationDetails: z.string().optional(),
    improvePatientExperience: z.boolean().optional(),
    improvePatientExperienceDetails: z.string().optional(),
    reduceResourceDependency: z.boolean().optional(),
    reduceResourceDependencyDetails: z.string().optional(),
    other: z.boolean().optional(),
    otherField: z.string().optional(),
    otherDetails: z.string().optional(),
  }).optional(),
});


export const FullAssessmentSchema = z.object({
  // Section 1: General Information
  s1_hospitalName: z.string().min(1, "Hospital name is required"),
  s1_hospitalType: HospitalTypeEnum.refine(val => val !== undefined, { message: "Hospital type is required" }),
  s1_hospitalTypeOther: z.string().optional(),
  s1_location: z.string().min(1, "Location is required"),
  s1_bedCount: z.union([z.string().min(1, "Approximate bed count is required"), z.number().min(1, "Approximate bed count is required")]),
  s1_concernedDepartments: z.array(z.string()).min(1, "At least one department must be selected"),
  s1_concernedDepartmentsOther: z.string().optional(),
  s1_contactName: z.string().min(1, "Contact person's name is required"),
  s1_contactPosition: z.string().min(1, "Contact person's position is required"),
  s1_contactEmail: z.string().email("Invalid email address"),
  s1_contactPhone: z.string().min(1, "Work phone number is required"),
  s1_hasClearVision: z.enum([
    "Yes, we have a clear and specific vision.",
    "No, but we are interested in exploring possibilities generally in specific department(s).",
    "No, and we want to generally explore possibilities in the hospital as a whole.",
  ]).refine(val => val !== undefined, { message: "This field is required" }),
  s1_visionDetails: z.string().optional(),
  s1_explorePriorityDepartments: z.string().optional(),

  // Section 2: Previous Experiences
  s2_hasPreviousExperience: YesNoEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s2_experiences: z.array(PreviousExperienceSchema).optional(),

  // Section 3: Goals and Current Challenges
  s3_mainGoals: z.array(z.string()).min(1, "At least one main goal must be selected"),
  s3_mainGoalsOther: z.string().optional(),
  s3_currentChallenges: z.string().min(1, "Description of current challenges is required"),
  s3_hasKPIs: YesNoWorkingOnItEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s3_kpiDetails: z.string().optional(),

  // Section 4: Technical Infrastructure and Current Resources
  s4_wifiPerformance: WifiPerformanceEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s4_wifiDetails: z.string().optional(),
  s4_bandwidthConstraints: WifiPerformanceEnum.refine(val => val !== undefined, { message: "This field is required" }), 
  s4_bandwidthDetails: z.string().optional(),
  s4_networkSecurityPolicies: WifiPerformanceEnum.refine(val => val !== undefined, { message: "This field is required" }), 
  s4_networkSecurityDetails: z.string().optional(),
  s4_hasSpecializedEquipment: YesNoEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s4_equipmentDetails: z.string().optional(),
  s4_hasHighSpecComputers: WifiPerformanceEnum.refine(val => val !== undefined, { message: "This field is required" }), 
  s4_computerDetails: z.string().optional(),
  s4_mainInformationSystems: z.string().optional(), 
  s4_mainInformationSystemsOther: z.string().optional(),
  s4_needsIntegration: YesNoMaybeEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s4_integrationDetails: z.string().optional(),
  s4_itSupportTeam: TechTeamEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s4_itSupportTeamOther: z.string().optional(),
  s4_itTeamExperience: ExperienceLevelEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s4_itContactPoint: YesNoLaterEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s4_itContactName: z.string().optional(),
  s4_staffTechSavviness: ExperienceLevelEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s4_resistanceToChangePlan: z.string().optional(),

  // Section 5: VR/AR in Marketing
  s5_marketingInterest: MarketingInterestEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s5_marketingInterestOther: z.string().optional(),
  s5_marketingGoals: z.string().optional(),

  // Section 6: Department and Process Analysis
  s6_departmentAnalyses: z.array(DepartmentAnalysisSchema).optional(),

  // Section 7: Budget and Timeline
  s7_hasInitialBudget: BudgetAllocationEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s7_budgetRange: z.string().optional(), 
  s7_expectedTimeline: TimelineEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s7_hasCriticalDeadlines: YesNoEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s7_deadlineDetails: z.string().optional(),

  // Section 8: Other Concerns and Considerations
  s8_dataSecurityConcerns: YesNoEnum.refine(val => val !== undefined, { message: "This field is required" }),
  s8_securityConcernDetails: z.string().optional(),
  s8_regulatoryRequirements: WifiPerformanceEnum.refine(val => val !== undefined, { message: "This field is required" }), // Yes/No/Unsure
  s8_regulatoryDetails: z.string().optional(),
  s8_otherInnovationProjects: z.string().optional(),
  s8_keyStakeholders: z.string().optional(),

  // Section 9: Additional Questions and Closing
  s9_questionsForYura: z.string().optional(),
  s9_additionalInfo: z.string().optional(),
  s9_communicationPreferences: z.array(CommunicationPreferenceEnum).min(1,"At least one communication preference must be selected"),
  s9_preferredContactTimes: z.string().optional(),

}).superRefine((data, ctx) => {
  if (data.s1_hospitalType === "Other" && !data.s1_hospitalTypeOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the other hospital type",
      path: ["s1_hospitalTypeOther"],
    });
  }
  if (data.s1_concernedDepartments.includes("Other (Please specify)") && !data.s1_concernedDepartmentsOther) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the other department",
      path: ["s1_concernedDepartmentsOther"],
    });
  }
  if (data.s1_hasClearVision === "Yes, we have a clear and specific vision." && !data.s1_visionDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please describe the proposed application/project",
      path: ["s1_visionDetails"],
    });
  }
  if (data.s1_hasClearVision === "No, but we are interested in exploring possibilities generally in specific department(s)." && !data.s1_explorePriorityDepartments) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the priority departments for exploration",
      path: ["s1_explorePriorityDepartments"],
    });
  }
   if (data.s2_hasPreviousExperience === "Yes" && (!data.s2_experiences || data.s2_experiences.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please add details of at least one previous experience",
      path: ["s2_experiences"],
    });
  }
  if (data.s2_experiences) {
    data.s2_experiences.forEach((exp, index) => {
      if (exp.stillInUse === "No" && !exp.stillInUseReason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please explain why it is no longer in use",
          path: [`s2_experiences`, index, "stillInUseReason"],
        });
      }
    });
  }
   if (data.s3_mainGoals.includes("Other (Please specify)") && !data.s3_mainGoalsOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the other main goal",
      path: ["s3_mainGoalsOther"],
    });
  }
  if ((data.s3_hasKPIs === "Yes, we have clear indicators" || data.s3_hasKPIs === "We are working on defining them") && !data.s3_kpiDetails) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please mention the most important KPIs",
      path: ["s3_kpiDetails"],
    });
  }
  if (data.s4_itSupportTeam === "Other" && !data.s4_itSupportTeamOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the other IT support team type",
      path: ["s4_itSupportTeamOther"],
    });
  }
  if (data.s4_itContactPoint === "Yes" && !data.s4_itContactName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide the name of the IT contact person/team",
      path: ["s4_itContactName"],
    });
  }
  if (data.s5_marketingInterest === "Other" && !data.s5_marketingInterestOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the other marketing interest",
      path: ["s5_marketingInterestOther"],
    });
  }
  if (data.s6_departmentAnalyses) {
    data.s6_departmentAnalyses.forEach((dept, index) => {
      if (dept.opportunities?.other && !dept.opportunities.otherField) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please specify the other opportunity area.",
          path: [`s6_departmentAnalyses`, index, "opportunities", "otherField"],
        });
      }
    });
  }
  if (data.s7_hasCriticalDeadlines === "Yes" && !data.s7_deadlineDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please provide details about critical deadlines",
      path: ["s7_deadlineDetails"],
    });
  }
  if (data.s8_dataSecurityConcerns === "Yes" && !data.s8_securityConcernDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please describe data security concerns",
      path: ["s8_securityConcernDetails"],
    });
  }
   if ((data.s8_regulatoryRequirements === "Yes" || data.s8_regulatoryRequirements === "Not sure") && !data.s8_regulatoryDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify known regulatory requirements or areas to verify",
      path: ["s8_regulatoryDetails"],
    });
  }
});


export const CvUploadSchema = z.object({
  cvFile: z
    .custom<FileList>()
    .refine((files) => files && files.length > 0, "CV file is required.")
    .refine(
      (files) => files && files[0]?.size <= 5 * 1024 * 1024, // 5MB limit
      `File size should be less than 5MB.`
    )
    .refine(
      (files) =>
        files &&
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(files[0]?.type),
      ".pdf, .doc, .docx files are accepted."
    ),
  coverLetter: z.string().optional(),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  avatar: z.string().url({ message: "Please enter a valid URL for your avatar, or leave empty for default." }).optional().or(z.literal("")),
});

export const CreateJobPostingSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  company: z.string().min(2, { message: "Company name must be at least 2 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  type: z.enum(["Full-time", "Part-time", "Contract", "Internship", "Training"], {
    required_error: "You need to select an opportunity type.",
  }),
  companyLogo: z.string().url({ message: "Please enter a valid URL for the company logo." }).optional().or(z.literal("")),
});
    
