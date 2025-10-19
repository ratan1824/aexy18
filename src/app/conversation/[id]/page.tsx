
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { NextPage } from 'next';
import { useParams, useRouter } from 'next/navigation';
import { ConversationHeader } from '@/components/conversation/header';
import { MessageList } from '@/components/conversation/message-list';
import { MessageInput } from '@/components/conversation/message-input';
import { getScenario } from '@/lib/data';
import type { Message, Scenario } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { generateAIResponseAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ConversationSummary, SummaryProps } from '@/components/conversation/summary-card';
import { useFirebase, useUser } from '@/firebase';
import { collection, doc, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const ConversationPage: NextPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user: authUser, isUserLoading } = useUser();
  const { areServicesAvailable, firestore } = useFirebase();
  const scenarioId = Number(params.id);

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [conversationSummary, setConversationSummary] = useState<SummaryProps | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false); // Lock to prevent multiple initializations
  
  const { toast } = useToast();
  
  const [startTime, setStartTime] = useState<Date | null>(null);

  const userAvatar = useMemo(() => PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || '', []);
  const aiAvatar = useMemo(() => PlaceHolderImages.find(img => img.id === 'ai-avatar')?.imageUrl || '', []);

  // Effect for handling redirection
  useEffect(() => {
    if (isUserLoading || !areServicesAvailable) return;

    if (!authUser) {
      router.replace('/auth');
    }
  }, [authUser, isUserLoading, areServicesAvailable, router]);

  // Effect for initializing the conversation
  useEffect(() => {
    // Guards to ensure all dependencies are ready and initialization hasn't already started
    if (!areServicesAvailable || !authUser || !scenarioId || !firestore || !aiAvatar || isInitializing) {
      return;
    }
    
    setIsInitializing(true); // Acquire lock

    const currentScenario = getScenario(scenarioId);
    if (!currentScenario) {
        toast({
            title: "Scenario not found",
            description: "Redirecting to dashboard...",
            variant: "destructive"
        });
        router.replace('/dashboard');
        return;
    }
    
    setScenario(currentScenario);
      
    const conversationsRef = collection(firestore, 'users', authUser.uid, 'conversations');
    const conversationData = {
        scenarioId,
        userId: authUser.uid,
        startedAt: serverTimestamp(),
        status: 'active',
    };
    
    addDoc(conversationsRef, conversationData).then(newConversationRef => {
      setConversationId(newConversationRef.id);
      const initialMessage: Message = {
        id: '0',
        role: 'ai',
        content: currentScenario.initialPrompt,
        timestamp: new Date().toISOString(),
        avatar: aiAvatar,
      };
      setMessages([initialMessage]);
      
      const messagesRef = collection(newConversationRef, 'messages');
      const messageData = { role: 'ai', content: initialMessage.content, createdAt: serverTimestamp() };
      
      // Non-blocking write
      addDoc(messagesRef, messageData).catch(error => {
          const permissionError = new FirestorePermissionError({
              path: messagesRef.path,
              operation: 'create',
              requestResourceData: messageData
          });
          errorEmitter.emit('permission-error', permissionError);
      });

      // Increment the user's conversation count for the day
      const userRef = doc(firestore, 'users', authUser.uid);
      const updateData = { conversationsToday: increment(1) };
      updateDoc(userRef, updateData).catch(error => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
      
      setStartTime(new Date());

    }).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: conversationsRef.path,
            operation: 'create',
            requestResourceData: conversationData
        });
        errorEmitter.emit('permission-error', permissionError);
    });

  }, [scenarioId, authUser, areServicesAvailable, firestore, aiAvatar, router, toast, isInitializing]);


  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading || !scenario || !authUser || !conversationId || !firestore) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      avatar: userAvatar,
    };
    setMessages(prev => [...prev, userMessage]);
    
    const messagesRef = collection(firestore, 'users', authUser.uid, 'conversations', conversationId, 'messages');
    const messageData = { role: 'user', content: userMessage.content, createdAt: serverTimestamp() };
    addDoc(messagesRef, messageData).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: messagesRef.path,
            operation: 'create',
            requestResourceData: messageData
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage]
        .map(msg => `${msg.role === 'ai' ? 'AI' : 'User'}: ${msg.content}`)
        .join('\n');
      
      const result = await generateAIResponseAction({
        scenarioTitle: scenario.title,
        conversationHistory: conversationHistory,
        userMessage: content,
      });

      if (result.aiResponse) {
        const aiMessage: Message = {
          id: String(Date.now() + 1),
          role: 'ai',
          content: result.aiResponse,
          timestamp: new Date().toISOString(),
          feedback: result.feedback,
          avatar: aiAvatar,
        };
        setMessages(prev => [...prev, aiMessage]);
        
        const aiMessageData = { role: 'ai', content: aiMessage.content, feedback: aiMessage.feedback, createdAt: serverTimestamp() };
        addDoc(messagesRef, aiMessageData).catch(error => {
            const permissionError = new FirestorePermissionError({
                path: messagesRef.path,
                operation: 'create',
                requestResourceData: aiMessageData
            });
            errorEmitter.emit('permission-error', permissionError);
        });

      } else {
        throw new Error('No AI response received.');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
      });
      // Rollback the user message on UI if AI fails
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSummary = () => {
    const userMessages = messages.filter(m => m.role === 'user');
    const aiFeedbackMessages = messages.filter(m => m.role === 'ai' && m.feedback);
    const totalMessages = userMessages.length;

    const duration = startTime ? (new Date().getTime() - startTime.getTime()) / 1000 : 0;

    let grammarSum = 0;
    let pronunciationSum = 0;
    let feedbackCount = 0;

    aiFeedbackMessages.forEach(m => {
        if(m.feedback?.grammar || m.feedback?.pronunciation) {
            feedbackCount++;
            grammarSum += m.feedback.grammar?.score || 0;
            pronunciationSum += m.feedback.pronunciation?.score || 0;
        }
    });
    
    // For now, fluency is an average of grammar and pronunciation
    const grammarAvg = feedbackCount > 0 ? Math.round(grammarSum / feedbackCount) : 0;
    const pronunciationAvg = feedbackCount > 0 ? Math.round(pronunciationSum / feedbackCount) : 0;
    const fluencyAvg = Math.round((grammarAvg + pronunciationAvg) / 2);

    setConversationSummary({
        totalMessages: totalMessages,
        duration: duration,
        scores: {
            fluency: fluencyAvg,
            grammar: grammarAvg,
            pronunciation: pronunciationAvg
        }
    });
  }

  const handleEndConversation = () => {
    calculateSummary();
    setIsEnded(true);
  };
  
  if (isUserLoading || !areServicesAvailable || !scenario || !authUser) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <ConversationHeader title={scenario.title} onEndConversation={handleEndConversation} />
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} aiAvatar={aiAvatar} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      {isEnded && conversationSummary && <ConversationSummary summary={conversationSummary} />}
    </div>
  );
};

export default ConversationPage;

    