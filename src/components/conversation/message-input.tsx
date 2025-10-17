"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (content.trim()) {
      onSendMessage(content);
      setContent('');
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="p-4 border-t bg-card shrink-0">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Button variant="ghost" size="icon" type="button" disabled={isLoading} className="shrink-0">
            <Mic />
            <span className="sr-only">Use microphone</span>
          </Button>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type or speak..."
            className="resize-none max-h-36"
            rows={1}
            disabled={isLoading}
          />
          <Button variant="default" size="icon" type="submit" disabled={isLoading || !content.trim()} className="shrink-0">
            <Send />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
