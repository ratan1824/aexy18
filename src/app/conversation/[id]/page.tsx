"use client";

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useParams } from 'next/navigation';
import { ConversationHeader } from '@/components/conversation/header';
import { MessageList } from '@/components/conversation/message-list';
import { MessageInput } from '@/components/conversation/message-input';
import { getScenario } from '@/lib/data';
import type { Message, Scenario } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { generateAIResponseAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ConversationSummary } from '@/components/conversation/summary-card';

const ConversationPage: NextPage = () => {
  const params = useParams();
  const scenarioId = Number(params.id);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const { toast } = useToast();

  const [userAvatar, setUserAvatar] = useState('');
  const [aiAvatar, setAiAvatar] = useState('');

  useEffect(() => {
    setUserAvatar(PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || '');
    setAiAvatar(PlaceHolderImages.find(img => img.id === 'ai-avatar')?.imageUrl || '');
  }, []);

  useEffect(() => {
    const currentScenario = getScenario(scenarioId);
    if (currentScenario && aiAvatar) {
      setScenario(currentScenario);
      const initialMessage: Message = {
        id: '0',
        role: 'ai',
        content: currentScenario.initialPrompt,
        timestamp: new Date().toISOString(),
        avatar: aiAvatar,
      };
      setMessages([initialMessage]);
    }
  }, [scenarioId, aiAvatar]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      avatar: userAvatar,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage]
        .map(msg => `${msg.role === 'ai' ? 'AI' : 'User'}: ${msg.content}`)
        .join('\n');
      
      const result = await generateAIResponseAction({
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
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndConversation = () => {
    setIsEnded(true);
  };

  if (!scenario) {
    return <div className="flex h-screen items-center justify-center">Loading scenario...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <ConversationHeader title={scenario.title} onEndConversation={handleEndConversation} />
      <MessageList messages={messages} isLoading={isLoading} aiAvatar={aiAvatar} />
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      {isEnded && <ConversationSummary />}
    </div>
  );
};

export default ConversationPage;
