'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically filling in a candidate's profile information by parsing their resume text.
 *
 * - resumeAutoFill - A function that takes resume text and returns a structured object containing extracted profile information.
 * - ResumeAutoFillInput - The input type for the resumeAutoFill function.
 * - ResumeAutoFillOutput - The return type for the resumeAutoFill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const ResumeAutoFillInputSchema = z.object({
  resumeText: z
    .string()
    .describe(
      "The text content of a resume."
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
  input: {schema: ResumeAutoFillInputSchema},
  output: {schema: ResumeAutoFillOutputSchema},
  prompt: `Você é um assistente de IA projetado para extrair informações de currículos em português.

  Por favor, extraia as seguintes informações do texto do currículo fornecido:
  - Nome
  - Endereço de e-mail
  - Número de telefone
  - Experiência de trabalho (como uma lista de strings, descrevendo cada cargo e empresa)
  - Habilidades (como uma lista de strings)
  - Histórico educacional (como uma lista de strings)

  Seja o mais preciso possível. Se uma informação não for encontrada, retorne um valor vazio para o campo correspondente.

  Aqui está o texto do currículo:
  {{{resumeText}}}`,
});

const resumeAutoFillFlow = ai.defineFlow(
  {
    name: 'resumeAutoFillFlow',
    inputSchema: ResumeAutoFillInputSchema,
    outputSchema: ResumeAutoFillOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Não foi possível processar o currículo");
    }
    return output;
  }
);
