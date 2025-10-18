"use client";

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Info, BrainCircuit, Smile } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

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

const LanguageFeedback = ({ partOfSpeech, emotion }: { partOfSpeech: { token: string; tag: string }[], emotion: string }) => (
    <div className='space-y-3'>
        <div>
            <p className="font-semibold flex items-center gap-2"><BrainCircuit className="h-4 w-4" /> Parts of Speech</p>
            <ScrollArea className="h-24 mt-1">
                <div className="flex flex-wrap gap-1">
                    {partOfSpeech.map((item, index) => (
                    <TooltipProvider key={index} delayDuration={0}>
                        <Tooltip>
                        <TooltipTrigger>
                            <Badge variant="secondary" className="cursor-default">{item.token}</Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center">
                            <p>{item.tag}</p>
                        </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    ))}
                </div>
            </ScrollArea>
        </div>
        <div>
            <p className="font-semibold flex items-center gap-2"><Smile className="h-4 w-4" /> Emotion</p>
            <p className="text-sm capitalize mt-1">{emotion}</p>
        </div>
    </div>
)


export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  const hasFeedback = !isUser && message.feedback && (message.feedback.grammar || message.feedback.pronunciation || message.feedback.language);

  return (
    <div className={cn('flex items-end gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8 self-start shrink-0">
          <AvatarImage src={message.avatar} alt="AI Avatar" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
          <div className={cn(
              'max-w-md lg:max-w-lg rounded-2xl p-3 shadow-md', 
              isUser 
                ? 'bg-primary text-primary-foreground rounded-br-none' 
                : 'bg-secondary text-secondary-foreground rounded-bl-none'
            )}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs text-muted-foreground">{format(new Date(message.timestamp), 'p')}</span>
            {hasFeedback && (
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-background border-border text-foreground w-64 shadow-2xl">
                    <div className="space-y-3 p-2">
                      {message.feedback?.grammar && <FeedbackItem title="Grammar" {...message.feedback.grammar} />}
                      {message.feedback?.pronunciation && <FeedbackItem title="Pronunciation" {...message.feedback.pronunciation} />}
                      {message.feedback?.language && <LanguageFeedback {...message.feedback.language} />}
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
