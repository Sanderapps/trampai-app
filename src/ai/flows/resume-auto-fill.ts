
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
  name: z.string().describe('The full name of the candidate.'),
  email: z.string().email().describe('The email address of the candidate.'),
  phone: z.string().describe('The phone number of the candidate.'),
  experience: z.array(z.string()).describe('A list of the candidate\'s work experiences. Each item in the array should be a separate job/role description.'),
  skills: z.array(z.string()).describe('A list of the candidate\'s skills.'),
  education: z.array(z.string()).describe('A list of the candidate\'s education history. Each item should be a separate degree or course.'),
});
export type ResumeAutoFillOutput = z.infer<typeof ResumeAutoFillOutputSchema>;

export async function resumeAutoFill(input: ResumeAutoFillInput): Promise<ResumeAutoFillOutput> {
  return resumeAutoFillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeAutoFillPrompt',
  input: {schema: ResumeAutoFillInputSchema},
  output: {schema: ResumeAutoFillOutputSchema},
  prompt: `Você é um assistente de IA especialista em extrair informações estruturadas de textos de currículos em português.

  Analise o texto do currículo abaixo e extraia as seguintes informações:
  - Nome completo do candidato.
  - Endereço de e-mail.
  - Número de telefone.
  - Experiência profissional: Separe cada experiência de trabalho em um item de uma lista.
  - Habilidades: Liste as habilidades técnicas e interpessoais.
  - Histórico educacional: Separe cada formação ou curso em um item de uma lista.

  Seja o mais preciso possível. Se uma informação não for encontrada, retorne um valor vazio para o campo correspondente (ex: "" para strings, [] para listas).

  Texto do Currículo:
  """
  {{{resumeText}}}
  """
  `,
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