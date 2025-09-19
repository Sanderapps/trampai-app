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
  prompt: `Você é um assistente de IA especialista em criar descrições de vagas simples e diretas para o mercado brasileiro.

Sua tarefa é gerar uma descrição de vaga em português do Brasil que seja muito clara, objetiva e fácil de entender.

Use o título da vaga e as palavras-chave fornecidas como base.

**Título da Vaga:** {{{jobTitle}}}
**Palavras-chave:** {{{keywords}}}

**Instruções:**
1.  **Idioma:** A descrição DEVE ser em português do Brasil.
2.  **Simplicidade:** Use uma linguagem extremamente simples e direta. Evite termos complexos ou jargões de mercado.
3.  **Estrutura:** Organize a descrição em apenas duas seções: "Responsabilidades" e "Qualificações". Use listas simples (com marcadores) para cada seção.
4.  **Conteúdo:** Detalhe as principais atividades e os requisitos essenciais para a função, baseando-se nas palavras-chave. Seja breve e vá direto ao ponto.

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
