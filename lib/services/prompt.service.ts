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
import { removePromptFromAllSaves } from './save.service';

const COLLECTION_NAME = 'prompt'; // Firestore collection name

/**
 * Get all prompts
 */
export async function getAllPrompts(): Promise<Prompt[]> {
  try {
    const promptsRef = collection(db, COLLECTION_NAME);
    const q = query(promptsRef, orderBy('createdAt', 'desc'));
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
 * Get prompts by category
 */
export async function getPromptsByCategory(categoryId: string): Promise<Prompt[]> {
  try {
    const promptsRef = collection(db, COLLECTION_NAME);
    const q = query(
      promptsRef,
      where('categoryId', '==', categoryId),
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
 * Get trending prompts
 */
export async function getTrendingPrompts(): Promise<Prompt[]> {
  try {
    const promptsRef = collection(db, COLLECTION_NAME);
    const q = query(
      promptsRef,
      where('isTrending', '==', true),
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
      likes: promptData.likes || 0,
      searchCount: promptData.searchCount || 0,
      createdAt: Timestamp.now(),
      createdBy: promptData.createdBy,
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
    if (promptData.likes !== undefined) updateData.likes = promptData.likes;
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
 * Delete a prompt
 * Also removes it from all users' saves
 */
export async function deletePrompt(promptId: string): Promise<void> {
  try {
    // First, remove from all users' saves
    await removePromptFromAllSaves(promptId);
    
    // Then delete the prompt
    const promptRef = doc(db, COLLECTION_NAME, promptId);
    await deleteDoc(promptRef);
  } catch (error) {
    console.error('Error deleting prompt:', error);
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
