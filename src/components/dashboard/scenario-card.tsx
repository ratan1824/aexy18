"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Lock, Clock, ArrowRight } from 'lucide-react';
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
      "group flex flex-col overflow-hidden transition-all duration-300 ease-in-out h-full glassmorphic shadow-2xl shadow-primary/5 hover:shadow-primary/20 hover:-translate-y-1",
      isDisabled && "opacity-60 grayscale"
      )}>
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={scenario.image.src}
            alt={scenario.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={scenario.image.hint}
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className='flex justify-between items-center mb-2'>
            <Badge variant={difficultyBadgeVariant[scenario.difficulty]} className="mb-2">{scenario.difficulty}</Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1.5 h-4 w-4" />
              <span>{scenario.duration}</span>
            </div>
          </div>
          <CardTitle className="font-headline text-2xl mb-2">{scenario.title}</CardTitle>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 mt-auto">
        <Button
          asChild={!isDisabled}
          disabled={isDisabled}
          onClick={handleButtonClick}
          className="w-full text-lg py-6"
          variant={isLockedForTier ? 'secondary' : 'default'}
        >
          {isLockedForTier ? (
            <div className="flex items-center">
              <Lock className="mr-2 h-5 w-5" /> Upgrade to Premium
            </div>
          ) : (
            <Link href={`/conversation/${scenario.id}`} className='flex items-center justify-center'>
              {isLimitReached ? 'Daily Limit Reached' : 'Start Practice'}
              {!isLimitReached && <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />}
            </Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
