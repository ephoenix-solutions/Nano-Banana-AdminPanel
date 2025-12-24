import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Save,
  CreateSaveInput,
  UpdateSaveInput,
} from '@/lib/types/save.types';

const COLLECTION_NAME = 'saves';
const PROMPTS_COLLECTION = 'prompt';

/**
 * Get user's saved prompts
 * Searches by userId field, not document ID
 * @param userId - User ID
 * @returns Save document or null if not found
 */
export async function getUserSaves(userId: string): Promise<Save | null> {
  try {
    // First, try to get by document ID (for new documents)
    const saveRef = doc(db, COLLECTION_NAME, userId);
    const saveSnap = await getDoc(saveRef);
    
    if (saveSnap.exists()) {
      return {
        id: saveSnap.id,
        ...saveSnap.data(),
      } as Save;
    }
    
    // If not found by document ID, query by userId field (for existing documents)
    const savesRef = collection(db, COLLECTION_NAME);
    const q = query(savesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Save;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user saves:', error);
    throw error;
  }
}

/**
 * Check if a prompt is saved by user
 * @param userId - User ID
 * @param promptId - Prompt ID
 * @returns boolean
 */
export async function isPromptSaved(userId: string, promptId: string): Promise<boolean> {
  try {
    const saves = await getUserSaves(userId);
    if (!saves) return false;
    return saves.promptIds.includes(promptId);
  } catch (error) {
    console.error('Error checking if prompt is saved:', error);
    return false;
  }
}

/**
 * Save a prompt for a user
 * Creates save document if it doesn't exist, or updates existing one
 * @param userId - User ID
 * @param promptId - Prompt ID to save
 */
export async function savePrompt(userId: string, promptId: string): Promise<void> {
  try {
    // Get existing save document (by ID or userId field)
    const existingSave = await getUserSaves(userId);
    
    if (existingSave) {
      // Update existing save document
      const saveRef = doc(db, COLLECTION_NAME, existingSave.id);
      
      // Check if prompt is already saved
      if (existingSave.promptIds.includes(promptId)) {
        console.log('Prompt already saved by user');
        return;
      }
      
      // Add prompt to saved list
      await updateDoc(saveRef, {
        promptIds: [...existingSave.promptIds, promptId],
        updatedAt: Timestamp.now(),
      });
    } else {
      // Create new save document with userId as document ID
      const saveRef = doc(db, COLLECTION_NAME, userId);
      const newSave: Omit<Save, 'id'> = {
        userId,
        promptIds: [promptId],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await setDoc(saveRef, newSave);
    }
  } catch (error) {
    console.error('Error saving prompt:', error);
    throw error;
  }
}

/**
 * Unsave a prompt for a user
 * @param userId - User ID
 * @param promptId - Prompt ID to unsave
 */
export async function unsavePrompt(userId: string, promptId: string): Promise<void> {
  try {
    // Get existing save document (by ID or userId field)
    const existingSave = await getUserSaves(userId);
    
    if (!existingSave) {
      console.log('No saves found for user');
      return;
    }
    
    // Check if prompt is saved
    if (!existingSave.promptIds.includes(promptId)) {
      console.log('Prompt not saved by user');
      return;
    }
    
    // Remove prompt from saved list
    const updatedPromptIds = existingSave.promptIds.filter(id => id !== promptId);
    
    const saveRef = doc(db, COLLECTION_NAME, existingSave.id);
    await updateDoc(saveRef, {
      promptIds: updatedPromptIds,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error unsaving prompt:', error);
    throw error;
  }
}

/**
 * Toggle save status for a prompt
 * @param userId - User ID
 * @param promptId - Prompt ID
 * @returns boolean - true if saved, false if unsaved
 */
export async function toggleSavePrompt(userId: string, promptId: string): Promise<boolean> {
  try {
    const isSaved = await isPromptSaved(userId, promptId);
    
    if (isSaved) {
      await unsavePrompt(userId, promptId);
      return false;
    } else {
      await savePrompt(userId, promptId);
      return true;
    }
  } catch (error) {
    console.error('Error toggling save prompt:', error);
    throw error;
  }
}

/**
 * Get all saved prompt IDs for a user
 * @param userId - User ID
 * @returns Array of prompt IDs
 */
export async function getUserSavedPromptIds(userId: string): Promise<string[]> {
  try {
    const saves = await getUserSaves(userId);
    return saves?.promptIds || [];
  } catch (error) {
    console.error('Error getting user saved prompt IDs:', error);
    return [];
  }
}

/**
 * Get count of users who saved a specific prompt
 * @param promptId - Prompt ID
 * @returns Number of users who saved this prompt
 */
export async function getPromptSaveCount(promptId: string): Promise<number> {
  try {
    const savesRef = collection(db, COLLECTION_NAME);
    const q = query(savesRef, where('promptIds', 'array-contains', promptId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting prompt save count:', error);
    return 0;
  }
}

/**
 * Delete all saves for a user
 * @param userId - User ID
 */
export async function deleteUserSaves(userId: string): Promise<void> {
  try {
    // Get existing save document (by ID or userId field)
    const existingSave = await getUserSaves(userId);
    
    if (existingSave) {
      const saveRef = doc(db, COLLECTION_NAME, existingSave.id);
      await deleteDoc(saveRef);
    }
  } catch (error) {
    console.error('Error deleting user saves:', error);
    throw error;
  }
}

/**
 * Remove a prompt from all users' saves
 * Used when deleting a prompt
 * @param promptId - Prompt ID
 */
export async function removePromptFromAllSaves(promptId: string): Promise<void> {
  try {
    const savesRef = collection(db, COLLECTION_NAME);
    const q = query(savesRef, where('promptIds', 'array-contains', promptId));
    const querySnapshot = await getDocs(q);
    
    const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
      const saveData = docSnapshot.data() as Save;
      const updatedPromptIds = saveData.promptIds.filter(id => id !== promptId);
      
      await updateDoc(doc(db, COLLECTION_NAME, docSnapshot.id), {
        promptIds: updatedPromptIds,
        updatedAt: Timestamp.now(),
      });
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error removing prompt from all saves:', error);
    throw error;
  }
}
