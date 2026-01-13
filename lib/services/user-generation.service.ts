import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  UserGeneration,
  CreateUserGenerationInput,
  UpdateUserGenerationInput,
} from '@/lib/types/user-generation.types';

const COLLECTION_NAME = 'user_generations';

/**
 * Get all user generations
 */
export async function getAllUserGenerations(): Promise<UserGeneration[]> {
  try {
    const generationsRef = collection(db, COLLECTION_NAME);
    const q = query(generationsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserGeneration[];
  } catch (error) {
    console.error('Error fetching user generations:', error);
    throw error;
  }
}

/**
 * Get user generations by user ID
 */
export async function getUserGenerationsByUserId(
  userId: string,
  limitCount?: number
): Promise<UserGeneration[]> {
  try {
    const generationsRef = collection(db, COLLECTION_NAME);
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ];
    
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    const q = query(generationsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserGeneration[];
  } catch (error) {
    console.error('Error fetching user generations by user ID:', error);
    throw error;
  }
}

/**
 * Get user generations by status
 */
export async function getUserGenerationsByStatus(
  status: 'pending' | 'success' | 'failed'
): Promise<UserGeneration[]> {
  try {
    const generationsRef = collection(db, COLLECTION_NAME);
    const q = query(
      generationsRef,
      where('generationStatus', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as UserGeneration[];
  } catch (error) {
    console.error('Error fetching user generations by status:', error);
    throw error;
  }
}

/**
 * Get a single user generation by ID
 */
export async function getUserGenerationById(
  id: string
): Promise<UserGeneration | null> {
  try {
    const generationRef = doc(db, COLLECTION_NAME, id);
    const snapshot = await getDoc(generationRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as UserGeneration;
  } catch (error) {
    console.error('Error fetching user generation:', error);
    throw error;
  }
}

/**
 * Create a new user generation
 */
export async function createUserGeneration(
  data: CreateUserGenerationInput
): Promise<string> {
  try {
    const generationsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(generationsRef, {
      ...data,
      createdAt: Timestamp.now(),
      metadata: data.metadata || {},
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating user generation:', error);
    throw error;
  }
}

/**
 * Update a user generation
 */
export async function updateUserGeneration(
  id: string,
  data: UpdateUserGenerationInput
): Promise<void> {
  try {
    const generationRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(generationRef, {
      ...data,
    });
  } catch (error) {
    console.error('Error updating user generation:', error);
    throw error;
  }
}

/**
 * Delete a user generation
 */
export async function deleteUserGeneration(id: string): Promise<void> {
  try {
    const generationRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(generationRef);
  } catch (error) {
    console.error('Error deleting user generation:', error);
    throw error;
  }
}

/**
 * Get generation count for a user in current period
 */
export async function getUserGenerationCount(
  userId: string,
  startDate: Timestamp
): Promise<number> {
  try {
    const generationsRef = collection(db, COLLECTION_NAME);
    const q = query(
      generationsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', startDate),
      where('generationStatus', '==', 'success')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.size;
  } catch (error) {
    console.error('Error getting user generation count:', error);
    throw error;
  }
}

/**
 * Get generation statistics for a user
 */
export async function getUserGenerationStats(userId: string): Promise<{
  total: number;
  success: number;
  failed: number;
  pending: number;
}> {
  try {
    const generationsRef = collection(db, COLLECTION_NAME);
    const q = query(generationsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    const stats = {
      total: snapshot.size,
      success: 0,
      failed: 0,
      pending: 0,
    };
    
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.generationStatus === 'success') stats.success++;
      else if (data.generationStatus === 'failed') stats.failed++;
      else if (data.generationStatus === 'pending') stats.pending++;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting user generation stats:', error);
    throw error;
  }
}
