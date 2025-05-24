import { AssessmentForm } from "@/components/forms/AssessmentForm";

export default function AssessmentPage() {
  // This page should be accessible only to 'hospital' role users.
  // Add role check from useAuth if needed, though AppLayout might handle redirects.
  return (
    <div>
      <AssessmentForm />
    </div>
  );
}
