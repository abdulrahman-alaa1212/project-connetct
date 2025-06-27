# Yura Connect - Database Schema Documentation

## 1. Introduction

This document provides a comprehensive schema for the Yura Connect database. It is designed to serve as a blueprint for backend development, including data model creation and database migrations. The schema is structured to be adaptable for both SQL (e.g., PostgreSQL) and NoSQL (e.g., Firestore) databases.

- **Primary Keys (PK):** Universally unique identifiers (e.g., UUIDs or auto-generated strings).
- **Foreign Keys (FK):** References to the Primary Key of another collection/table.
- **Timestamps:** `createdAt` and `updatedAt` should be managed automatically by the database/ORM where possible.

---

## 2. Core Collections / Tables

### 2.1. `users`

Stores information for all users, regardless of their role. Role-specific details can be stored in a nested object or a separate profile table linked by `userId`.

| Field Name     | Data Type             | Description                                                                                               | Notes                                                              |
| :------------- | :-------------------- | :-------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **`id` (PK)**  | `string`              | Unique identifier for the user.                                                                           |                                                                    |
| `name`         | `string`              | User's full name or the organization's name.                                                              |                                                                    |
| `email`        | `string`              | User's unique email address, used for login.                                                              | Should be unique and indexed.                                      |
| `hashedPassword` | `string`              | The user's hashed password for security.                                                                  | **NEVER** store plain text passwords.                              |
| `avatarUrl`    | `string`              | URL to the user's profile picture. Optional.                                                              |                                                                    |
| `role`         | `enum`                | Defines the user's role: `hospital`, `professional`, `provider`, `admin`.                                 | Indexed for querying users by role.                                |
| `hospitalId`   | `string`              | A unique ID for the hospital entity this user belongs to. Only for `hospital` role users.                 | Enables grouping users from the same hospital.                     |
| `providerId`   | `string`              | A unique ID for the provider entity this user belongs to. Only for `provider` role users.                 | Enables grouping users from the same provider company.             |
| `createdAt`    | `timestamp`           | Timestamp of when the user account was created.                                                           |                                                                    |
| `updatedAt`    | `timestamp`           | Timestamp of the last update to the user's record.                                                        |                                                                    |

### 2.2. `assessments`

Stores the detailed technology needs assessments submitted by `hospital` users.

| Field Name          | Data Type             | Description                                                                      | Notes                                                                                                    |
| :------------------ | :-------------------- | :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **`id` (PK)**       | `string`              | Unique identifier for the assessment.                                            |                                                                                                          |
| `hospitalUserId`    | `string` (FK to `users`) | The ID of the `hospital` user who submitted the assessment.                      | Indexed for retrieving assessments for a specific user.                                                  |
| `hospitalId`        | `string`              | The ID of the hospital organization.                                             | Indexed for retrieving all assessments for a specific hospital, even if submitted by different users.    |
| `status`            | `enum`                | The current status: `Submitted`, `Reviewed`, `Completed`.                        | Default: `Submitted`.                                                                                    |
| `submissionDate`    | `timestamp`           | The date the assessment was submitted or last updated.                           |                                                                                                          |
| `formData`          | `json` / `object`     | The complete, structured data from the `FullAssessmentSchema` form submission.   | Storing as JSON provides flexibility if the form changes in the future.                                  |
| `aiSummary`         | `text`                | AI-generated summary of the assessment. Optional.                                | Generated by Genkit flow post-submission.                                                                |
| `aiSolutions`       | `json` / `object`     | AI-suggested solutions and reasoning. Optional.                                  | Generated by Genkit flow post-submission. Structure: `{ suggestedSolutions: string, reasoning: string }` |
| `adminReview`       | `json` / `object`     | An object containing the admin's feedback. Optional.                             | Structure: `{ adminUserId: string, responseText: string, responsePdfUrl: string, reviewDate: timestamp }` |
| `createdAt`         | `timestamp`           | Timestamp of when the assessment was created.                                    |                                                                                                          |
| `updatedAt`         | `timestamp`           | Timestamp of the last update.                                                    |                                                                                                          |

### 2.3. `job_postings`

Stores job and training opportunities, typically created by `admin` users.

| Field Name            | Data Type             | Description                                                                               | Notes                                                   |
| :-------------------- | :-------------------- | :---------------------------------------------------------------------------------------- | :------------------------------------------------------ |
| **`id` (PK)**         | `string`              | Unique identifier for the job posting.                                                    |                                                         |
| `postedByAdminId`     | `string` (FK to `users`) | The ID of the `admin` user who created the posting.                                       |                                                         |
| `title`               | `string`              | The title of the job or training program.                                                 | Indexed for searching.                                  |
| `company`             | `string`              | The name of the company or organization offering the position.                            | Indexed for searching.                                  |
| `location`            | `string`              | The location of the job.                                                                  | Indexed for filtering.                                  |
| `description`         | `text`                | A detailed description of the role, responsibilities, and requirements.                   | Supports full-text search.                              |
| `type`                | `enum`                | `Full-time`, `Part-time`, `Contract`, `Internship`, `Training`.                             | Indexed for filtering.                                  |
| `companyLogoUrl`      | `string`              | URL to the company's logo. Optional.                                                      |                                                         |
| `datePosted`          | `timestamp`           | The date the job was officially posted.                                                   |                                                         |
| `isActive`            | `boolean`             | Controls the visibility of the job posting in the job board.                              | Default: `true`.                                        |
| `createdAt`           | `timestamp`           | Timestamp of when the job posting was created.                                            |                                                         |
| `updatedAt`           | `timestamp`           | Timestamp of the last update.                                                             |                                                         |

### 2.4. `applications`

Links `professional` users to `job_postings` they have applied for.

| Field Name           | Data Type                   | Description                                                                    | Notes                                                              |
| :------------------- | :-------------------------- | :----------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **`id` (PK)**        | `string`                    | Unique identifier for the application.                                         |                                                                    |
| `jobId`              | `string` (FK to `job_postings`) | The ID of the job being applied for.                                           | Indexed.                                                           |
| `professionalUserId` | `string` (FK to `users`)    | The ID of the `professional` user applying.                                    | Indexed.                                                           |
| `cvFileUrl`          | `string`                    | A direct URL to the CV file in cloud storage that was used for this application. | A specific snapshot of the CV is linked.                           |
| `coverLetter`        | `text`                      | The cover letter submitted by the user. Optional.                              |                                                                    |
| `status`             | `enum`                      | `Submitted`, `Viewed`, `Under Review`, `Shortlisted`, `Offered`, `Rejected`.     | Default: `Submitted`.                                              |
| `applicationDate`    | `timestamp`                 | The date the application was submitted.                                        |                                                                    |
| `createdAt`          | `timestamp`                 | Timestamp of when the application was created.                                 |                                                                    |
| `updatedAt`          | `timestamp`                 | Timestamp of the last update to the application's status.                      |                                                                    |

### 2.5. `provider_services`

Stores the service offerings listed by `provider` users.

| Field Name        | Data Type                   | Description                                                                           | Notes                  |
| :---------------- | :-------------------------- | :------------------------------------------------------------------------------------ | :--------------------- |
| **`id` (PK)**     | `string`                    | Unique identifier for the service.                                                    |                        |
| `providerUserId`  | `string` (FK to `users`)    | The ID of the `provider` user who listed the service.                                 | Indexed.               |
| `providerId`      | `string`                    | The ID of the provider company.                                                       | Indexed for grouping.  |
| `name`            | `string`                    | The name of the service.                                                              | Indexed for searching. |
| `description`     | `text`                      | A detailed description of the service.                                                |                        |
| `category`        | `enum`                      | `VR Development`, `AR Content Creation`, `MR Consultation`, `XR Training Solutions`, etc. | Indexed for filtering. |
| `pricingModel`    | `enum`                      | `Project-based`, `Hourly Rate`, `Subscription`, `Custom Quote`.                         |                        |
| `tags`            | `array` of `string`         | Searchable tags associated with the service. Optional.                                | Indexed for searching. |
| `imageUrl`        | `string`                    | URL to an image representing the service. Optional.                                   |                        |
| `createdAt`       | `timestamp`                 | Timestamp of when the service was created.                                            |                        |
| `updatedAt`       | `timestamp`                 | Timestamp of the last update.                                                         |                        |
