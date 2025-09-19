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
  prompt: `Você é um assistente de IA especialista em criar descrições de vagas para o mercado brasileiro.

Sua tarefa é gerar uma descrição de vaga em português do Brasil que seja clara, atraente, inclusiva e bem estruturada.

Use o título da vaga e as palavras-chave fornecidas como base.

**Título da Vaga:** {{{jobTitle}}}
**Palavras-chave:** {{{keywords}}}

**Instruções:**
1.  **Idioma:** A descrição DEVE ser em português do Brasil.
2.  **Estrutura:** Organize a descrição em seções claras, como "Descrição da Vaga", "Responsabilidades", "Qualificações" e "Diferenciais". Use markdown para formatação (negrito e listas).
3.  **Tom:** Use um tom profissional, mas acessível e convidativo. Evite jargões excessivos.
4.  **Inclusão:** Utilize uma linguagem neutra e inclusiva, evitando termos que possam discriminar gênero, idade ou outras características.
5.  **Conteúdo:** Elabore o conteúdo com base nas palavras-chave, detalhando as principais atividades e os requisitos técnicos e comportamentais esperados para a função.

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
