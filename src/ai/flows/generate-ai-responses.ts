
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
  scenarioTitle: z.string().describe('The title of the conversation scenario.'),
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
    language: z.object({
        partOfSpeech: z.array(z.object({
            token: z.string().describe('The word token from the user message.'),
            tag: z.string().describe('The part of speech tag for the token (e.g., Noun, Verb, Adjective).'),
        })).describe("An array of words from the user's message and their corresponding part of speech."),
        emotion: z.string().describe("The primary emotion detected in the user's message (e.g., Neutral, Happy, Anxious)."),
    }).describe("Feedback on the user's language usage, including parts of speech and emotional tone."),
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
  prompt: `You are an English tutor. Your current role is determined by the scenario title.
Your persona should match the scenario: {{{scenarioTitle}}}.
For example, if the scenario is 'Restaurant Ordering', you are a waiter. If it's 'Job Interview Practice', you are an interviewer.
Analyze the student's message for grammar, pronunciation, parts of speech, and emotional tone.
Provide a score out of 100 for grammar and pronunciation, along with any issues.
For language analysis, identify the part of speech for each word and the overall emotion of the message.
Then, respond naturally in your assigned role and ask relevant follow-up questions.
IMPORTANT: Aim to conclude the conversation naturally after 3-4 turns. After a few exchanges, ask a concluding question to wrap up the practice session.

Context: {{{conversationHistory}}}
Student: {{{userMessage}}}
`,
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
