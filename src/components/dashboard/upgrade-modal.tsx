"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function UpgradeModal({ isOpen, onOpenChange }: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <Star className="text-accent mr-2" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription>
            Unlock all scenarios and enjoy unlimited conversations by upgrading your plan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>More features with Premium:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            <li>Unlimited conversations</li>
            <li>Access to all scenarios</li>
            <li>Advanced feedback</li>
            <li>Priority support</li>
          </ul>
        </div>
        <DialogFooter>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Upgrade Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
