"use client";

import { Flame, ShieldCheck, MessageSquare, LogOut, History } from 'lucide-react';
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
import Link from 'next/link';

interface DashboardHeaderProps {
  user: User;
  onTierChange: (newTier: 'FREE' | 'STANDARD' | 'PREMIUM') => void;
}

export function DashboardHeader({ user, onTierChange }: DashboardHeaderProps) {
  const limit = tiers[user.tier].conversationsLimit;
  const auth = useAuth();

  return (
    <header className="mb-12 relative overflow-hidden rounded-lg p-8 bg-primary text-primary-foreground">
      <div className="relative z-10">
        <div className='flex justify-between items-start mb-8'>
          <div>
            <h1 className="text-4xl font-bold font-headline text-primary-foreground">Welcome to Aexy</h1>
            <p className="text-primary-foreground/80 mt-2">Your daily English practice partner.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
              <Link href="/dashboard/history">
                <History className="mr-2 h-4 w-4" />
                History
              </Link>
            </Button>
            <Button variant="outline" onClick={() => auth.signOut()} className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glassmorphic bg-primary-foreground/10 border-none text-primary-foreground">
            <CardContent className="p-6 flex items-center">
              <div className="bg-primary-foreground/10 text-primary-foreground p-3 rounded-full mr-4">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-foreground/80">Streak</p>
                <p className="text-2xl font-bold">{user.streak} days</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glassmorphic bg-primary-foreground/10 border-none text-primary-foreground">
            <CardContent className="p-6 flex items-center">
              <div className="bg-primary-foreground/10 text-primary-foreground p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-foreground/80">Daily Limit</p>
                <p className="text-2xl font-bold">{user.conversationsToday}/{limit === 999 ? '∞' : limit}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glassmorphic bg-primary-foreground/10 border-none text-primary-foreground">
            <CardContent className="p-6 flex items-center justify-between">
              <div className='flex items-center'>
                  <div className="bg-primary-foreground/10 text-primary-foreground p-3 rounded-full mr-4">
                  <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                  <p className="text-sm font-medium text-primary-foreground/80">Level</p>
                  <p className="font-bold">{user.tier}</p>
                  </div>
              </div>
              <Select value={user.tier} onValueChange={(value: 'FREE' | 'STANDARD' | 'PREMIUM') => onTierChange(value)}>
                <SelectTrigger className="w-auto ml-4 bg-transparent border-primary-foreground/20 text-primary-foreground">
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
      </div>
    </header>
  );
}
