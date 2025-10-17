"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Lock, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Scenario, User } from '@/lib/types';
import { tiers } from '@/lib/data';

interface ScenarioCardProps {
  scenario: Scenario;
  user: User;
  onOpenUpgradeModal: () => void;
}

export function ScenarioCard({ scenario, user, onOpenUpgradeModal }: ScenarioCardProps) {
  const limit = tiers[user.tier].conversationsLimit;
  const isLimitReached = user.conversationsToday >= limit;
  const isLockedForTier = user.tier === 'FREE' && scenario.isPremium;
  const isDisabled = isLimitReached || isLockedForTier;

  const handleButtonClick = (e: React.MouseEvent) => {
    if (isLockedForTier) {
      e.preventDefault();
      onOpenUpgradeModal();
    }
  };

  const difficultyBadgeVariant = {
    Beginner: 'secondary',
    Intermediate: 'default',
    Advanced: 'destructive',
  } as const;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:scale-105 duration-300">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={scenario.image.src}
            alt={scenario.title}
            fill
            className="object-cover"
            data-ai-hint={scenario.image.hint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant={difficultyBadgeVariant[scenario.difficulty]} className="mb-2">{scenario.difficulty}</Badge>
        <CardTitle className="font-headline text-xl mb-2">{scenario.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          <span>{scenario.duration}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          asChild={!isDisabled}
          disabled={isDisabled}
          onClick={handleButtonClick}
          className="w-full"
          variant={isLockedForTier ? 'secondary' : 'default'}
        >
          {isLockedForTier ? (
            <div className="flex items-center">
              <Lock className="mr-2 h-4 w-4" /> Locked
            </div>
          ) : (
            <Link href={`/conversation/${scenario.id}`}>
              {isLimitReached ? 'Daily Limit Reached' : 'Start Practice'}
            </Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
