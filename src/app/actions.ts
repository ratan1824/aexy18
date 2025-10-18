'use server';
import { generateAIResponse, GenerateAIResponseInput, GenerateAIResponseOutput } from "@/ai/flows/generate-ai-responses";
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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

export async function createUserDocumentAction(userId: string, email: string) {
    const { firestore } = await initializeFirebase();
    const userRef = firestore.collection('users').doc(userId);
    await userRef.set({
        email: email,
        tier: "FREE",
        createdAt: Timestamp.now(),
        conversationsToday: 0,
        streak: 0,
    });
}


export async function createConversationAction(userId: string, scenarioId: number): Promise<string> {
    const { firestore } = await initializeFirebase();
    const conversationsRef = firestore.collection('users').doc(userId).collection('conversations');
    const newConv = await conversationsRef.add({
        scenarioId,
        userId,
        startedAt: Timestamp.now(),
        status: 'active',
    });
    return newConv.id;
}

export async function addMessageAction(userId: string, conversationId: string, message: { role: 'user' | 'ai', content: string, feedback?: any }) {
    const { firestore } = await initializeFirebase();
    const messagesRef = firestore.collection('users').doc(userId).collection('conversations').doc(conversationId).collection('messages');
    await messagesRef.add({
        ...message,
        createdAt: Timestamp.now(),
    });
}


export async function incrementConversationsTodayAction(userId: string) {
    const { firestore } = await initializeFirebase();
    const userRef = firestore.collection('users').doc(userId);
    
    try {
        await firestore.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw "Document does not exist!";
            }
            const newCount = (userDoc.data()?.conversationsToday || 0) + 1;
            transaction.update(userRef, { conversationsToday: newCount });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
}
