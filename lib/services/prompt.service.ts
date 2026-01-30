import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
} from '@/lib/types/prompt.types';

const COLLECTION_NAME = 'prompt'; // Firestore collection name

/**
 * Get all prompts (excluding deleted by default)
 */
export async function getAllPrompts(includeDeleted: boolean = false): Promise<Prompt[]> {
  try {
    const promptsRef = collection(db, COLLECTION_NAME);
    const constraints = [];
    
    if (!includeDeleted) {
      constraints.push(where('isDeleted', '==', false));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    
    const q = query(promptsRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const prompts: Prompt[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Prompt));
    
    return prompts;
  } catch (error) {
    console.error('Error getting prompts:', error);
    throw error;
  }
}

/**
 * Get deleted prompts (trash)
 */
export async function getDeletedPrompts(): Promise<Prompt[]> {
  try {
    const promptsRef = collection(db, COLLECTION_NAME);
    const q = query(
      promptsRef,
      where('isDeleted', '==', true),
      orderBy('deletedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const prompts: Prompt[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Prompt));
    
    return prompts;
  } catch (error) {
    console.error('Error getting deleted prompts:', error);
    throw error;
  }
}

/**
 * Get a single prompt by ID
 */
export async function getPromptById(promptId: string): Promise<Prompt | null> {
  try {
    const promptRef = doc(db, COLLECTION_NAME, promptId);
    const promptSnap = await getDoc(promptRef);
    
    if (promptSnap.exists()) {
      return {
        id: promptSnap.id,
        ...promptSnap.data(),
      } as Prompt;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting prompt:', error);
    throw error;
  }
}

/**
 * Get prompts by category (excluding deleted)
 */
export async function getPromptsByCategory(categoryId: string): Promise<Prompt[]> {
  try {
    const promptsRef = collection(db, COLLECTION_NAME);
    const q = query(
      promptsRef,
      where('categoryId', '==', categoryId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const prompts: Prompt[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Prompt));
    
    return prompts;
  } catch (error) {
    console.error('Error getting prompts by category:', error);
    throw error;
  }
}

/**
 * Count prompts by category (excluding deleted)
 */
export async function countPromptsByCategory(categoryId: string): Promise<number> {
  try {
    const promptsRef = collection(db, COLLECTION_NAME);
    const q = query(
      promptsRef,
      where('categoryId', '==', categoryId),
      where('isDeleted', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error counting prompts by category:', error);
    return 0;
  }
}

/**
 * Get trending prompts (excluding deleted)
 */
export async function getTrendingPrompts(): Promise<Prompt[]> {
  try {
    const promptsRef = collection(db, COLLECTION_NAME);
    const q = query(
      promptsRef,
      where('isTrending', '==', true),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const prompts: Prompt[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Prompt));
    
    return prompts;
  } catch (error) {
    console.error('Error getting trending prompts:', error);
    throw error;
  }
}

/**
 * Create a new prompt
 */
export async function createPrompt(promptData: CreatePromptInput): Promise<string> {
  try {
    const promptsRef = collection(db, COLLECTION_NAME);
    
    const newPrompt = {
      title: promptData.title,
      categoryId: promptData.categoryId,
      subCategoryId: promptData.subCategoryId,
      prompt: promptData.prompt,
      url: promptData.url || '',
      imageRequirement: promptData.imageRequirement ?? 0, // Default to 0 (optional)
      tags: promptData.tags || [],
      isTrending: promptData.isTrending || false,
      likesCount: promptData.likesCount || 0,
      savesCount: promptData.savesCount || 0,
      searchCount: promptData.searchCount || 0,
      createdAt: Timestamp.now(),
      createdBy: promptData.createdBy,
      isDeleted: false, // New prompts are not deleted
    };
    
    const docRef = await addDoc(promptsRef, newPrompt);
    return docRef.id;
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
}

/**
 * Update an existing prompt
 */
export async function updatePrompt(
  promptId: string,
  promptData: UpdatePromptInput
): Promise<void> {
  try {
    const promptRef = doc(db, COLLECTION_NAME, promptId);
    const updateData: Record<string, any> = {};
    
    if (promptData.title !== undefined) updateData.title = promptData.title;
    if (promptData.categoryId !== undefined) updateData.categoryId = promptData.categoryId;
    if (promptData.subCategoryId !== undefined) updateData.subCategoryId = promptData.subCategoryId;
    if (promptData.prompt !== undefined) updateData.prompt = promptData.prompt;
    if (promptData.url !== undefined) updateData.url = promptData.url;
    if (promptData.imageRequirement !== undefined) updateData.imageRequirement = promptData.imageRequirement;
    if (promptData.tags !== undefined) updateData.tags = promptData.tags;
    if (promptData.isTrending !== undefined) updateData.isTrending = promptData.isTrending;
    if (promptData.likesCount !== undefined) updateData.likesCount = promptData.likesCount;
    if (promptData.savesCount !== undefined) updateData.savesCount = promptData.savesCount;
    if (promptData.searchCount !== undefined) updateData.searchCount = promptData.searchCount;
    
    // Add updatedBy and updatedAt fields
    if (promptData.updatedBy !== undefined) {
      updateData.updatedBy = promptData.updatedBy;
      updateData.updatedAt = Timestamp.now();
    }
    
    await updateDoc(promptRef, updateData);
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
}

/**
 * Soft delete a prompt
 */
export async function softDeletePrompt(
  promptId: string,
  deletedBy: string
): Promise<void> {
  try {
    const promptRef = doc(db, COLLECTION_NAME, promptId);
    
    const updateData: Record<string, any> = {
      isDeleted: true,
      deletedAt: Timestamp.now(),
    };
    
    // Only add deletedBy if it's provided and not empty
    if (deletedBy && typeof deletedBy === 'string' && deletedBy.trim() !== '') {
      updateData.deletedBy = deletedBy;
    }
    
    await updateDoc(promptRef, updateData);
  } catch (error) {
    console.error('Error soft deleting prompt:', error);
    throw error;
  }
}

/**
 * Restore a deleted prompt
 */
export async function restorePrompt(promptId: string): Promise<void> {
  try {
    const promptRef = doc(db, COLLECTION_NAME, promptId);
    await updateDoc(promptRef, {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });
  } catch (error) {
    console.error('Error restoring prompt:', error);
    throw error;
  }
}

/**
 * Permanently delete a prompt (hard delete)
 */
export async function permanentlyDeletePrompt(promptId: string): Promise<void> {
  try {
    // Get prompt to retrieve image URL
    const prompt = await getPromptById(promptId);
    
    // Delete from Firestore
    const promptRef = doc(db, COLLECTION_NAME, promptId);
    await deleteDoc(promptRef);
    
    // Delete image from S3 if it's an S3 URL
    if (prompt?.url && typeof window === 'undefined') {
      // Only attempt S3 deletion on server-side
      try {
        const bucketName = process.env.AWS_S3_BUCKET_NAME || 'nano-banana-images';
        if (prompt.url.includes(bucketName) || prompt.url.includes('s3.amazonaws.com')) {
          const { deleteFromS3 } = await import('@/lib/utils/s3-upload');
          await deleteFromS3(prompt.url);
        }
      } catch (s3Error) {
        console.error('Error deleting S3 image (non-critical):', s3Error);
        // Don't throw - Firestore deletion succeeded
      }
    }
    // Note: Subcollections (likes, saves) are NOT automatically deleted
  } catch (error) {
    console.error('Error permanently deleting prompt:', error);
    throw error;
  }
}

/**
 * Toggle trending status
 */
export async function toggleTrending(promptId: string, isTrending: boolean): Promise<void> {
  try {
    const promptRef = doc(db, COLLECTION_NAME, promptId);
    await updateDoc(promptRef, { isTrending });
  } catch (error) {
    console.error('Error toggling trending:', error);
    throw error;
  }
}

/**
 * Get users who liked a prompt
 */
export async function getPromptLikedByUsers(promptId: string): Promise<Array<{ userId: string; likedAt: Timestamp }>> {
  try {
    const likesRef = collection(db, COLLECTION_NAME, promptId, 'likes');
    const likesSnapshot = await getDocs(likesRef);
    
    const likes = likesSnapshot.docs.map((likeDoc) => ({
      userId: likeDoc.id,
      likedAt: likeDoc.data().createdAt as Timestamp,
    }));
    
    return likes;
  } catch (error) {
    console.error('Error fetching likes:', error);
    throw error;
  }
}

/**
 * Get users who saved a prompt
 */
export async function getPromptSavedByUsers(promptId: string): Promise<Array<{ userId: string; savedAt: Timestamp }>> {
  try {
    const savesRef = collection(db, COLLECTION_NAME, promptId, 'saves');
    const savesSnapshot = await getDocs(savesRef);
    
    const saves = savesSnapshot.docs.map((saveDoc) => ({
      userId: saveDoc.id,
      savedAt: saveDoc.data().createdAt as Timestamp,
    }));
    
    return saves;
  } catch (error) {
    console.error('Error fetching saves:', error);
    throw error;
  }
}

/**
 * Get users who liked a prompt with full user details
 */
export async function getPromptLikedByUsersWithDetails(promptId: string): Promise<Array<{ userId: string; likedAt: Timestamp }>> {
  try {
    const likesRef = collection(db, COLLECTION_NAME, promptId, 'likes');
    const likesSnapshot = await getDocs(likesRef);
    
    const likes = likesSnapshot.docs.map((likeDoc) => ({
      userId: likeDoc.id,
      likedAt: likeDoc.data().createdAt as Timestamp,
    }));
    
    return likes;
  } catch (error) {
    console.error('Error fetching likes with details:', error);
    throw error;
  }
}

/**
 * Get users who saved a prompt with full user details
 */
export async function getPromptSavedByUsersWithDetails(promptId: string): Promise<Array<{ userId: string; savedAt: Timestamp }>> {
  try {
    const savesRef = collection(db, COLLECTION_NAME, promptId, 'saves');
    const savesSnapshot = await getDocs(savesRef);
    
    const saves = savesSnapshot.docs.map((saveDoc) => ({
      userId: saveDoc.id,
      savedAt: saveDoc.data().createdAt as Timestamp,
    }));
    
    return saves;
  } catch (error) {
    console.error('Error fetching saves with details:', error);
    throw error;
  }
}
