import { Flame, ShieldCheck, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/lib/types';
import { tiers } from '@/lib/data';

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const limit = tiers[user.tier].conversationsLimit;

  return (
    <header className="mb-8">
      <h1 className="text-4xl font-bold font-headline text-foreground">Welcome to Aexy</h1>
      <p className="text-muted-foreground mt-2">Your daily English practice partner.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-accent/20 p-3 rounded-full mr-4">
              <Flame className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold">{user.streak} days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-primary/20 p-3 rounded-full mr-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Daily Limit</p>
              <p className="text-2xl font-bold">{user.conversationsToday}/{limit}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-secondary p-3 rounded-full mr-4">
              <ShieldCheck className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Level</p>
              <Badge variant={user.tier === 'PREMIUM' ? 'default' : 'secondary' } className="text-base">{user.tier}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </header>
  );
}
