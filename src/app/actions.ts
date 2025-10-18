'use server';
import { generateAIResponse, GenerateAIResponseInput, GenerateAIResponseOutput } from "@/ai/flows/generate-ai-responses";
import { getFirestore, doc, addDoc, collection, serverTimestamp, runTransaction } from 'firebase/firestore';
import { initializeFirebase } from "@/firebase/server";

export async function generateAIResponseAction(input: GenerateAIResponseInput): Promise<GenerateAIResponseOutput> {
  try {
    const output = await generateAIResponse(input);
    return output;
  } catch (error) {
    console.error("Error in generateAIResponseAction:", error);
    // Return a valid output object in case of an error
    return { aiResponse: "Sorry, I encountered an error. Please try again." };
  }
}

export async function createConversationAction(userId: string, scenarioId: number): Promise<string> {
    const { firestore } = await initializeFirebase();
    const conversationsRef = collection(firestore, 'users', userId, 'conversations');
    const newConv = await addDoc(conversationsRef, {
        scenarioId,
        userId,
        startedAt: serverTimestamp(),
        status: 'active',
    });
    return newConv.id;
}

export async function addMessageAction(userId: string, conversationId: string, message: { role: 'user' | 'ai', content: string, feedback?: any }) {
    const { firestore } = await initializeFirebase();
    const messagesRef = collection(firestore, 'users', userId, 'conversations', conversationId, 'messages');
    await addDoc(messagesRef, {
        ...message,
        createdAt: serverTimestamp(),
    });
}


export async function incrementConversationsTodayAction(userId: string) {
    const { firestore } = await initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "Document does not exist!";
            }
            const newCount = (userDoc.data().conversationsToday || 0) + 1;
            transaction.update(userRef, { conversationsToday: newCount });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
}
