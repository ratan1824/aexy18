
import { Flame, ShieldCheck, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { User } from '@/lib/types';
import { tiers } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DashboardHeaderProps {
  user: User;
  onTierChange: (newTier: 'FREE' | 'STANDARD' | 'PREMIUM') => void;
}

export function DashboardHeader({ user, onTierChange }: DashboardHeaderProps) {
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
              <p className="text-2xl font-bold">{user.conversationsToday}/{limit === 999 ? '∞' : limit}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
             <div className='flex items-center'>
                <div className="bg-secondary p-3 rounded-full mr-4">
                <ShieldCheck className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                 <p className="font-bold">{user.tier}</p>
                </div>
            </div>
            <Select value={user.tier} onValueChange={(value: 'FREE' | 'STANDARD' | 'PREMIUM') => onTierChange(value)}>
              <SelectTrigger className="w-auto ml-4">
                <SelectValue placeholder="Change Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">FREE</SelectItem>
                <SelectItem value="STANDARD">STANDARD</SelectItem>
                <SelectItem value="PREMIUM">PREMIUM</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </header>
  );
}
