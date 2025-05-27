
# Project Structure Documentation for Yura Connect

This document outlines the directory and file structure of the Yura Connect project.

## Root Level Files

*   `package.json`: Lists project dependencies, scripts (dev, build, start, lint, etc.).
*   `next.config.ts`: Configuration for the Next.js framework.
*   `tailwind.config.ts`: Configuration for Tailwind CSS, including custom theme variables.
*   `tsconfig.json`: TypeScript compiler options and project settings.
*   `components.json`: Configuration for ShadCN UI, defining component paths, styling, etc.
*   `apphosting.yaml`: Configuration for Firebase App Hosting.
*   `README.md`: Main project overview and entry point for documentation.
*   `.env`: For environment variables (currently empty or for local Genkit keys).
*   `.vscode/settings.json`: VS Code specific settings for the project.

## `src/` Directory

This is the main directory containing the application's source code.

### `src/app/`
This directory uses the Next.js App Router for defining routes, pages, and layouts.

*   **Root Files:**
    *   `layout.tsx`: The root layout for the entire application. Includes global styles, font setup, `AuthProvider`, and `Toaster`.
    *   `page.tsx`: The main landing page component for unauthenticated users.
    *   `globals.css`: Global stylesheets, Tailwind CSS base, components, utilities, and theme variable definitions.
*   **Route Groups:**
    *   `(app)/`: This group contains all routes and layouts for authenticated users.
        *   `layout.tsx`: Specific layout for the authenticated part of the application, including the `AppSidebar`.
        *   `dashboard/page.tsx`: Dashboard page, content varies by user role.
        *   `assessment/page.tsx`: Page for hospitals to submit their technology needs assessment.
        *   `my-assessments/page.tsx`: Page for hospitals to view their submitted assessments.
        *   `jobs/page.tsx`: Job board page. For professionals to browse/apply; for admins to post/manage.
        *   `my-cv/page.tsx`: Page for professionals to manage their CV.
        *   `my-applications/page.tsx`: Page for professionals to track their job applications.
        *   `services/page.tsx`: Page for service providers to manage their offered services.
        *   `provider/matches/page.tsx`: Placeholder page for providers to view matched hospital needs.
        *   `admin/reports/page.tsx`: Page for admins to manage hospital assessment submissions.
        *   `admin/reports/[assessmentId]/review/page.tsx`: Dynamic route for admins to review a specific assessment.
        *   `admin/users/page.tsx`: Page for admins to manage platform users.
        *   `settings/page.tsx`: Page for all authenticated users to manage their profile settings.
        *   `solutions/page.tsx`: Placeholder page for hospitals to view AI-matched solutions (linked from dashboard).
    *   `(auth)/`: This group contains routes and layouts for authentication pages.
        *   `layout.tsx`: Specific layout for authentication pages (login, signup).
        *   `login/page.tsx`: Login page.
        *   `signup/page.tsx`: Signup page.

### `src/components/`
This directory houses all reusable React components, organized by feature or type.

*   `auth/`: Components related to authentication (e.g., `LoginForm.tsx`, `SignupForm.tsx`).
*   `forms/`: Complex form components (e.g., `AssessmentForm.tsx`).
*   `jobs/`: Components related to job postings and applications (e.g., `JobCard.tsx`, `CvUploadDialog.tsx`, `CreateJobPostingDialog.tsx`, `JobDetailsDialog.tsx`).
*   `layout/`: Components used in the main application layout (e.g., `AppSidebar.tsx`, `UserNav.tsx`).
*   `provider/`: Components specific to the service provider role (e.g., `AddServiceDialog.tsx`).
*   `shared/`: Globally shared components, not specific to a feature (e.g., `Logo.tsx`).
*   `ui/`: ShadCN UI primitive components (e.g., `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `table.tsx`, `sidebar.tsx`, etc.). These are generally installed/generated via the ShadCN CLI.

### `src/contexts/`
Contains React Context API providers for managing global state.

*   `AuthContext.tsx`: Manages user authentication state (current user, loading status) and provides authentication functions (login, signup, logout, updateProfile).

### `src/hooks/`
Custom React hooks used throughout the application.

*   `useAuth.tsx`: A simple hook to consume the `AuthContext`.
*   `useToast.ts`: Hook for displaying toast notifications (part of ShadCN UI setup).
*   `useMobile.tsx`: Hook to detect if the application is being viewed on a mobile-sized screen, used for responsive layout adjustments (e.g., in the sidebar).

### `src/lib/`
Contains utility functions, schema definitions, and other library-like code.

*   `schemas.ts`: Zod schema definitions for form validation (e.g., `LoginSchema`, `FullAssessmentSchema`, `CreateJobPostingSchema`).
*   `utils.ts`: General utility functions, most notably `cn` for merging Tailwind CSS classes (from ShadCN UI).

### `src/types/`
Contains TypeScript type definitions and interfaces.

*   `index.ts`: Central file exporting all major types (e.g., `User`, `UserRole`, `JobPosting`, `Assessment`, `UserSubmittedAssessment`, `AppliedJob`, `ProviderService`).

### `src/ai/`
Houses all Genkit (AI integration) related code.

*   `genkit.ts`: Global Genkit instance configuration, including model selection and plugin setup (e.g., Google AI plugin).
*   `flows/`: Directory containing individual Genkit flow definitions. Each flow typically handles a specific AI task.
    *   `summarize-assessment.ts`: Flow to summarize hospital assessment data.
    *   `match-vr-ar-solutions.ts`: Flow to match VR/AR solutions to hospital needs.
    *   `recommend-jobs.ts`: Flow to recommend jobs based on a CV.
*   `dev.ts`: Entry point for running the Genkit development server, which allows testing and inspection of flows.

## `public/` Directory
This directory is for static assets that are served directly by Next.js (e.g., images, favicons). Currently, it's not heavily used as placeholder images are sourced externally.

---
This structure aims for a clear separation of concerns and leverages Next.js App Router conventions.
