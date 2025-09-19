// use server'
'use server';
/**
 * @fileOverview An AI assistant to help employers write compelling and inclusive job descriptions.
 *
 * - generateJobDescription - A function that generates a job description based on a job title and keywords.
 * - JobDescriptionAssistantInput - The input type for the generateJobDescription function.
 * - JobDescriptionAssistantOutput - The return type for the generateJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobDescriptionAssistantInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  keywords: z.string().describe('Keywords related to the job, separated by commas.'),
});
export type JobDescriptionAssistantInput = z.infer<
  typeof JobDescriptionAssistantInputSchema
>;

const JobDescriptionAssistantOutputSchema = z.object({
  jobDescription: z.string().describe('The generated job description.'),
});
export type JobDescriptionAssistantOutput = z.infer<
  typeof JobDescriptionAssistantOutputSchema
>;

export async function generateJobDescription(
  input: JobDescriptionAssistantInput
): Promise<JobDescriptionAssistantOutput> {
  return jobDescriptionAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'jobDescriptionAssistantPrompt',
  input: {schema: JobDescriptionAssistantInputSchema},
  output: {schema: JobDescriptionAssistantOutputSchema},
  prompt: `You are an AI assistant helping employers write job descriptions.

  Based on the job title and keywords provided, generate a compelling and inclusive job description.

  Job Title: {{{jobTitle}}}
  Keywords: {{{keywords}}}

  Job Description:`, // Removed the extra newline here
});

const jobDescriptionAssistantFlow = ai.defineFlow(
  {
    name: 'jobDescriptionAssistantFlow',
    inputSchema: JobDescriptionAssistantInputSchema,
    outputSchema: JobDescriptionAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
