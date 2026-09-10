import { Timestamp } from 'firebase/firestore';

export type PlayerTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Prodigy';

export type RewardCategory = 'Commercial' | 'Development' | 'Prestige';

export type TransactionType = 'Earned' | 'Redeemed' | 'Bonus' | 'Adjustment';

export interface RewardsWallet {
  id: string;
  playerId: string;
  totalPointsBalance: number;
  lifetimePointsEarned: number;
  currentTier: PlayerTier;
  tierScore: number; // For progression tracking
  nextTierThreshold: number;
  lastUpdated: Timestamp | Date | string;
}

export interface RewardTransaction {
  id: string;
  walletId: string;
  playerId: string;
  amount: number;
  type: TransactionType;
  description: string;
  sourceEventId?: string; // Match ID or Achievement ID
  metadata?: Record<string, any>;
  createdAt: Timestamp | Date | string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  pointsValue: number;
  icon?: string;
  requirements: Record<string, any>; // Logic for the achievement
}

export interface ScoredEvent {
  matchId: string;
  playerId: string;
  action: string; // 'run', 'wicket', 'catch', etc.
  value: number;
  impactScore?: number;
  multipliers?: {
    matchImportance: number;
    oppositionStrength: number;
    gameSituation: number;
  };
}
