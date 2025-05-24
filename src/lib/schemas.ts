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

// This is the old, simpler schema. We'll keep it for now if other parts of the app use it,
// but the new form will use FullAssessmentSchema.
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
  "عام",
  "خاص",
  "جامعي",
  "عسكري",
  "خيري",
  "أخرى",
]);

const YesNoEnum = z.enum(["نعم", "لا"]);
const YesNoMaybeEnum = z.enum(["نعم", "لا", "ربما مستقبلاً", "غير متأكد"]);
const YesNoWorkingOnItEnum = z.enum([
  "نعم، لدينا مؤشرات واضحة",
  "نعمل على تحديدها",
  "لا، لم نقم بتحديدها بعد ونحتاج مساعدة في ذلك",
]);
const WifiPerformanceEnum = z.enum([
  "نعم",
  "لا",
  "جزئيًا",
  "غير متأكد",
]);
const TechTeamEnum = z.enum([
  "نعم، فريق داخلي كامل",
  "نعم، فريق داخلي محدود",
  "لا، نعتمد على دعم خارجي",
  "أخرى",
]);
const ExperienceLevelEnum = z.enum([
  "منخفضة جدًا",
  "منخفضة",
  "متوسطة",
  "عالية",
  "عالية جدًا",
  "غير متأكد",
]);
const YesNoLaterEnum = z.enum(["نعم", "لا", "سيتم تحديده لاحقًا"]);
const MarketingInterestEnum = z.enum([
  "نعم، نفكر في ذلك بجدية ونعتبره أولوية",
  "نعم، نفكر في ذلك ولكن ليس أولوية قصوى حاليًا",
  "ربما، الفكرة مطروحة ولكن لم يتم دراستها بعمق",
  "لا، لم نفكر في ذلك حاليًا",
  "أخرى",
]);
const DepartmentProcedureTypeEnum = z.enum([
  "تقليدية في الغالب وتعتمد على مهارات وخبرات بشرية بشكل كبير",
  "حديثة وتعتمد على تقنيات وأجهزة متطورة بشكل كبير",
  "مزيج متوازن من الطرق التقليدية والحديثة",
]);

const BudgetAllocationEnum = z.enum([
  "نعم، تم تخصيص ميزانية محددة",
  "نعم، هناك ميزانية تقديرية ولكنها مرنة",
  "لا، لم يتم تخصيص ميزانية بعد، ولكننا في مرحلة دراسة التكاليف",
  "لا، ونحتاج إلى تقديرات تكلفة بناءً على التوصيات",
]);

const TimelineEnum = z.enum([
  "خلال 3 أشهر القادمة",
  "خلال 3-6 أشهر",
  "خلال 6-12 شهرًا",
  "خلال العام القادم",
  "غير محدد بعد/يعتمد على نتائج التقييم",
]);

const CommunicationPreferenceEnum = z.enum([
  "عبر البريد الإلكتروني المسجل",
  "عبر مكالمة هاتفية",
  "تحديد موعد لاجتماع عبر الإنترنت",
  "تحديد موعد لاجتماع حضوري (إذا أمكن)",
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
  departmentName: z.string().min(1, "اسم القسم مطلوب"),
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
  s1_hospitalName: z.string().min(1, "اسم المستشفى مطلوب"),
  s1_hospitalType: HospitalTypeEnum.refine(val => val !== undefined, { message: "نوع المستشفى مطلوب" }),
  s1_hospitalTypeOther: z.string().optional(),
  s1_location: z.string().min(1, "الموقع مطلوب"),
  s1_bedCount: z.union([z.string().min(1, "عدد الأسرة التقريبي مطلوب"), z.number().min(1, "عدد الأسرة التقريبي مطلوب")]),
  s1_concernedDepartments: z.array(z.string()).min(1, "يجب اختيار قسم واحد على الأقل"),
  s1_concernedDepartmentsOther: z.string().optional(),
  s1_contactName: z.string().min(1, "اسم مسؤول التواصل مطلوب"),
  s1_contactPosition: z.string().min(1, "منصب مسؤول التواصل مطلوب"),
  s1_contactEmail: z.string().email("بريد إلكتروني غير صالح"),
  s1_contactPhone: z.string().min(1, "رقم هاتف العمل مطلوب"),
  s1_hasClearVision: z.enum([
    "نعم، لدينا تصور واضح ومحدد",
    "لا، ولكننا مهتمون باستكشاف الإمكانيات بشكل عام في قسم/أقسام معينة",
    "لا، ونرغب في استكشاف عام للإمكانيات في المستشفى ككل",
  ]).refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s1_visionDetails: z.string().optional(),
  s1_explorePriorityDepartments: z.string().optional(),

  // Section 2: Previous Experiences
  s2_hasPreviousExperience: YesNoEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s2_experiences: z.array(PreviousExperienceSchema).optional(),

  // Section 3: Goals and Current Challenges
  s3_mainGoals: z.array(z.string()).min(1, "يجب اختيار هدف واحد على الأقل"),
  s3_mainGoalsOther: z.string().optional(),
  s3_currentChallenges: z.string().min(1, "وصف التحديات مطلوب"),
  s3_hasKPIs: YesNoWorkingOnItEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s3_kpiDetails: z.string().optional(),

  // Section 4: Technical Infrastructure and Current Resources
  s4_wifiPerformance: WifiPerformanceEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s4_wifiDetails: z.string().optional(),
  s4_bandwidthConstraints: WifiPerformanceEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }), // Re-using WifiPerformanceEnum as it's Yes/No/Unsure
  s4_bandwidthDetails: z.string().optional(),
  s4_networkSecurityPolicies: WifiPerformanceEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }), // Re-using
  s4_networkSecurityDetails: z.string().optional(),
  s4_hasSpecializedEquipment: YesNoEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s4_equipmentDetails: z.string().optional(),
  s4_hasHighSpecComputers: WifiPerformanceEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }), // Re-using
  s4_computerDetails: z.string().optional(),
  s4_mainInformationSystems: z.string().optional(), // Could be an array of strings if made multi-select
  s4_mainInformationSystemsOther: z.string().optional(),
  s4_needsIntegration: YesNoMaybeEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s4_integrationDetails: z.string().optional(),
  s4_itSupportTeam: TechTeamEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s4_itSupportTeamOther: z.string().optional(),
  s4_itTeamExperience: ExperienceLevelEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s4_itContactPoint: YesNoLaterEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s4_itContactName: z.string().optional(),
  s4_staffTechSavviness: ExperienceLevelEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s4_resistanceToChangePlan: z.string().optional(),

  // Section 5: VR/AR in Marketing
  s5_marketingInterest: MarketingInterestEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s5_marketingInterestOther: z.string().optional(),
  s5_marketingGoals: z.string().optional(),

  // Section 6: Department and Process Analysis
  s6_departmentAnalyses: z.array(DepartmentAnalysisSchema).optional(),

  // Section 7: Budget and Timeline
  s7_hasInitialBudget: BudgetAllocationEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s7_budgetRange: z.string().optional(), // Could be a select or text
  s7_expectedTimeline: TimelineEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s7_hasCriticalDeadlines: YesNoEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s7_deadlineDetails: z.string().optional(),

  // Section 8: Other Concerns and Considerations
  s8_dataSecurityConcerns: YesNoEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }),
  s8_securityConcernDetails: z.string().optional(),
  s8_regulatoryRequirements: WifiPerformanceEnum.refine(val => val !== undefined, { message: "هذا الحقل مطلوب" }), // Yes/No/Unsure
  s8_regulatoryDetails: z.string().optional(),
  s8_otherInnovationProjects: z.string().optional(),
  s8_keyStakeholders: z.string().optional(),

  // Section 9: Additional Questions and Closing
  s9_questionsForYura: z.string().optional(),
  s9_additionalInfo: z.string().optional(),
  s9_communicationPreferences: z.array(CommunicationPreferenceEnum).min(1,"يجب اختيار تفضيل واحد على الأقل"),
  s9_preferredContactTimes: z.string().optional(),

}).superRefine((data, ctx) => {
  if (data.s1_hospitalType === "أخرى" && !data.s1_hospitalTypeOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "يرجى تحديد نوع المستشفى الآخر",
      path: ["s1_hospitalTypeOther"],
    });
  }
  if (data.s1_concernedDepartments.includes("أخرى") && !data.s1_concernedDepartmentsOther) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "يرجى تحديد القسم الآخر",
      path: ["s1_concernedDepartmentsOther"],
    });
  }
  if (data.s1_hasClearVision === "نعم، لدينا تصور واضح ومحدد" && !data.s1_visionDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "يرجى وصف التطبيق المقترح",
      path: ["s1_visionDetails"],
    });
  }
  if (data.s1_hasClearVision === "لا، ولكننا مهتمون باستكشاف الإمكانيات بشكل عام في قسم/أقسام معينة" && !data.s1_explorePriorityDepartments) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "يرجى تحديد الأقسام ذات الأولوية",
      path: ["s1_explorePriorityDepartments"],
    });
  }
   if (data.s2_hasPreviousExperience === "نعم" && (!data.s2_experiences || data.s2_experiences.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "يرجى إضافة تفاصيل تجربة واحدة على الأقل",
      path: ["s2_experiences"],
    });
  }
  if (data.s2_experiences) {
    data.s2_experiences.forEach((exp, index) => {
      if (exp.stillInUse === "لا" && !exp.stillInUseReason) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "يرجى توضيح سبب عدم الاستخدام",
          path: [`s2_experiences`, index, "stillInUseReason"],
        });
      }
    });
  }
   if (data.s3_mainGoals.includes("أخرى") && !data.s3_mainGoalsOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "يرجى تحديد الهدف الآخر",
      path: ["s3_mainGoalsOther"],
    });
  }
  if ((data.s3_hasKPIs === "نعم، لدينا مؤشرات واضحة" || data.s3_hasKPIs === "نعمل على تحديدها") && !data.s3_kpiDetails) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "يرجى ذكر أهم المؤشرات",
      path: ["s3_kpiDetails"],
    });
  }
  // Add more superRefine for other conditional fields as needed
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
