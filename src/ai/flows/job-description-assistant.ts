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
  prompt: `Você é um assistente de IA especialista em criar descrições de vagas que sejam claras, objetivas e atraentes para o mercado brasileiro.

Sua tarefa é gerar uma descrição de vaga em português do Brasil bem estruturada e profissional.

Use o título da vaga e as palavras-chave fornecidas como base.

**Título da Vaga:** {{{jobTitle}}}
**Palavras-chave:** {{{keywords}}}

**Instruções:**
1.  **Idioma:** A descrição DEVE ser em português do Brasil.
2.  **Tom:** Use um tom profissional, mas acessível e convidativo.
3.  **Estrutura:** Organize a descrição nas seguintes seções, usando títulos em negrito (markdown):
    *   **Descrição da Posição:** Um parágrafo breve e envolvente sobre a vaga.
    *   **Responsabilidades:** Uma lista clara (bullet points) das principais tarefas e deveres.
    *   **Qualificações:** Uma lista (bullet points) com os requisitos essenciais (habilidades técnicas, experiência).
    *   **Diferenciais:** Uma lista (bullet points) com qualificações desejáveis, mas não obrigatórias.
4.  **Clareza:** Seja específico sobre as responsabilidades e qualificações, baseando-se nas palavras-chave fornecidas.
5.  **Formato:** Use markdown para formatar a saída (negrito para títulos e listas para os itens).

**Descrição da Vaga Gerada:**`,
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
