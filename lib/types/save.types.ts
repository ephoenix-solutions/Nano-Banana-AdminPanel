import { Timestamp } from 'firebase/firestore';

/**
 * Save document structure
 * One document per user containing all their saved prompt IDs
 */
export interface Save {
  id: string; // Document ID (same as userId)
  userId: string;
  promptIds: string[]; // Array of saved prompt IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input for creating a new save document
 */
export interface CreateSaveInput {
  userId: string;
  promptIds?: string[];
}

/**
 * Input for updating save document
 */
export interface UpdateSaveInput {
  promptIds: string[];
}
