'use server';
/**
 * @fileOverview A conversational AI agent to help candidates build their resume step-by-step.
 *
 * - conversationalResume - A function that drives the conversation for resume building.
 * - ConversationState - The schema for the state of the conversation.
 * - ProfileData - The schema for the final extracted profile data.
 * - ConversationMessage - The type for a single message in the conversation history.
 */

import { ai } from '@/ai/genkit';
import { ConversationMessage, ConversationMessageSchema, ProfileData, ProfileDataSchema } from '@/lib/types';
import { z } from 'genkit';


// Defines the input for the main flow, which is the conversation history
const ConversationalResumeInputSchema = z.object({
  history: z.array(ConversationMessageSchema),
});
export type ConversationalResumeInput = z.infer<typeof ConversationalResumeInputSchema>;

// Defines the output of the main flow
const ConversationalResumeOutputSchema = z.object({
    nextQuestion: z.string().describe("The next question for the AI to ask the user, or a final summary message."),
    isFinished: z.boolean().describe("A flag indicating if the conversation is complete and the profile is built."),
    profile: ProfileDataSchema.describe("The structured profile data collected so far."),
});
export type ConversationalResumeOutput = z.infer<typeof ConversationalResumeOutputSchema>;


export async function conversationalResume(input: ConversationalResumeInput): Promise<ConversationalResumeOutput> {
  return conversationalResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversationalResumePrompt',
  input: { schema: ConversationalResumeInputSchema },
  output: { schema: ConversationalResumeOutputSchema },
  prompt: `Você é um assistente de IA amigável e prestativo, especialista em ajudar pessoas a criar um currículo. Seu público-alvo são pessoas que buscam empregos em áreas como turismo, hotelaria e restaurantes, então use uma linguagem simples, encorajadora e direta.

Sua tarefa é conduzir uma conversa para coletar as informações necessárias para montar um currículo, fazendo UMA PERGUNTA DE CADA VEZ.

Analise o histórico da conversa para entender em que parte do processo você está e quais informações já foram coletadas. O histórico é:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

O processo deve seguir a seguinte ordem de perguntas:
1.  Se o histórico estiver vazio, sua primeira resposta em 'nextQuestion' DEVE SER para dar as boas-vindas e pedir o nome completo.
2.  Cidade e estado onde mora (ex: Porto Alegre, RS).
3.  Número de telefone para contato.
4.  Principal experiência profissional (peça uma de cada vez).
5.  Após coletar uma experiência, pergunte "Você tem mais alguma experiência para adicionar? Se não, digite 'não'". Se a resposta for afirmativa, peça a próxima. Se for "não", siga para a próxima etapa.
6.  Formação educacional (curso e instituição). Peça uma de cada vez, e use a mesma lógica do item 5 para saber se há mais a adicionar.
7.  Habilidades principais (peça para listar algumas, separadas por vírgula).
8.  Um breve resumo sobre o candidato.
9.  Ao final, agradeça e informe que o currículo está completo.

REGRAS IMPORTANTES:
- FAÇA APENAS UMA PERGUNTA POR VEZ.
- Preencha o campo 'profile' com os dados que você já coletou ao longo da conversa.
- Se o usuário disser "parar" ou "cancelar", encerre a conversa educadamente.
- Quando todas as informações forem coletadas, defina 'isFinished' como 'true' e forneça uma mensagem de conclusão em 'nextQuestion'.
`,
});

const conversationalResumeFlow = ai.defineFlow(
  {
    name: 'conversationalResumeFlow',
    inputSchema: ConversationalResumeInputSchema,
    outputSchema: ConversationalResumeOutputSchema,
  },
  async (input) => {
    console.log('--- Iniciando conversationalResumeFlow ---');
    console.log('Input recebido:', JSON.stringify(input, null, 2));

    try {
      const { output } = await prompt(input);
      if (!output) {
        console.error('Erro: A resposta do prompt da IA foi nula ou indefinida.');
        throw new Error("A IA não retornou uma resposta válida.");
      }
      console.log('Output da IA:', JSON.stringify(output, null, 2));
      console.log('--- Finalizando conversationalResumeFlow com sucesso ---');
      return output;
    } catch (error) {
      console.error('!!! Erro crítico no conversationalResumeFlow !!!', error);
      // Re-throw the error to be caught by the client-side caller
      throw new Error("Ocorreu um erro interno ao se comunicar com a IA.");
    }
  }
);
