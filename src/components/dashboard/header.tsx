
import { Flame, ShieldCheck, MessageSquare, LogOut } from 'lucide-react';
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
import { Button } from '../ui/button';
import { useAuth } from '@/firebase';

interface DashboardHeaderProps {
  user: User;
  onTierChange: (newTier: 'FREE' | 'STANDARD' | 'PREMIUM') => void;
}

export function DashboardHeader({ user, onTierChange }: DashboardHeaderProps) {
  const limit = tiers[user.tier].conversationsLimit;
  const auth = useAuth();

  return (
    <header className="mb-12">
      <div className='flex justify-between items-start'>
        <div>
          <h1 className="text-4xl font-bold font-headline text-foreground">Welcome to Aexy</h1>
          <p className="text-muted-foreground mt-2">Your daily English practice partner.</p>
        </div>
        <Button variant="outline" onClick={() => auth.signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
        </Button>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card className="bg-secondary border-muted">
          <CardContent className="p-6 flex items-center">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Flame className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Streak</p>
              <p className="text-2xl font-bold">{user.streak} days</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-muted">
          <CardContent className="p-6 flex items-center">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Daily Limit</p>
              <p className="text-2xl font-bold">{user.conversationsToday}/{limit === 999 ? '∞' : limit}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-muted">
          <CardContent className="p-6 flex items-center justify-between">
             <div className='flex items-center'>
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                 <p className="font-bold">{user.tier}</p>
                </div>
            </div>
            <Select value={user.tier} onValueChange={(value: 'FREE' | 'STANDARD' | 'PREMIUM') => onTierChange(value)}>
              <SelectTrigger className="w-auto ml-4 bg-background">
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
