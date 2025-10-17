"use client";

import { useState } from 'react';
import { ScenarioCard } from '@/components/dashboard/scenario-card';
import { UpgradeModal } from '@/components/dashboard/upgrade-modal';
import type { Scenario, User } from '@/lib/types';

interface ScenarioGridProps {
  scenarios: Scenario[];
  user: User;
}

export function ScenarioGrid({ scenarios, user }: ScenarioGridProps) {
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map(scenario => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            user={user}
            onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
          />
        ))}
      </div>
      <UpgradeModal isOpen={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </>
  );
}
