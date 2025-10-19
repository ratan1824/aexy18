
"use client";

import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { scenarios } from '@/lib/data';
import { useUser, useFirebase, useDoc } from '@/firebase';
import type { User as AppUser } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScenarioCard } from '@/components/dashboard/scenario-card';
import { UpgradeModal } from '@/components/dashboard/upgrade-modal';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';


export default function DashboardPage() {
  const { user: authUser, isUserLoading } = useUser();
  const { firestore, areServicesAvailable } = useFirebase();
  const router = useRouter();
  
  const userDocRef = useMemo(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: userProfile, isLoading: isUserDataLoading } = useDoc<AppUser>(userDocRef);

  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Effect to redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.replace('/auth');
    }
  }, [authUser, isUserLoading, router]);
  
  // Effect to handle user document creation as a fallback.
  // This is crucial for users who might exist in Auth but not in Firestore.
  useEffect(() => {
    if (firestore && authUser && userDocRef && !isUserDataLoading && !userProfile) {
        // If auth is loaded, but profile doc doesn't exist, create it.
        const newUserDoc = {
            id: authUser.uid,
            email: authUser.email,
            tier: 'FREE',
            createdAt: serverTimestamp(),
            conversationsToday: 0,
            streak: 0,
        };
        // Use setDoc to safely create the document.
        setDoc(userDocRef, newUserDoc);
    }
  }, [firestore, authUser, userDocRef, isUserDataLoading, userProfile]);
  
  const isLoading = isUserLoading || isUserDataLoading || !areServicesAvailable;

  // This purely simulates tier changes on the client for the demo.
  const handleTierChange = (newTier: AppUser['tier']) => {
    if (userDocRef) {
        updateDoc(userDocRef, { tier: newTier, conversationsToday: 0 });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
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

  // Once loading is complete, if there's still no profile, show a more specific message.
  if (!userProfile) {
    return <div className="flex h-screen items-center justify-center">Creating your profile...</div>;
  }


  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 animate-in fade-in-0 duration-500">
        <DashboardHeader user={userProfile} onTierChange={handleTierChange} />
        <section className="py-12">
          <h2 className="text-3xl font-bold font-headline mb-8 text-center">Practice Scenarios</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {scenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  user={userProfile}
                  onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
                />
              ))}
            </div>
        </section>
      </main>
      <UpgradeModal isOpen={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </div>
  );
}
