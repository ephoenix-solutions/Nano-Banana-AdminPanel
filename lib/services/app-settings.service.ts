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
    if (settingsData.currentVersion !== undefined) {
      updateData.currentVersion = settingsData.currentVersion;
    }
    if (settingsData.latestVersion !== undefined) {
      updateData.latestVersion = settingsData.latestVersion;
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
        currentVersion: '1.0.0',
        latestVersion: '1.0.0',
      };
      
      await setDoc(settingsRef, defaultSettings);
    }
  } catch (error) {
    console.error('Error initializing app settings:', error);
    throw error;
  }
}
