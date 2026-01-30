import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Device,
  CreateDeviceInput,
  AddAccountToDeviceInput,
  DeviceLimitCheckResult,
  DeviceAccount,
} from '@/lib/types/device.types';
import { getMaxAccountsPerDevice } from './app-settings.service';

const COLLECTION_NAME = 'devices';

/**
 * Get all devices
 */
export async function getAllDevices(): Promise<Device[]> {
  try {
    const devicesRef = collection(db, COLLECTION_NAME);
    const q = query(devicesRef, orderBy('lastLoginAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const devices: Device[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Device));
    
    return devices;
  } catch (error) {
    console.error('Error getting devices:', error);
    throw error;
  }
}

/**
 * Get a single device by ID
 */
export async function getDeviceById(deviceId: string): Promise<Device | null> {
  try {
    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
      console.warn('Invalid deviceId provided to getDeviceById:', deviceId);
      return null;
    }

    const deviceRef = doc(db, COLLECTION_NAME, deviceId);
    const deviceSnap = await getDoc(deviceRef);
    
    if (deviceSnap.exists()) {
      return {
        id: deviceSnap.id,
        ...deviceSnap.data(),
      } as Device;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting device:', error);
    return null;
  }
}

/**
 * Check if a user can login on a device (device limit check)
 */
export async function checkDeviceLimit(
  deviceId: string,
  userId: string
): Promise<DeviceLimitCheckResult> {
  try {
    const device = await getDeviceById(deviceId);
    const maxLimit = await getMaxAccountsPerDevice();
    
    // Device doesn't exist yet - allow (first account)
    if (!device) {
      return {
        allowed: true,
        currentCount: 0,
        maxLimit,
      };
    }
    
    // User already has account on this device - allow (re-login)
    if (device.accountIds.includes(userId)) {
      return {
        allowed: true,
        reason: 'Existing account',
        currentCount: device.accountCount,
        maxLimit,
      };
    }
    
    // Check if device has reached limit
    if (device.accountCount >= maxLimit) {
      return {
        allowed: false,
        reason: `Device limit reached (${maxLimit} accounts maximum)`,
        currentCount: device.accountCount,
        maxLimit,
        existingAccounts: device.accounts,
      };
    }
    
    // Device has space for new account
    return {
      allowed: true,
      currentCount: device.accountCount,
      maxLimit,
    };
  } catch (error) {
    console.error('Error checking device limit:', error);
    // On error, allow login (fail open)
    return {
      allowed: true,
      reason: 'Error checking limit',
      currentCount: 0,
      maxLimit: 3,
    };
  }
}

/**
 * Create a new device document
 */
export async function createDevice(
  deviceData: CreateDeviceInput
): Promise<void> {
  try {
    const now = Timestamp.now();
    const deviceRef = doc(db, COLLECTION_NAME, deviceData.deviceId);
    
    const newDevice: Omit<Device, 'id'> = {
      deviceId: deviceData.deviceId,
      accountIds: [deviceData.userId],
      accountCount: 1,
      accounts: [
        {
          userId: deviceData.userId,
          email: deviceData.email,
          name: deviceData.name,
          photoURL: deviceData.photoURL,
          firstLoginAt: now,
          lastLoginAt: now,
        },
      ],
      deviceInfo: deviceData.deviceInfo,
      firstLoginAt: now,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    };
    
    await setDoc(deviceRef, newDevice);
  } catch (error) {
    console.error('Error creating device:', error);
    throw error;
  }
}

/**
 * Add account to existing device
 */
export async function addAccountToDevice(
  deviceId: string,
  accountData: AddAccountToDeviceInput
): Promise<void> {
  try {
    const deviceRef = doc(db, COLLECTION_NAME, deviceId);
    const device = await getDeviceById(deviceId);
    
    if (!device) {
      throw new Error('Device not found');
    }
    
    // Check if account already exists
    if (device.accountIds.includes(accountData.userId)) {
      // Update existing account's lastLoginAt
      const updatedAccounts = device.accounts.map((acc) =>
        acc.userId === accountData.userId
          ? { ...acc, lastLoginAt: Timestamp.now() }
          : acc
      );
      
      await updateDoc(deviceRef, {
        accounts: updatedAccounts,
        deviceInfo: accountData.deviceInfo,
        lastLoginAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } else {
      // Add new account
      const now = Timestamp.now();
      const newAccount: DeviceAccount = {
        userId: accountData.userId,
        email: accountData.email,
        name: accountData.name,
        photoURL: accountData.photoURL,
        firstLoginAt: now,
        lastLoginAt: now,
      };
      
      await updateDoc(deviceRef, {
        accountIds: arrayUnion(accountData.userId),
        accountCount: device.accountCount + 1,
        accounts: arrayUnion(newAccount),
        deviceInfo: accountData.deviceInfo,
        lastLoginAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    console.error('Error adding account to device:', error);
    throw error;
  }
}

/**
 * Remove account from device
 */
export async function removeAccountFromDevice(
  deviceId: string,
  userId: string
): Promise<void> {
  try {
    const deviceRef = doc(db, COLLECTION_NAME, deviceId);
    const device = await getDeviceById(deviceId);
    
    if (!device) {
      throw new Error('Device not found');
    }
    
    // Find and remove the account
    const updatedAccounts = device.accounts.filter((acc) => acc.userId !== userId);
    const updatedAccountIds = device.accountIds.filter((id) => id !== userId);
    
    await updateDoc(deviceRef, {
      accountIds: updatedAccountIds,
      accountCount: updatedAccountIds.length,
      accounts: updatedAccounts,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error removing account from device:', error);
    throw error;
  }
}

/**
 * Delete a device
 */
export async function deleteDevice(deviceId: string): Promise<void> {
  try {
    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
      throw new Error('Invalid deviceId provided to deleteDevice');
    }

    const deviceRef = doc(db, COLLECTION_NAME, deviceId);
    await deleteDoc(deviceRef);
  } catch (error) {
    console.error('Error deleting device:', error);
    throw error;
  }
}

/**
 * Get devices by user ID (which devices has this user logged in from)
 */
export async function getDevicesByUserId(userId: string): Promise<Device[]> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return [];
    }

    const devicesRef = collection(db, COLLECTION_NAME);
    const querySnapshot = await getDocs(devicesRef);
    
    const devices: Device[] = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Device))
      .filter((device) => device.accountIds.includes(userId));
    
    return devices;
  } catch (error) {
    console.error('Error getting devices by userId:', error);
    return [];
  }
}

/**
 * Update device info (model, os, appVersion)
 */
export async function updateDeviceInfo(
  deviceId: string,
  deviceInfo: { model: string; os: string; appVersion: string }
): Promise<void> {
  try {
    const deviceRef = doc(db, COLLECTION_NAME, deviceId);
    
    await updateDoc(deviceRef, {
      deviceInfo,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating device info:', error);
    throw error;
  }
}
