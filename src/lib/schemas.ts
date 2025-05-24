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

export const AssessmentSchema = z.object({
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
