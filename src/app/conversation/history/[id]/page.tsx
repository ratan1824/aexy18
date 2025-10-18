
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirebase, useCollection, useDoc } from '@/firebase';
import { collection, doc, query, orderBy, type Firestore, type DocumentData, type CollectionReference, type Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { scenarios } from '@/lib/data';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageList } from '@/components/conversation/message-list';
import type { Message, Scenario } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ConversationData {
  id: string;
  scenarioId: number;
  startedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

interface MessageData extends Omit<Message, 'timestamp'> {
    createdAt: Timestamp;
}

const ConversationHistoryDetail = () => {
  const { user: authUser, isUserLoading } = useUser();
  const { areServicesAvailable, firestore } = useFirebase();
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [userAvatar, setUserAvatar] = useState('');
  const [aiAvatar, setAiAvatar] = useState('');

  useEffect(() => {
    setUserAvatar(PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || '');
    setAiAvatar(PlaceHolderImages.find(img => img.id === 'ai-avatar')?.imageUrl || '');
  }, []);

  const conversationRef = useMemo(() => {
    if (!firestore || !authUser || !conversationId) return null;
    return doc(firestore, 'users', authUser.uid, 'conversations', conversationId);
  }, [firestore, authUser, conversationId]);

  const messagesQuery = useMemo(() => {
    if (!conversationRef) return null;
    return query(collection(conversationRef, 'messages'), orderBy('createdAt', 'asc'));
  }, [conversationRef]);

  const { data: conversation, isLoading: isConversationLoading } = useDoc<ConversationData>(conversationRef);
  const { data: messages, isLoading: areMessagesLoading } = useCollection<MessageData>(messagesQuery as CollectionReference<DocumentData> | Query<DocumentData, DocumentData> | null | undefined);

  const scenario = useMemo(() => {
    if (!conversation) return null;
    return scenarios.find(s => s.id === conversation.scenarioId);
  }, [conversation]);

  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.replace('/auth');
    }
  }, [authUser, isUserLoading, router]);

  const isLoading = isUserLoading || !areServicesAvailable || isConversationLoading || areMessagesLoading || !scenario;

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-6 w-48" />
          </div>
        </header>
        <div className="flex-1 p-6 space-y-6">
            <Skeleton className="h-20 w-3/4" />
            <Skeleton className="h-20 w-3/4 ml-auto" />
            <Skeleton className="h-16 w-1/2" />
        </div>
      </div>
    );
  }

  const formattedMessages: Message[] = messages ? messages.map(msg => ({
    ...msg,
    avatar: msg.role === 'user' ? userAvatar : aiAvatar,
    timestamp: msg.createdAt?.toDate().toISOString() || new Date().toISOString()
  })) : [];


  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-2 md:p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/history">
              <ArrowLeft />
              <span className="sr-only">Back to History</span>
            </Link>
          </Button>
          <h1 className="font-headline text-lg font-semibold truncate">{scenario?.title || 'Conversation'}</h1>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        {formattedMessages.length > 0 ? (
          <MessageList messages={formattedMessages} isLoading={false} aiAvatar={aiAvatar} />
        ) : (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No messages in this conversation.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistoryDetail;
