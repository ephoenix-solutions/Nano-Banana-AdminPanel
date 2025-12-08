import { Timestamp } from 'firebase/firestore';

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  isActive: boolean;
  paymentMethod: string;
  transactionId: string;
}

export interface CreateUserSubscriptionInput {
  userId: string;
  planId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  isActive?: boolean;
  paymentMethod: string;
  transactionId: string;
}

export interface UpdateUserSubscriptionInput {
  userId?: string;
  planId?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  isActive?: boolean;
  paymentMethod?: string;
  transactionId?: string;
}
