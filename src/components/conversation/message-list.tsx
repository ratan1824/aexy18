"use client";

import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';
import type { Message } from '@/lib/types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  aiAvatar: string;
}

export function MessageList({ messages, isLoading, aiAvatar }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator avatar={aiAvatar} />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
