'use server';

/**
 * @fileOverview Skill suggestion AI agent.
 *
 * - suggestSkills - A function that suggests relevant skills based on experience.
 * - SkillSuggestionInput - The input type for the suggestSkills function.
 * - SkillSuggestionOutput - The return type for the suggestSkills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SkillSuggestionInputSchema = z.object({
  experience: z
    .string()
    .describe('A description of the candidate\'s work experience.'),
});

export type SkillSuggestionInput = z.infer<typeof SkillSuggestionInputSchema>;

const SkillSuggestionOutputSchema = z.object({
  skills: z
    .array(z.string())
    .describe('An array of suggested skills relevant to the provided experience.'),
});

export type SkillSuggestionOutput = z.infer<typeof SkillSuggestionOutputSchema>;

export async function suggestSkills(input: SkillSuggestionInput): Promise<SkillSuggestionOutput> {
  return skillSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillSuggestionPrompt',
  input: {schema: SkillSuggestionInputSchema},
  output: {schema: SkillSuggestionOutputSchema},
  prompt: `Você é um assistente de IA especializado em sugerir habilidades relevantes com base na experiência de trabalho de um candidato.

  Dada a seguinte experiência de trabalho, sugira uma lista de habilidades em português que o candidato deve adicionar ao seu perfil para melhorar suas chances de ser combinado com oportunidades de emprego relevantes.

  Experiência: {{{experience}}}

  Habilidades:`,
});

const skillSuggestionFlow = ai.defineFlow(
  {
    name: 'skillSuggestionFlow',
    inputSchema: SkillSuggestionInputSchema,
    outputSchema: SkillSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
