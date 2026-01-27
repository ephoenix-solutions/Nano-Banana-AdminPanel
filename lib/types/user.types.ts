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

// ============================================
// LOGIN HISTORY TYPES (Subcollection)
// ============================================

/**
 * Device information captured during login
 */
export interface DeviceInfo {
  model: string;      // Device model (e.g., "iPhone 14 Pro", "Samsung Galaxy S23")
  os: string;         // Operating system (e.g., "iOS 16.5", "Android 13")
  appVersion: string; // App version (e.g., "1.2.0")
}

/**
 * Login history record stored in subcollection
 * Path: users/{userId}/loginHistory/{loginId}
 */
export interface LoginHistory {
  id: string;              // Auto-generated document ID
  loginTime: Timestamp;    // When the user logged in
  deviceInfo: DeviceInfo;  // Device information
  deviceId: string;        // Unique device identifier
}

/**
 * Input for creating a new login history record
 */
export interface CreateLoginHistoryInput {
  deviceInfo: DeviceInfo;
  deviceId: string;
}
