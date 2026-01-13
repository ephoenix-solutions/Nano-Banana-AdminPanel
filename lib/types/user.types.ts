import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  createdAt: Timestamp;
  createdBy?: string; // User ID of who created this user
  email: string;
  language: string;
  lastLogin: Timestamp;
  name: string;
  photoURL: string;
  provider: string;
  role: string; // 'user' or 'admin'
  password?: string; // Hashed password (optional for backward compatibility)
  
  // Generation tracking fields
  generatedCount: number; // Total images generated (lifetime)
  currentPeriodCount: number; // Count for current subscription period
  lastResetDate: Timestamp; // When the count was last reset
}

export interface CreateUserInput {
  email: string;
  language: string;
  name: string;
  photoURL?: string;
  provider: string;
  role?: string; // Optional, defaults to 'user'
  password?: string; // Plain password (will be hashed before saving)
  confirmPassword?: string; // For validation only (not saved)
  generatedCount?: number; // Optional, defaults to 0
  currentPeriodCount?: number; // Optional, defaults to 0
}

export interface UpdateUserInput {
  email?: string;
  language?: string;
  name?: string;
  photoURL?: string;
  provider?: string;
  role?: string;
  password?: string; // Plain password (will be hashed before saving)
  confirmPassword?: string; // For validation only (not saved)
  generatedCount?: number;
  currentPeriodCount?: number;
  lastResetDate?: Timestamp;
}
