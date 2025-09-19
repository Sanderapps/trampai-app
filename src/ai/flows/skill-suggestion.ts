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
  prompt: `You are an AI assistant specialized in suggesting relevant skills based on a candidate's work experience.

  Given the following work experience, suggest a list of skills that the candidate should add to their profile to improve their chances of being matched with relevant job opportunities.

  Experience: {{{experience}}}

  Skills:`,
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
