import type { User, Scenario, Tiers } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) {
    return { src: 'https://placehold.co/600x400', hint: 'placeholder' };
  }
  return { src: image.imageUrl, hint: image.imageHint };
}

export const mockUsers: { [key in User['tier']]: User } = {
  FREE: {
    id: '1',
    email: 'free@test.com',
    tier: 'FREE',
    conversationsToday: 2,
    streak: 0
  },
  STANDARD: {
    id: '2',
    email: 'standard@test.com',
    tier: 'STANDARD',
    conversationsToday: 10,
    streak: 0
  },
  PREMIUM: {
    id: '3',
    email: 'premium@test.com',
    tier: 'PREMIUM',
    conversationsToday: 50,
    streak: 0
  }
};

export const getMockUserByTier = (tier: User['tier']): User => mockUsers[tier];


export const scenarios: Scenario[] = [
  {
    id: 1,
    title: 'Job Interview Practice',
    difficulty: 'Intermediate',
    duration: '10 min',
    isPremium: false,
    initialPrompt: "Hi! I'm your interviewer today. Please introduce yourself.",
    image: findImage('job-interview-office')
  },
  {
    id: 2,
    title: 'Restaurant Ordering',
    difficulty: 'Beginner',
    duration: '5 min',
    isPremium: false,
    initialPrompt: 'Welcome! What would you like to order?',
    image: findImage('ordering-food-cafe')
  },
  {
    id: 3,
    title: 'Business Negotiation',
    difficulty: 'Advanced',
    duration: '15 min',
    isPremium: true,
    initialPrompt: "Let's discuss the terms of our partnership.",
    image: findImage('negotiating-deal-boardroom')
  }
];

export const tiers: Tiers = {
  FREE: {
    conversationsLimit: 3
  },
  STANDARD: {
    conversationsLimit: 15
  },
  PREMIUM: {
    conversationsLimit: 999
  }
};

export const getScenario = (scenarioId: number): Scenario | undefined => scenarios.find(s => s.id === scenarioId);
