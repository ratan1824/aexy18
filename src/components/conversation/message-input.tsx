
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const initHasRun = useRef(false);
  
  useEffect(() => {
    if (initHasRun.current) return;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }
    initHasRun.current = true;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let final_transcript = '';

    recognition.onresult = (event) => {
      let interim_transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      setContent(final_transcript + interim_transcript);
    };

    recognition.onstart = () => {
      final_transcript = content; // Start with current content if any
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
       if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast({
              variant: "destructive",
              title: "Voice Error",
              description: `An error occurred: ${event.error}`,
          });
      }
      setIsRecording(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleRecording = useCallback(async () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
        toast({
            variant: "destructive",
            title: "Browser Not Supported",
            description: "Your browser doesn't support speech recognition. Try Chrome or Safari.",
        });
        return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognition.start();
      } catch (err: any) {
        let description = "Could not access the microphone. Please ensure you have granted permission in your browser settings.";
        if (err.name === 'NotAllowedError') {
             description = "Microphone access was denied. Please enable it in your browser settings to use voice input.";
        }
        toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: description,
        });
        setIsRecording(false);
      }
    }
  }, [isRecording, toast]);


  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isRecording) {
      recognitionRef.current?.stop();
    }
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
    <div className="p-4 border-t bg-background/80 backdrop-blur-sm shrink-0">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            type="button" 
            onClick={handleToggleRecording}
            disabled={isLoading} 
            className={cn(
                "shrink-0 text-muted-foreground hover:text-foreground", 
                isRecording && "text-primary hover:text-primary/90 animate-pulse"
            )}
          >
            {isRecording ? <Square /> : <Mic />}
            <span className="sr-only">{isRecording ? 'Stop recording' : 'Use microphone'}</span>
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
            placeholder={isRecording ? "Listening..." : "Type or speak..."}
            className="resize-none max-h-36 bg-secondary border-muted focus-visible:ring-primary"
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
