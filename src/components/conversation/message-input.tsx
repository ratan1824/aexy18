
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
  
  // Use a ref to hold the recognition object, ensuring it's stable across renders
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  // This effect runs only once to initialize the speech recognition service
  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
       // Append the new transcript to the existing content
      setContent(prevContent => prevContent + finalTranscript + interimTranscript);
    };

    // This is crucial for UI consistency.
    recognition.onend = () => {
      if (isRecording) {
        setIsRecording(false);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      // 'aborted' can happen if stop() is called. 'no-speech' is a timeout.
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast({
              variant: "destructive",
              title: "Voice Error",
              description: `An error occurred: ${event.error}`,
          });
      }
      setIsRecording(false);
    };

    // Cleanup function to stop recognition if the component unmounts.
    return () => {
      recognition.stop();
    };
  // The empty dependency array ensures this effect runs only once.
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
      setIsRecording(false);
    } else {
      try {
        // Request permission every time, as it can be revoked.
        await navigator.mediaDevices.getUserMedia({ audio: true });
        // Clear previous content when starting a new recording
        setContent(''); 
        recognition.start();
        setIsRecording(true);
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
