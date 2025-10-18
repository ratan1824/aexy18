
"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && window.SpeechRecognition) ||
  (typeof window !== 'undefined' && window.webkitSpeechRecognition);

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const finalTranscriptRef = useRef<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setContent(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please enable microphone permissions in your browser settings to use the voice input feature.",
        });
      }
      setIsRecording(false);
    };
    
    recognition.onend = () => {
        setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [toast]);


  const handleToggleRecording = async () => {
    if (!SpeechRecognition) {
        toast({
            variant: "destructive",
            title: "Browser Not Supported",
            description: "Your browser doesn't support speech recognition. Try Chrome or Firefox.",
        });
        return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
       try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        finalTranscriptRef.current = content; // Start with current text
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Could not access the microphone. Please ensure you have granted permission.",
        });
      }
    }
  };


  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isRecording) {
        recognitionRef.current?.stop();
    }
    if (content.trim()) {
      onSendMessage(content);
      setContent('');
      finalTranscriptRef.current = '';
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
                isRecording && "text-primary hover:text-primary/90"
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
