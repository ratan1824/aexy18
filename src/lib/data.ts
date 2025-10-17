import type { User, Scenario, Tiers } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) {
    return { src: 'https://placehold.co/600x400', hint: 'placeholder' };
  }
  return { src: image.imageUrl, hint: image.imageHint };
}

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'free@test.com',
    tier: 'FREE',
    conversationsToday: 2,
    streak: 5
  },
  {
    id: '2',
    email: 'premium@test.com',
    tier: 'PREMIUM',
    conversationsToday: 50,
    streak: 100
  }
];

export const scenarios: Scenario[] = [
  {
    id: 1,
    title: 'Job Interview Practice',
    difficulty: 'Intermediate',
    duration: '10 min',
    isPremium: false,
    initialPrompt: "Hi! I'm your interviewer today. Please introduce yourself.",
    image: findImage('job-interview')
  },
  {
    id: 2,
    title: 'Restaurant Ordering',
    difficulty: 'Beginner',
    duration: '5 min',
    isPremium: false,
    initialPrompt: 'Welcome! What would you like to order?',
    image: findImage('restaurant-ordering')
  },
  {
    id: 3,
    title: 'Business Negotiation',
    difficulty: 'Advanced',
    duration: '15 min',
    isPremium: true,
    initialPrompt: "Let's discuss the terms of our partnership.",
    image: findImage('business-negotiation')
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

export const getMockUser = (userId: string = '1'): User => mockUsers.find(u => u.id === userId)!;

export const getScenario = (scenarioId: number): Scenario | undefined => scenarios.find(s => s.id === scenarioId);
