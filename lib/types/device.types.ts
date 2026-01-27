import { Timestamp } from 'firebase/firestore';

/**
 * Account information stored in device document
 */
export interface DeviceAccount {
  userId: string;
  email: string;
  name: string;
  photoURL: string;
  firstLoginAt: Timestamp;
  lastLoginAt: Timestamp;
}

/**
 * Device information
 */
export interface DeviceInfo {
  model: string;      // e.g., "iPhone 14 Pro"
  os: string;         // e.g., "iOS 16.5"
  appVersion: string; // e.g., "1.2.0"
}

/**
 * Device document in devices collection
 * Path: devices/{deviceId}
 */
export interface Device {
  id: string;                    // Document ID (same as deviceId)
  deviceId: string;              // Unique device identifier
  accountIds: string[];          // Array of user IDs
  accountCount: number;          // Quick count (length of accountIds)
  accounts: DeviceAccount[];     // Detailed account info
  deviceInfo: DeviceInfo;        // Device metadata
  firstLoginAt: Timestamp;       // First account login on this device
  lastLoginAt: Timestamp;        // Most recent login
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input for creating a new device
 */
export interface CreateDeviceInput {
  deviceId: string;
  userId: string;
  email: string;
  name: string;
  photoURL: string;
  deviceInfo: DeviceInfo;
}

/**
 * Input for adding account to existing device
 */
export interface AddAccountToDeviceInput {
  userId: string;
  email: string;
  name: string;
  photoURL: string;
  deviceInfo: DeviceInfo;
}

/**
 * Device limit check result
 */
export interface DeviceLimitCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount: number;
  maxLimit: number;
  existingAccounts?: DeviceAccount[];
}
