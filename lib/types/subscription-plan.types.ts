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
}
