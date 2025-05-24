'use server';

/**
 * @fileOverview Matches VR/AR solutions to hospital needs based on assessment data.
 *
 * - matchVrArSolutions - A function that handles the matching process.
 * - MatchVrArSolutionsInput - The input type for the matchVrArSolutions function.
 * - MatchVrArSolutionsOutput - The return type for the matchVrArSolutions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchVrArSolutionsInputSchema = z.object({
  assessmentData: z
    .string()
    .describe('The assessment data provided by the hospital.'),
});
export type MatchVrArSolutionsInput = z.infer<typeof MatchVrArSolutionsInputSchema>;

const MatchVrArSolutionsOutputSchema = z.object({
  suggestedSolutions: z
    .string()
    .describe('A list of VR/AR solutions that match the hospital needs.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested solutions.'),
});
export type MatchVrArSolutionsOutput = z.infer<typeof MatchVrArSolutionsOutputSchema>;

export async function matchVrArSolutions(input: MatchVrArSolutionsInput): Promise<MatchVrArSolutionsOutput> {
  return matchVrArSolutionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchVrArSolutionsPrompt',
  input: {schema: MatchVrArSolutionsInputSchema},
  output: {schema: MatchVrArSolutionsOutputSchema},
  prompt: `You are an expert in VR/AR technologies for hospitals.

  Based on the hospital's needs assessment data, suggest suitable VR/AR solutions.

  Assessment Data: {{{assessmentData}}}

  Consider various factors such as the hospital's size, specialization, budget, and technical capabilities.
  Explain the reasoning behind the suggested solutions.
  Provide a list of VR/AR solutions that match the hospital needs.
  Ensure that the solutions are practical and aligned with the hospital's goals.
  Return the suggested solutions and reasoning in the output schema.
  `,
});

const matchVrArSolutionsFlow = ai.defineFlow(
  {
    name: 'matchVrArSolutionsFlow',
    inputSchema: MatchVrArSolutionsInputSchema,
    outputSchema: MatchVrArSolutionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
