'use server';

/**
 * @fileOverview An AI agent that provides grammar and pronunciation feedback during a conversation.
 *
 * - provideConversationFeedback - A function that handles the conversation feedback process.
 * - ProvideConversationFeedbackInput - The input type for the provideConversationFeedback function.
 * - ProvideConversationFeedbackOutput - The return type for the provideConversationFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideConversationFeedbackInputSchema = z.object({
  userMessage: z.string().describe('The latest message from the user.'),
  conversationHistory: z
    .string()
    .describe('The history of the conversation up to this point.'),
});
export type ProvideConversationFeedbackInput = z.infer<
  typeof ProvideConversationFeedbackInputSchema
>;

const ProvideConversationFeedbackOutputSchema = z.object({
  grammarFeedback: z.object({
    score: z.number().describe('The grammar score for the user message.'),
    issues: z.array(z.string()).describe('A list of grammar issues.'),
  }),
  pronunciationFeedback: z.object({
    score: z
      .number()
      .describe('The pronunciation score for the user message.'),
    issues: z.array(z.string()).describe('A list of pronunciation issues.'),
  }),
  aiResponse: z.string().describe('The AI response to the user message.'),
});
export type ProvideConversationFeedbackOutput = z.infer<
  typeof ProvideConversationFeedbackOutputSchema
>;

export async function provideConversationFeedback(
  input: ProvideConversationFeedbackInput
): Promise<ProvideConversationFeedbackOutput> {
  return provideConversationFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideConversationFeedbackPrompt',
  input: {schema: ProvideConversationFeedbackInputSchema},
  output: {schema: ProvideConversationFeedbackOutputSchema},
  prompt: `You are an AI English tutor providing feedback on a user's English language skills during a conversation.

You will receive the user's latest message and the conversation history. You will provide feedback on the user's grammar and pronunciation, and you will also generate an appropriate AI response to the user's message.

User Message: {{{userMessage}}}
Conversation History: {{{conversationHistory}}}

Provide detailed feedback on both grammar and pronunciation, including specific issues and a score for each.
`,
});

const provideConversationFeedbackFlow = ai.defineFlow(
  {
    name: 'provideConversationFeedbackFlow',
    inputSchema: ProvideConversationFeedbackInputSchema,
    outputSchema: ProvideConversationFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
