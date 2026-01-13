import { Timestamp } from 'firebase/firestore';

export interface UserGeneration {
  id: string; // Auto-generated document ID
  userId: string; // Reference to user
  promptId: string; // Which prompt was used
  promptText: string; // The actual prompt text used
  imageUrl: string; // Generated image URL (if stored)
  generationStatus: 'pending' | 'success' | 'failed'; // Status
  errorMessage?: string; // If failed
  metadata: {
    model?: string; // AI model used
    parameters?: Record<string, any>; // Generation parameters
    processingTime?: number; // Time taken in ms
  };
  createdAt: Timestamp;
  subscriptionId?: string; // Which subscription was active
  planId?: string; // Which plan was used
}

export interface CreateUserGenerationInput {
  userId: string;
  promptId: string;
  promptText: string;
  imageUrl?: string;
  generationStatus: 'pending' | 'success' | 'failed';
  errorMessage?: string;
  metadata?: {
    model?: string;
    parameters?: Record<string, any>;
    processingTime?: number;
  };
  subscriptionId?: string;
  planId?: string;
}

export interface UpdateUserGenerationInput {
  imageUrl?: string;
  generationStatus?: 'pending' | 'success' | 'failed';
  errorMessage?: string;
  metadata?: {
    model?: string;
    parameters?: Record<string, any>;
    processingTime?: number;
  };
}
