export interface User {
  id: string;
  email: string;
  tier: 'FREE' | 'STANDARD' | 'PREMIUM';
  conversationsToday: number;
  streak: number;
}

export interface Scenario {
  id: number;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  isPremium: boolean;
  initialPrompt: string;
  image: {
    src: string;
    hint: string;
  };
}

export interface TierDetails {
  conversationsLimit: number;
}

export type Tiers = {
  [key in User['tier']]: TierDetails;
};

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  feedback?: {
    grammar?: {
      score: number;
      issues: string[];
    };
    pronunciation?: {
      score: number;
      issues: string[];
    };
    language?: {
      partOfSpeech: { token: string; tag: string }[];
      emotion: string;
    };
  };
  avatar: string;
}
