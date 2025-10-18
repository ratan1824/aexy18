import { Flame, ShieldCheck, MessageSquare, LogOut } from 'lucide-react';
import Image from 'next/image';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface DashboardHeaderProps {
  user: User;
  onTierChange: (newTier: 'FREE' | 'STANDARD' | 'PREMIUM') => void;
}

export function DashboardHeader({ user, onTierChange }: DashboardHeaderProps) {
  const limit = tiers[user.tier].conversationsLimit;
  const auth = useAuth();
  const headerImage = PlaceHolderImages.find(img => img.id === 'abstract-header');

  return (
    <header className="mb-12 relative overflow-hidden rounded-lg p-8">
       <div className="absolute inset-0">
        {headerImage && (
          <Image
            src={headerImage.imageUrl}
            alt={headerImage.description}
            fill
            className="object-cover"
            data-ai-hint={headerImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="relative z-10">
        <div className='flex justify-between items-start mb-8'>
          <div>
            <h1 className="text-4xl font-bold font-headline text-white">Welcome to Aexy</h1>
            <p className="text-white/80 mt-2">Your daily English practice partner.</p>
          </div>
          <Button variant="outline" onClick={() => auth.signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glassmorphic">
            <CardContent className="p-6 flex items-center">
              <div className="bg-primary/20 text-primary p-3 rounded-full mr-4">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{user.streak} days</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glassmorphic">
            <CardContent className="p-6 flex items-center">
              <div className="bg-primary/20 text-primary p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Limit</p>
                <p className="text-2xl font-bold">{user.conversationsToday}/{limit === 999 ? '∞' : limit}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glassmorphic">
            <CardContent className="p-6 flex items-center justify-between">
              <div className='flex items-center'>
                  <div className="bg-primary/20 text-primary p-3 rounded-full mr-4">
                  <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                  <p className="text-sm font-medium text-muted-foreground">Level</p>
                  <p className="font-bold">{user.tier}</p>
                  </div>
              </div>
              <Select value={user.tier} onValueChange={(value: 'FREE' | 'STANDARD' | 'PREMIUM') => onTierChange(value)}>
                <SelectTrigger className="w-auto ml-4 bg-white/10 border-white/20">
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
