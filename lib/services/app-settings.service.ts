import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  AppSettings,
  UpdateAppSettingsInput,
} from '@/lib/types/app-settings.types';

const COLLECTION_NAME = 'app_settings';
const DOCUMENT_ID = 'app_config';

/**
 * Get app settings
 */
export async function getAppSettings(): Promise<AppSettings | null> {
  try {
    const settingsRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      return {
        id: settingsSnap.id,
        ...settingsSnap.data(),
      } as AppSettings;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting app settings:', error);
    throw error;
  }
}

/**
 * Update app settings
 */
export async function updateAppSettings(
  settingsData: UpdateAppSettingsInput
): Promise<void> {
  try {
    const settingsRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    const updateData: Record<string, any> = {};
    
    if (settingsData.languagesSupported !== undefined) {
      updateData.languagesSupported = settingsData.languagesSupported;
    }
    if (settingsData.privacyPolicy !== undefined) {
      updateData.privacyPolicy = settingsData.privacyPolicy;
    }
    if (settingsData.terms !== undefined) {
      updateData.terms = settingsData.terms;
    }
    if (settingsData.minimumVersion !== undefined) {
      updateData.minimumVersion = settingsData.minimumVersion;
    }
    if (settingsData.liveVersion !== undefined) {
      updateData.liveVersion = settingsData.liveVersion;
    }
    if (settingsData.banner !== undefined) {
      updateData.banner = settingsData.banner;
    }
    if (settingsData.maxAccountsPerDevice !== undefined) {
      // Validate minimum value
      if (settingsData.maxAccountsPerDevice < 1) {
        throw new Error('maxAccountsPerDevice must be at least 1');
      }
      updateData.maxAccountsPerDevice = settingsData.maxAccountsPerDevice;
    }
    
    await updateDoc(settingsRef, updateData);
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }
}

/**
 * Initialize app settings if not exists
 */
export async function initializeAppSettings(): Promise<void> {
  try {
    const settingsRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      const defaultSettings: Omit<AppSettings, 'id'> = {
        languagesSupported: ['en'],
        privacyPolicy: '',
        terms: '',
        minimumVersion: '1.0.0',
        liveVersion: '1.0.0',
        banner: '',
        maxAccountsPerDevice: 3,
      };
      
      await setDoc(settingsRef, defaultSettings);
    }
  } catch (error) {
    console.error('Error initializing app settings:', error);
    throw error;
  }
}

/**
 * Get maximum accounts per device
 * Fetches directly from Firestore without caching
 */
export async function getMaxAccountsPerDevice(): Promise<number> {
  try {
    const settings = await getAppSettings();
    const limit = settings?.maxAccountsPerDevice || 3;
    
    // Validate and sanitize
    if (typeof limit !== 'number' || limit < 1) {
      console.warn('Invalid maxAccountsPerDevice value, using default:', limit);
      return 3;
    }
    
    return limit;
  } catch (error) {
    console.error('Error fetching maxAccountsPerDevice, using default:', error);
    return 3; // Fallback to safe default
  }
}
