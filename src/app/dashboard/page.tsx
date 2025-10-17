
"use client";

import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { ScenarioGrid } from '@/components/dashboard/scenario-grid';
import { scenarios } from '@/lib/data';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { User } from '@/lib/types';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { doc } from 'firebase/firestore';

export default function DashboardPage() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: appUser, isLoading: isUserDocLoading } = useDoc<User>(userDocRef);

  useEffect(() => {
    if (!isAuthLoading && !authUser) {
      router.replace('/auth');
    }
  }, [authUser, isAuthLoading, router]);

  const isLoading = isAuthLoading || isUserDocLoading;

  if (isLoading || !appUser) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
          <section>
            <Skeleton className="h-8 w-1/4 mb-4" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <DashboardHeader user={appUser} />
        <section>
          <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">Practice Scenarios</h2>
          <ScenarioGrid scenarios={scenarios} user={appUser} />
        </section>
      </main>
    </div>
  );
}
