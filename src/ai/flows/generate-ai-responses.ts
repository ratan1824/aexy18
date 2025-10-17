'use server';

/**
 * @fileOverview A flow to generate contextual and natural-sounding responses using the Gemini API.
 *
 * - generateAIResponse - A function that generates AI responses based on conversation history and user message.
 * - GenerateAIResponseInput - The input type for the generateAIResponse function.
 * - GenerateAIResponseOutput - The return type for the generateAIResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAIResponseInputSchema = z.object({
  conversationHistory: z.string().describe('The history of the conversation.'),
  userMessage: z.string().describe('The user message to respond to.'),
});

export type GenerateAIResponseInput = z.infer<typeof GenerateAIResponseInputSchema>;

const GenerateAIResponseOutputSchema = z.object({
  aiResponse: z.string().describe('The AI generated response.'),
  feedback: z.object({
    grammar: z.object({
      score: z.number().describe('The grammar score.'),
      issues: z.array(z.string()).describe('The grammar issues.'),
    }).optional(),
    pronunciation: z.object({
      score: z.number().describe('The pronunciation score.'),
      issues: z.array(z.string()).describe('The pronunciation issues.'),
    }).optional(),
  }).optional(),
});

export type GenerateAIResponseOutput = z.infer<typeof GenerateAIResponseOutputSchema>;

export async function generateAIResponse(input: GenerateAIResponseInput): Promise<GenerateAIResponseOutput> {
  return generateAIResponseFlow(input);
}

const generateAIResponsePrompt = ai.definePrompt({
  name: 'generateAIResponsePrompt',
  input: {schema: GenerateAIResponseInputSchema},
  output: {schema: GenerateAIResponseOutputSchema},
  prompt: `You are an English tutor conducting a job interview practice.
Context: {{{conversationHistory}}}
Student: {{{userMessage}}}
Respond naturally and ask follow-up questions.`,
});

const generateAIResponseFlow = ai.defineFlow(
  {
    name: 'generateAIResponseFlow',
    inputSchema: GenerateAIResponseInputSchema,
    outputSchema: GenerateAIResponseOutputSchema,
  },
  async input => {
    const {output} = await generateAIResponsePrompt(input);
    return output!;
  }
);
