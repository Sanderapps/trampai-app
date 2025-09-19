'use server';

/**
 * @fileOverview This file implements the AI-powered job suggestion flow.
 *
 * It takes candidate profile information and job descriptions as input,
 * and returns a list of suggested job matches.
 *
 * @exports {
 *   suggestJobs,
 *   SuggestJobsInput,
 *   SuggestJobsOutput
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the suggestJobs function
const SuggestJobsInputSchema = z.object({
  candidateProfile: z
    .string()
    .describe('The profile information of the candidate.'),
  jobDescriptions: z
    .array(z.string())
    .describe('An array of job descriptions to match against.'),
});

export type SuggestJobsInput = z.infer<typeof SuggestJobsInputSchema>;

// Define the output schema for the suggestJobs function
const SuggestJobsOutputSchema = z.object({
  suggestedJobs: z
    .array(z.string())
    .describe('An array of job descriptions that are good matches.'),
});

export type SuggestJobsOutput = z.infer<typeof SuggestJobsOutputSchema>;

// Exported function to initiate the job suggestion flow
export async function suggestJobs(input: SuggestJobsInput): Promise<SuggestJobsOutput> {
  return suggestJobsFlow(input);
}

// Define the prompt for the AI model
const suggestJobsPrompt = ai.definePrompt({
  name: 'suggestJobsPrompt',
  input: {schema: SuggestJobsInputSchema},
  output: {schema: SuggestJobsOutputSchema},
  prompt: `Você é um especialista em recrutamento e seleção.

Analise o perfil do candidato abaixo:

{{candidateProfile}}

E as seguintes descrições de vagas:

{{#each jobDescriptions}}
- {{this}}
{{/each}}

Determine quais vagas são as melhores correspondências para o candidato, com base em suas habilidades, experiência e palavras-chave.

Retorne um array contendo apenas as descrições de vagas que são altamente relevantes para o perfil do candidato. A resposta deve ser em português do Brasil.
`,
});

// Define the Genkit flow
const suggestJobsFlow = ai.defineFlow(
  {
    name: 'suggestJobsFlow',
    inputSchema: SuggestJobsInputSchema,
    outputSchema: SuggestJobsOutputSchema,
  },
  async input => {
    const {output} = await suggestJobsPrompt(input);
    return output!;
  }
);
