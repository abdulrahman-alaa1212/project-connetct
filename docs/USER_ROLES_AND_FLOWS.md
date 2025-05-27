
# User Roles and Workflows in Yura Connect

This document describes the primary user roles within the Yura Connect platform and outlines their main workflows and interactions.

## 1. Hospital User

**Role Description:** Representatives from hospitals or healthcare institutions aiming to explore and implement Augmented Reality (AR) and Mixed Reality (MR) technologies.

**Core Workflows:**

### 1.1. Submitting Technology Needs Assessment
1.  **Navigate to Assessment Form:** Access the "Submit New Assessment" page (typically `/assessment`).
2.  **Complete Detailed Form (`AssessmentForm.tsx`):**
    *   Fill out comprehensive information across multiple sections:
        *   General hospital and project information.
        *   Previous experiences with XR technologies.
        *   Current goals and challenges.
        *   Technical infrastructure and resources.
        *   Interest in using XR for marketing (optional).
        *   Detailed analysis of specific departments and their processes (repeatable section).
        *   Budget and expected timeline.
        *   Other concerns and considerations.
        *   Additional questions and contact preferences.
    *   The form features **autosave to `localStorage`** to prevent data loss. Users are prompted to restore drafts if available.
3.  **Submit Form:**
    *   Upon submission, client-side validation (Zod) occurs.
    *   If valid, the assessment data is processed.
4.  **AI Analysis & Immediate Feedback:**
    *   The submitted data is sent to Genkit AI flows:
        *   `summarizeAssessment`: Generates a concise summary of the hospital's needs.
        *   `matchVrArSolutions`: Suggests potential AR/MR solutions based on the assessment.
    *   The AI-generated summary and solution suggestions are displayed to the user immediately on the same page.
5.  **Data "Persistence" (Current Mock):**
    *   The full assessment data, along with the AI summary and solutions, is saved to the user's `localStorage` under a key like `user_assessments_{hospitalId}`.

### 1.2. Viewing Submitted Assessments & Admin Feedback
1.  **Navigate to "My Assessments":** Access the `/my-assessments` page.
2.  **View List:** A table displays all assessments previously submitted by the hospital user, showing key details like hospital name, submission date, and status.
3.  **View Details:**
    *   Clicking "View" for an assessment opens a modal.
    *   The modal displays:
        *   Original submission details (key fields from the `formData`).
        *   The AI-generated summary and solutions.
        *   **Admin Feedback:** Any text response (`adminResponseText`) and the name of any PDF report (`adminResponsePdfName`) provided by the platform admin.
        *   The current status of the assessment (e.g., "Submitted", "Reviewed", "Completed").

### 1.3. Editing/Deleting Assessments
*   **From `/my-assessments` page:**
    *   **Edit:** Clicking "Edit" navigates the user to the `/assessment?editId={assessmentId}` page. The `AssessmentForm` pre-fills with the selected assessment's data. Upon re-submission, the existing record in `localStorage` is updated, and AI flows may be re-run.
    *   **Delete:** Clicking "Delete" prompts for confirmation. If confirmed, the assessment record is removed from `localStorage`.

## 2. Professional User (Doctor, Technician, Trainee)

**Role Description:** Healthcare professionals or trainees looking for job or training opportunities in the AR/MR medical field.

**Core Workflows:**

### 2.1. Managing CV
1.  **Navigate to "Manage My CV":** Access the `/my-cv` page.
2.  **Upload/Replace CV:**
    *   User selects a CV file (PDF, DOC, DOCX; size and type validation applied).
    *   Upon "upload" (simulated), metadata (filename, type, size, last updated date) is stored in `localStorage` (`user_cv_metadata_{userId}`).
    *   The page displays details of the "current" CV on file.
    *   A mock download option is available.

### 2.2. Browsing & Applying for Job/Training Opportunities
1.  **Navigate to "Job Board":** Access the `/jobs` page.
2.  **Browse & Filter:** View a list of available job and training postings. Use search and filter options (by title, company, type, location).
3.  **Apply for Opportunity:**
    *   Clicking "Apply Now" on a `JobCard` opens the `CvUploadDialog`.
    *   **Submit Application:**
        *   The user confirms or uploads a CV file.
        *   Optionally writes a cover letter.
        *   Submitting the dialog creates an `AppliedJob` record (job details, user ID, application date, initial status "Submitted").
        *   This record is saved to `localStorage` (`user_applications_{userId}`).

### 2.3. Tracking Applications
1.  **Navigate to "View My Applications":** Access the `/my-applications` page.
2.  **View List:** A table displays all job/training applications submitted by the professional, showing the job title, company, date applied, and current status (mocked, e.g., "Submitted", "Viewed").

## 3. Service Provider User

**Role Description:** Companies or individuals offering AR/MR products, development, consultation, or hardware solutions.

**Core Workflows:**

### 3.1. Managing Offered Services
1.  **Navigate to "Manage My Services":** Access the `/services` page.
2.  **View Listed Services:** Displays a list of services currently offered by the provider (loaded from `localStorage` under `provider_services_{providerId}`).
3.  **Add New Service:**
    *   Clicking "Add New Service" opens the `AddServiceDialog`.
    *   User fills in service details: name, description, category, pricing model, optional image URL, and tags.
    *   Upon submission, a new `ProviderService` record is created and saved to `localStorage`.
4.  **Edit/Delete Service:**
    *   From the list of services, the provider can choose to "Edit" (opens `AddServiceDialog` pre-filled) or "Delete" (with confirmation) their existing service listings.

### 3.2. (Future) Viewing Matched Hospital Needs
*   The `/provider/matches` page is currently a placeholder.
*   **Intended Flow:** This page will eventually display hospital assessment needs that are algorithmically (or AI) matched to the provider's listed services.

## 4. Admin User

**Role Description:** Platform administrators responsible for content management, user oversight, and facilitating interactions.

**Core Workflows:**

### 4.1. Managing Hospital Assessments
1.  **Navigate to "Manage Assessments":** Access the `/admin/reports` page.
2.  **View Assessment List:** Displays a table of all hospital assessment submissions, with key details and status.
3.  **Review & Respond:**
    *   Clicking "Review & Respond" for an assessment navigates to `/admin/reports/[assessmentId]/review`.
    *   **View Assessment Details:** Admin sees the full submitted assessment data and any AI-generated summary/solutions.
    *   **Provide Feedback:**
        *   Admin can write a text response/notes.
        *   Optionally, admin can select a PDF file to be "sent" as a report.
    *   **Finalize Response:** A single "Finalize & Send Response" action:
        *   Saves the text notes to `localStorage` (`assessment_notes_{id}`).
        *   If a PDF was selected, its filename is saved to `localStorage` (`assessment_pdf_response_{id}`).
        *   Updates the assessment status (e.g., to "Reviewed" or "Completed") in `localStorage` (`assessment_status_{id}`).
    *   Admin can also download a consolidated `.txt` report of the assessment and their response.

### 4.2. Posting & Managing Job/Training Opportunities
1.  **Navigate to "Post & Manage Opportunities":** Access the `/jobs` page (admin view).
2.  **View Job List:** Displays all job/training postings.
3.  **Create New Posting:**
    *   Clicking "Create New Posting" opens the `CreateJobPostingDialog`.
    *   Admin fills in details: title, company, location, description, type, optional logo URL.
    *   Upon submission, a new `JobPosting` is created (marked as `postedByAdmin: true`) and added to the local state of the job board (currently not fully persisted across admin sessions without a backend).
4.  **Manage Existing Postings:**
    *   **View:** Opens `JobDetailsDialog` to see full job details.
    *   **Edit:** Opens `CreateJobPostingDialog` pre-filled for updates.
    *   **Delete:** Prompts for confirmation and removes the job from the local list.

### 4.3. Managing Platform Users
1.  **Navigate to "Manage Users":** Access the `/admin/users` page.
2.  **View User Lists:** Displays users in tables, categorized by "Hospital Users" and "Professional Users" tabs, showing name, email, and role. (Data is currently from mock sources).
3.  **Actions (Placeholders):** "View Details" and "Edit" buttons are present but currently have placeholder functionality (e.g., show a toast).

## 5. Common Features (All Authenticated Roles)

### 5.1. Authentication
*   **Login:** Users access `/login`, enter credentials. `AuthContext` validates against mock data and stores user info in `localStorage`.
*   **Signup:** Users access `/signup`, provide details (name, email, password, role). `AuthContext` "creates" a new mock user and stores them.
*   **Logout:** Clears user data from `AuthContext` and `localStorage`, redirects to login.

### 5.2. User Profile Settings
*   **Navigate to "Settings":** Access the `/settings` page.
*   **Update Profile:** Users can update their name, email, and avatar URL. Changes are saved via `AuthContext` to `localStorage`.
---
This provides a detailed look at how users interact with the Yura Connect platform in its current frontend MVP state.
