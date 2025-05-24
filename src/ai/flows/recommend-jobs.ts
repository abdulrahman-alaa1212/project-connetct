// Recommend relevant job/training opportunities to professionals/trainees based on their submitted CV.

'use server';

/**
 * @fileOverview Recommends relevant job/training opportunities to professionals/trainees based on their submitted CV.
 *
 * - recommendJobs - A function that handles the job recommendation process.
 * - RecommendJobsInput - The input type for the recommendJobs function.
 * - RecommendJobsOutput - The return type for the recommendJobs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendJobsInputSchema = z.object({
  cvDataUri: z
    .string()
    .describe(
      "The professional/trainee's CV as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobPostings: z
    .array(z.string())
    .describe('A list of available job postings as strings.'),
});
export type RecommendJobsInput = z.infer<typeof RecommendJobsInputSchema>;

const RecommendJobsOutputSchema = z.object({
  recommendedJobs: z
    .array(z.string())
    .describe('A list of job postings recommended for the professional/trainee.'),
});
export type RecommendJobsOutput = z.infer<typeof RecommendJobsOutputSchema>;

export async function recommendJobs(input: RecommendJobsInput): Promise<RecommendJobsOutput> {
  return recommendJobsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendJobsPrompt',
  input: {schema: RecommendJobsInputSchema},
  output: {schema: RecommendJobsOutputSchema},
  prompt: `You are an expert career advisor. Given a CV and a list of job postings, you will determine which job postings are most relevant to the candidate.

CV:
{{media url=cvDataUri}}

Job Postings:
{{#each jobPostings}}{{{this}}}\n{{/each}}

Based on the CV, recommend the best job postings from the list. Return only the job postings that are a good fit for the candidate.
`,
});

const recommendJobsFlow = ai.defineFlow(
  {
    name: 'recommendJobsFlow',
    inputSchema: RecommendJobsInputSchema,
    outputSchema: RecommendJobsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
