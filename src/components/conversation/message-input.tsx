
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

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      // onend will handle setting isRecording to false
    }
  }, [isRecording]);
  
  const startRecording = useCallback(async () => {
    if (!SpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Your browser doesn't support speech recognition. Try Chrome or Firefox.",
      });
      return;
    }

    if (!recognitionRef.current) {
        toast({
            variant: "destructive",
            title: "Initialization Error",
            description: "Speech recognition service could not be started. Please refresh the page.",
        });
        return;
    }

    try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
        setIsRecording(true);
    } catch (err: any) {
        let description = "Could not access the microphone. Please ensure you have granted permission.";
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
  }, [toast]);


  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setContent(finalTranscript + interimTranscript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      finalTranscript = ''; // Reset transcript for next session
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
      // onend will be called subsequently, which will set isRecording to false
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [toast]);


  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };


  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isRecording) {
        stopRecording();
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
