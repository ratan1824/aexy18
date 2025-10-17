"use client";

import { useState } from 'react';
import { ScenarioCard } from '@/components/dashboard/scenario-card';
import { UpgradeModal } from '@/components/dashboard/upgrade-modal';
import type { Scenario, User } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface ScenarioGridProps {
  scenarios: Scenario[];
  user: User;
}

export function ScenarioGrid({ scenarios, user }: ScenarioGridProps) {
  const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);

  return (
    <>
      <Carousel 
        opts={{
          align: "start",
        }}
        className="w-full max-w-sm"
      >
        <CarouselContent>
          {scenarios.map((scenario, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <ScenarioCard
                  scenario={scenario}
                  user={user}
                  onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <UpgradeModal isOpen={isUpgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </>
  );
}
