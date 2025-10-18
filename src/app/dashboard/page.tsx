
"use client";

import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { scenarios, getMockUserByTier } from '@/lib/data';
import { useUser, useFirebase, useDoc } from '@/firebase';
import type { User as AppUser } from '@/lib/types';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScenarioCard } from '@/components/dashboard/scenario-card';
import { UpgradeModal } from '@/components/dashboard/upgrade-modal';
import Image from 'next/image';
import { doc } from 'firebase/firestore';


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
  const [displayTier, setDisplayTier] = useState<AppUser['tier']>('FREE');

  // Effect to redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.replace('/auth');
    }
  }, [authUser, isUserLoading, router]);

  // Effect to sync display tier with loaded user profile or default
  useEffect(() => {
    if (userProfile) {
      setDisplayTier(userProfile.tier);
    }
  }, [userProfile]);


  const handleTierChange = (newTier: 'FREE' | 'STANDARD' | 'PREMIUM') => {
    setDisplayTier(newTier);
  };
  
  const isLoading = isUserLoading || isUserDataLoading || !userProfile;
  
  const userForDisplay = useMemo(() => {
    return userProfile ? { ...userProfile, tier: displayTier } : getMockUserByTier(displayTier);
  }, [userProfile, displayTier]);
  
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8 animate-in fade-in-0 duration-500">
        <DashboardHeader user={userForDisplay} onTierChange={handleTierChange} />
        <section className="py-12">
          <h2 className="text-3xl font-bold font-headline mb-8 text-center">Practice Scenarios</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {scenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  user={userForDisplay}
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
