'use server';
/**
 * @fileOverview An AI flow to rank job candidates against a job description.
 *
 * - rankCandidates - Ranks candidates based on their profile and the job description.
 * - RankCandidatesInput - The input type for the rankCandidates function.
 * - RankCandidatesOutput - The return type for the rankCandidates function.
 */

import {ai} from '@/ai/genkit';
import {RankCandidatesInputSchema, RankCandidatesOutputSchema} from '@/lib/types';
import type {RankCandidatesInput, RankCandidatesOutput} from '@/lib/types';

export async function rankCandidates(
  input: RankCandidatesInput
): Promise<RankCandidatesOutput> {
  return rankCandidatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rankCandidatesPrompt',
  input: {schema: RankCandidatesInputSchema},
  output: {schema: RankCandidatesOutputSchema},
  prompt: `Você é um recrutador especialista sênior com vasta experiência em análise de currículos e perfis de candidatos para o mercado de trabalho brasileiro.

Sua tarefa é analisar uma lista de perfis de candidatos e classificá-los em relação a uma descrição de vaga específica.

**Descrição da Vaga:**
"""
{{{jobDescription}}}
"""

**Perfis dos Candidatos:**
{{#each candidateProfiles}}
---
ID do Candidato: {{{this.id}}}
Nome: {{{this.name}}}
Resumo: {{{this.summary}}}
Experiência: {{{this.experience}}}
Educação: {{{this.education}}}
---
{{/each}}

**Instruções:**
1.  **Analise Cada Candidato:** Avalie cada candidato com base em sua experiência profissional, educação e resumo, comparando-os com os requisitos e responsabilidades da descrição da vaga.
2.  **Atribua uma Pontuação:** Para cada candidato, atribua uma pontuação de 0 a 10, onde 10 representa uma correspondência perfeita com a vaga. Seja criterioso.
3.  **Justifique a Pontuação:** Para cada candidato, escreva uma justificativa curta e objetiva (1-2 frases) explicando os principais motivos para a pontuação atribuída. Destaque pontos fortes ou desalinhamentos claros.
4.  **Ordene a Lista:** Retorne a lista de candidatos ordenada da maior para a menor pontuação.
5.  **Idioma:** Todas as justificativas devem ser em português do Brasil.

Retorne um objeto JSON contendo a lista de candidatos ranqueados.
`,
});

const rankCandidatesFlow = ai.defineFlow(
  {
    name: 'rankCandidatesFlow',
    inputSchema: RankCandidatesInputSchema,
    outputSchema: RankCandidatesOutputSchema,
  },
  async input => {
    if (!input.candidateProfiles || input.candidateProfiles.length === 0) {
      return { rankedCandidates: [] };
    }

    const {output} = await prompt(input);

    if (!output) {
      throw new Error('A análise da IA não retornou um resultado.');
    }
    
    // Sort again to be safe
    output.rankedCandidates.sort((a, b) => b.score - a.score);

    return output;
  }
);
