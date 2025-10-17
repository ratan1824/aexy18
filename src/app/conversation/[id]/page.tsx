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
import { ConversationSummary, SummaryProps } from '@/components/conversation/summary-card';

const ConversationPage: NextPage = () => {
  const params = useParams();
  const scenarioId = Number(params.id);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [conversationSummary, setConversationSummary] = useState<SummaryProps | null>(null);
  const { toast } = useToast();

  const [userAvatar, setUserAvatar] = useState('');
  const [aiAvatar, setAiAvatar] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);

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
      setStartTime(new Date());
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

  if (!scenario) {
    return <div className="flex h-screen items-center justify-center">Loading scenario...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <ConversationHeader title={scenario.title} onEndConversation={handleEndConversation} />
      <MessageList messages={messages} isLoading={isLoading} aiAvatar={aiAvatar} />
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      {isEnded && conversationSummary && <ConversationSummary summary={conversationSummary} />}
    </div>
  );
};

export default ConversationPage;
