'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { scenarios } from '@/lib/data';
import { ArrowLeft, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ConversationItem {
  id: string;
  scenarioId: number;
  startedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const HistoryPage = () => {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const conversationsQuery = useMemo(() => {
    if (!authUser || !firestore) return null;
    return query(collection(firestore, 'users', authUser.uid, 'conversations'), orderBy('startedAt', 'desc'));
  }, [authUser, firestore]);

  const { data: conversations, isLoading: areConversationsLoading } = useCollection<ConversationItem>(conversationsQuery);

  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.replace('/auth');
    }
  }, [authUser, isUserLoading, router]);

  const isLoading = isUserLoading || areConversationsLoading;

  if (isLoading) {
    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">Conversation History</h1>
            </div>
            
            {conversations && conversations.length > 0 ? (
                 <div className="space-y-4">
                    {conversations.map((convo) => {
                        const scenario = scenarios.find(s => s.id === convo.scenarioId);
                        const date = convo.startedAt ? new Date(convo.startedAt.seconds * 1000) : new Date();

                        return (
                        <Card key={convo.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{scenario?.title || 'Conversation'}</span>
                                     <span className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {format(date, 'PPP')}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Practice session for {scenario?.difficulty} level.
                                </p>
                                <Button variant="link" className="p-0 h-auto mt-4" asChild>
                                    <Link href={`/conversation/history/${convo.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )})}
                 </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No Conversations Yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Start a practice scenario to see your history here.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/dashboard">Start Practicing</Link>
                    </Button>
                </div>
            )}
        </div>
    </main>
  );
};

export default HistoryPage;
