"use client";

import Link from 'next/link';
import { ArrowLeft, MoreVertical, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConversationHeaderProps {
  title: string;
  onEndConversation: () => void;
}

export function ConversationHeader({ title, onEndConversation }: ConversationHeaderProps) {
  return (
    <header className="flex items-center justify-between p-2 md:p-4 border-b bg-card shadow-sm shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="font-headline text-lg font-semibold truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onEndConversation}>
            <LogOut className="mr-0 md:mr-2 h-4 w-4" />
            <span className="hidden md:inline">End</span>
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical />
          <span className="sr-only">More options</span>
        </Button>
      </div>
    </header>
  );
}
