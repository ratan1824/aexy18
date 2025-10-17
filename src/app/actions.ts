'use server';
import { generateAIResponse, GenerateAIResponseInput, GenerateAIResponseOutput } from "@/ai/flows/generate-ai-responses";

export async function generateAIResponseAction(input: GenerateAIResponseInput): Promise<GenerateAIResponseOutput> {
  try {
    const output = await generateAIResponse(input);
    return output;
  } catch (error) {
    console.error("Error in generateAIResponseAction:", error);
    return { aiResponse: "Sorry, I encountered an error. Please try again." };
  }
}
