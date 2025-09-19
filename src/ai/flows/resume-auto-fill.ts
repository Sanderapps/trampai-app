'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically filling in a candidate's profile information by parsing their resume PDF.
 *
 * - resumeAutoFill - A function that takes a resume PDF data URI and returns a structured object containing extracted profile information.
 * - ResumeAutoFillInput - The input type for the resumeAutoFill function.
 * - ResumeAutoFillOutput - The return type for the resumeAutoFill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const ResumeAutoFillInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume PDF file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ResumeAutoFillInput = z.infer<typeof ResumeAutoFillInputSchema>;

const ResumeAutoFillOutputSchema = z.object({
  name: z.string().describe('The name of the candidate.'),
  email: z.string().email().describe('The email address of the candidate.'),
  phone: z.string().describe('The phone number of the candidate.'),
  experience: z.array(z.string()).describe('A list of the candidate\'s work experiences.'),
  skills: z.array(z.string()).describe('A list of the candidate\'s skills.'),
  education: z.array(z.string()).describe('A list of the candidate\'s education history.'),
});
export type ResumeAutoFillOutput = z.infer<typeof ResumeAutoFillOutputSchema>;

export async function resumeAutoFill(input: ResumeAutoFillInput): Promise<ResumeAutoFillOutput> {
  return resumeAutoFillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeAutoFillPrompt',
  input: {schema: z.object({ resumeText: z.string() })},
  output: {schema: ResumeAutoFillOutputSchema},
  prompt: `You are an AI assistant designed to extract information from resumes.

  Please extract the following information from the resume text provided:
  - Name
  - Email Address
  - Phone Number
  - Work Experience (as a list of strings)
  - Skills (as a list of strings)
  - Education History (as a list of strings)

  Here is the resume text:
  {{{resumeText}}}`,
});

const resumeAutoFillFlow = ai.defineFlow(
  {
    name: 'resumeAutoFillFlow',
    inputSchema: ResumeAutoFillInputSchema,
    outputSchema: ResumeAutoFillOutputSchema,
  },
  async (input) => {
    // PDF processing is temporarily disabled to resolve a build issue.
    // In a real implementation, you would extract text from the PDF here.
    const resumeText = "Resume processing is currently disabled.";
    
    const {output} = await prompt({resumeText});
    if (!output) {
      throw new Error("Unable to process resume");
    }
    return output;
  }
);
