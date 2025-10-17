
"use client";

import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { ScenarioGrid } from '@/components/dashboard/scenario-grid';
import { scenarios } from '@/lib/data';
import { useUser, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';

export default function DashboardPage() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemo(() => {
    if (!firestore || !authUser?.uid) return null;
    return doc(firestore, "users", authUser.uid);
  }, [firestore, authUser?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<AppUser>(userDocRef);

  useEffect(() => {
    if (!isAuthLoading && !authUser) {
      router.replace('/auth');
    }
  }, [authUser, isAuthLoading, router]);

  const handleTierChange = async (newTier: 'FREE' | 'STANDARD' | 'PREMIUM') => {
    if (userDocRef) {
      await updateDoc(userDocRef, { tier: newTier });
    }
  };
  
  const isLoading = isAuthLoading || isProfileLoading || (authUser && !userProfile);

  if (isLoading) {
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

  if (!userProfile) {
    // This can happen if the doc doesn't exist or there was an auth error
    // Redirecting to auth page for a clean slate.
    router.replace('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <DashboardHeader user={userProfile} onTierChange={handleTierChange} />
        <section>
          <h2 className="text-2xl font-bold font-headline mb-4 text-foreground">Practice Scenarios</h2>
          <ScenarioGrid scenarios={scenarios} user={userProfile} />
        </section>
      </main>
    </div>
  );
}
