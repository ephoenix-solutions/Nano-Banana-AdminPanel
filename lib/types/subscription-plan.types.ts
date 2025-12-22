import { Timestamp } from 'firebase/firestore';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  currency: string;
  durationDays: number;
  generationLimit: number;
  features: string[];
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
  createdBy: string;
  updatedBy?: string;
  updatedAt?: Timestamp;
}

export interface CreateSubscriptionPlanInput {
  name: string;
  price: string;
  currency: string;
  durationDays: number;
  generationLimit: number;
  features: string[];
  isActive?: boolean;
  order: number;
  createdBy: string;
}

export interface UpdateSubscriptionPlanInput {
  name?: string;
  price?: string;
  currency?: string;
  durationDays?: number;
  generationLimit?: number;
  features?: string[];
  isActive?: boolean;
  order?: number;
  updatedBy?: string;
}
