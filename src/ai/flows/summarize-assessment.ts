'use server';

/**
 * @fileOverview Summarizes a hospital's VR/MR/AR technology needs assessment.
 *
 * - summarizeAssessment - A function that summarizes the assessment.
 * - SummarizeAssessmentInput - The input type for the summarizeAssessment function.
 * - SummarizeAssessmentOutput - The return type for the summarizeAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAssessmentInputSchema = z.object({
  assessmentData: z.string().describe('The assessment data from the hospital.'),
});
export type SummarizeAssessmentInput = z.infer<typeof SummarizeAssessmentInputSchema>;

const SummarizeAssessmentOutputSchema = z.object({
  summary: z.string().describe('A summary of the hospital assessment data.'),
});
export type SummarizeAssessmentOutput = z.infer<typeof SummarizeAssessmentOutputSchema>;

export async function summarizeAssessment(input: SummarizeAssessmentInput): Promise<SummarizeAssessmentOutput> {
  return summarizeAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAssessmentPrompt',
  input: {schema: SummarizeAssessmentInputSchema},
  output: {schema: SummarizeAssessmentOutputSchema},
  prompt: `You are an expert in VR/MR/AR technologies and hospital needs.
  Based on the assessment data provided, generate a concise summary of the hospital's needs and requirements.
  Assessment Data: {{{assessmentData}}}`,
});

const summarizeAssessmentFlow = ai.defineFlow(
  {
    name: 'summarizeAssessmentFlow',
    inputSchema: SummarizeAssessmentInputSchema,
    outputSchema: SummarizeAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
