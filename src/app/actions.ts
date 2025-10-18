'use server';
import { generateAIResponse, GenerateAIResponseInput, GenerateAIResponseOutput } from "@/ai/flows/generate-ai-responses";

export async function generateAIResponseAction(input: GenerateAIResponseInput): Promise<GenerateAIResponseOutput> {
  try {
    const output = await generateAIResponse(input);
    return output;
  } catch (error) {
    console.error("Error in generateAIResponseAction:", error);
    // Return a valid output object in case of an error to prevent app crashes
    return { 
      aiResponse: "Sorry, I encountered an unexpected error and couldn't process your message. Please try again.",
    };
  }
}
