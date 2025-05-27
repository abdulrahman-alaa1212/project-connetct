
# Yura Connect - Connecting Healthcare Innovation

**Version:** 1.0 (Frontend MVP with Mocked Backend)
**Last Updated:** May 25, 2024

Yura Connect is a platform designed to bridge the gap in the healthcare sector concerning the adoption and utilization of Augmented Reality (AR) and Mixed Reality (MR) technologies. It connects hospitals, healthcare professionals, technology providers, and platform administrators.

## Core Features

*   **For Hospitals:** Submit detailed AR/MR needs assessments, receive AI-driven insights, track submissions, and view administrator feedback.
*   **For Professionals:** Manage CVs, browse specialized job/training opportunities in medical XR, apply for positions, and track application statuses.
*   **For Service Providers:** List and manage AR/MR service offerings to a targeted hospital audience.
*   **For Admins:** Oversee hospital assessments, manage job/training postings, and manage platform users.

## User Roles

1.  **Hospital User:** Representatives from healthcare institutions.
2.  **Professional User:** Doctors, surgeons, technicians, trainees in the healthcare field.
3.  **Service Provider User:** Companies or individuals offering AR/MR solutions.
4.  **Admin User:** Platform administrators.

## Technology Stack

*   **Framework:** Next.js 15.x (App Router)
*   **Language:** TypeScript
*   **UI Library:** React 18.x
*   **Styling:** Tailwind CSS
*   **UI Components:** ShadCN UI
*   **AI Integration:** Google Genkit 1.x (with Gemini Models)
*   **Form Validation:** Zod
*   **State Management:** React Context API, `react-hook-form`
*   **Current Data Persistence (Mock):** Browser `localStorage`

## Getting Started

To run the development server:

```bash
npm run dev
```

This will typically start the application on `http://localhost:9002`.

## Detailed Documentation

For more detailed documentation, please refer to the files in the `/docs` directory:
*   `PROJECT_STRUCTURE.md`: Detailed explanation of the project's directory and file structure.
*   `USER_ROLES_AND_FLOWS.md`: In-depth description of user roles and their primary workflows.
*   `FRONTEND_ARCHITECTURE.md`: (To be created) Details on routing, layouts, state management, key components.
*   `AI_INTEGRATION.md`: (To be created) Information on Genkit usage and AI flows.
*   `BACKEND_TRANSITION_PLAN.md`: (To be created) Conceptual plan for backend development.
*   `KNOWN_ISSUES_AND_FUTURE_ENHANCEMENTS.md`: (To be created) List of current limitations and future plans.

