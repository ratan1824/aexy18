"use client";

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MessageBubbleProps {
  message: Message;
}

const FeedbackItem = ({ title, score, issues }: { title: string, score: number, issues: string[] }) => (
  <div>
    <p className="font-semibold">{title}: {score}/100</p>
    {issues.length > 0 && (
      <ul className="list-disc list-inside text-xs">
        {issues.map((issue, index) => <li key={index}>{issue}</li>)}
      </ul>
    )}
  </div>
);

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  const hasFeedback = !isUser && message.feedback && (message.feedback.grammar || message.feedback.pronunciation);

  return (
    <div className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8 self-start shrink-0">
          <AvatarImage src={message.avatar} alt="AI Avatar" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
          <Card className={cn('max-w-md lg:max-w-lg rounded-2xl shadow-md', isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card rounded-bl-none')}>
            <CardContent className="p-3">
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </CardContent>
          </Card>
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs text-muted-foreground">{format(new Date(message.timestamp), 'p')}</span>
            {hasFeedback && (
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-secondary text-secondary-foreground">
                    <div className="space-y-2 p-1">
                      {message.feedback?.grammar && <FeedbackItem title="Grammar" {...message.feedback.grammar} />}
                      {message.feedback?.pronunciation && <FeedbackItem title="Pronunciation" {...message.feedback.pronunciation} />}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 self-start shrink-0">
          <AvatarImage src={message.avatar} alt="User Avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
