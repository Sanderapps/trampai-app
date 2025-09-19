
'use server';
/**
 * @fileOverview A conversational AI agent to help candidates build their resume step-by-step.
 *
 * - conversationalResume - A function that drives the conversation for resume building.
 * - ConversationalResumeInput - The input schema for the main flow, which is the conversation history
 * - ConversationalResumeOutput - The output schema for the main flow, containing the next question and extracted data.
 */

import { ai } from '@/ai/genkit';
import { ConversationMessage, ConversationMessageSchema, ProfileData, ProfileDataSchema } from '@/lib/types';
import { z } from 'genkit';


// Defines the input for the main flow, which is the conversation history
export const ConversationalResumeInputSchema = z.object({
  history: z.array(ConversationMessageSchema),
});
export type ConversationalResumeInput = z.infer<typeof ConversationalResumeInputSchema>;

// Defines the output of the main flow
export const ConversationalResumeOutputSchema = z.object({
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
  prompt: `Você é um assistente de IA amigável e especialista em ajudar pessoas a criar um currículo. Seu público são pessoas que buscam empregos em áreas como turismo, hotelaria e restaurantes, então use uma linguagem simples, encorajadora e direta.

Sua tarefa é conduzir uma conversa para coletar as informações necessárias, fazendo UMA PERGUNTA DE CADA VEZ e preenchendo o objeto 'profile' com os dados coletados.

Analise o histórico da conversa para entender em que parte do processo você está e quais informações já foram coletadas.
{{#if history}}
O histórico é:
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}

Siga RIGOROSAMENTE esta ordem de perguntas, preenchendo o objeto 'profile' a cada passo:
1.  Se o histórico estiver vazio, sua primeira resposta em 'nextQuestion' DEVE SER para dar as boas-vindas e pedir o NOME COMPLETO.
2.  Peça a CIDADE e ESTADO onde a pessoa mora (ex: Porto Alegre, RS).
3.  Peça o NÚMERO DE TELEFONE para contato (com DDD).

4.  **EXPERIÊNCIA PROFISSIONAL (peça uma de cada vez):**
    a. Pergunte o CARGO da experiência mais recente.
    b. Pergunte o NOME DA EMPRESA.
    c. Pergunte a DATA DE INÍCIO (Mês/Ano).
    d. Pergunte a DATA DE TÉRMINO (Mês/Ano ou "Atual").
    e. Após coletar uma experiência completa, pergunte: "Você tem mais alguma experiência para adicionar? Se não, pode dizer 'não'".
    f. Se a resposta for afirmativa, repita os passos de 'a' a 'd' para a nova experiência. Se for "não" ou algo semelhante, siga para a próxima etapa.

5.  **FORMAÇÃO EDUCACIONAL (peça uma de cada vez):**
    a. Pergunte o nome do CURSO ou formação (ex: Ensino Médio, Gastronomia).
    b. Pergunte o nome da INSTITUIÇÃO de ensino.
    c. Pergunte o ANO DE CONCLUSÃO.
    d. Após coletar uma formação, pergunte se a pessoa tem outra para adicionar (como no passo 4.e). Se for "não", siga para a próxima etapa.

6.  **HABILIDADES:** Peça para a pessoa listar suas principais HABILIDADES, separadas por vírgula.

7.  **SOBRE VOCÊ:** Peça um breve RESUMO sobre o perfil profissional da pessoa.

8.  **FINALIZAÇÃO:** Quando todas as informações forem coletadas, defina 'isFinished' como 'true' e forneça uma mensagem de conclusão em 'nextQuestion', como "Seu currículo está pronto! Estou salvando suas informações. Muito obrigado por conversar comigo!".

REGRAS IMPORTANTES:
- FAÇA APENAS UMA PERGUNTA POR VEZ.
- Sempre preencha o objeto 'profile' com os dados coletados até o momento. A cada nova resposta do usuário, você deve adicionar a informação ao objeto 'profile' existente, sem apagar os dados anteriores.
- Se o usuário disser "parar" ou "cancelar", encerre a conversa educadamente e defina 'isFinished' como true.
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

    