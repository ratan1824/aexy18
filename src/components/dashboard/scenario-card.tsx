"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Lock, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Scenario, User } from '@/lib/types';
import { tiers } from '@/lib/data';
import { cn } from '@/lib/utils';

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
    <Card className={cn(
      "flex flex-col overflow-hidden transition-all duration-300 ease-in-out h-full",
      "transform-style-3d hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
      )}>
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={scenario.image.src}
            alt={scenario.title}
            fill
            className="object-cover"
            data-ai-hint={scenario.image.hint}
          />
           {isDisabled && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Lock className="text-white h-8 w-8" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="flex-grow">
          <Badge variant={difficultyBadgeVariant[scenario.difficulty]} className="mb-2">{scenario.difficulty}</Badge>
          <CardTitle className="font-headline text-xl mb-2">{scenario.title}</CardTitle>
        </div>
        <div className="flex items-center text-sm text-muted-foreground pt-2">
          <Clock className="mr-2 h-4 w-4" />
          <span>{scenario.duration}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button
          asChild={!isDisabled}
          disabled={isDisabled}
          onClick={handleButtonClick}
          className="w-full"
          variant={isLockedForTier ? 'secondary' : 'default'}
        >
          {isLockedForTier ? (
            <div className="flex items-center">
              <Lock className="mr-2 h-4 w-4" /> Upgrade to Premium
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
