
"use client";

import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { scenarios, getMockUserByTier } from '@/lib/data';
import { useUser } from '@/firebase';
import type { User as AppUser } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScenarioCard } from '@/components/dashboard/scenario-card';
import { UpgradeModal } from '@/components/dashboard/upgrade-modal';

export default function DashboardPage() {
  const { user: authUser, isUserLoading } = useUser();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading) {
      if (authUser) {
        // In a real app, you'd fetch this from Firestore.
        // For now, we'll use a mock user.
        setUserProfile(getMockUserByTier('PREMIUM'));
      } else {
        router.replace('/auth');
      }
    }
  }, [authUser, isUserLoading, router]);

  const handleTierChange = (newTier: 'FREE' | 'STANDARD' | 'PREMIUM') => {
    setUserProfile(getMockUserByTier(newTier));
  };
  
  const isLoading = isUserLoading || !userProfile;

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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <DashboardHeader user={userProfile} onTierChange={handleTierChange} />
        <section className="py-12">
          <h2 className="text-3xl font-bold font-headline mb-8 text-center text-foreground">Practice Scenarios</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
