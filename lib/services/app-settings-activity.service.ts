import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  AppSettingsActivity,
  CreateAppSettingsActivityInput,
} from '@/lib/types/app-settings-activity.types';

const COLLECTION_NAME = 'app_settings_activity';

/**
 * Log app settings activity
 */
export async function logAppSettingsActivity(
  activityData: CreateAppSettingsActivityInput
): Promise<void> {
  try {
    const activityRef = collection(db, COLLECTION_NAME);
    
    await addDoc(activityRef, {
      adminId: activityData.adminId,
      adminName: activityData.adminName,
      adminEmail: activityData.adminEmail,
      changes: activityData.changes,
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error logging app settings activity:', error);
    throw error;
  }
}

/**
 * Get app settings activity history
 */
export async function getAppSettingsActivity(
  limitCount: number = 50
): Promise<AppSettingsActivity[]> {
  try {
    const activityRef = collection(db, COLLECTION_NAME);
    const q = query(
      activityRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const activities: AppSettingsActivity[] = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data(),
      } as AppSettingsActivity);
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting app settings activity:', error);
    throw error;
  }
}
