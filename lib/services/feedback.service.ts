import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Feedback } from '@/lib/types/feedback.types';

const COLLECTION_NAME = 'feedback';

/**
 * Get all feedback
 */
export async function getAllFeedback(): Promise<Feedback[]> {
  try {
    const feedbackRef = collection(db, COLLECTION_NAME);
    const q = query(feedbackRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const feedback: Feedback[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Feedback));
    
    return feedback;
  } catch (error) {
    console.error('Error getting feedback:', error);
    throw error;
  }
}

/**
 * Get feedback by rating
 */
export async function getFeedbackByRating(rating: number): Promise<Feedback[]> {
  try {
    const feedbackRef = collection(db, COLLECTION_NAME);
    const q = query(
      feedbackRef,
      where('rating', '==', rating),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const feedback: Feedback[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Feedback));
    
    return feedback;
  } catch (error) {
    console.error('Error getting feedback by rating:', error);
    throw error;
  }
}

/**
 * Get feedback by user ID
 */
export async function getFeedbackByUserId(userId: string): Promise<Feedback[]> {
  try {
    const feedbackRef = collection(db, COLLECTION_NAME);
    const q = query(
      feedbackRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const feedback: Feedback[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Feedback));
    
    return feedback;
  } catch (error) {
    console.error('Error getting feedback by user:', error);
    throw error;
  }
}

/**
 * Get a single feedback by ID
 */
export async function getFeedbackById(feedbackId: string): Promise<Feedback | null> {
  try {
    const feedbackRef = doc(db, COLLECTION_NAME, feedbackId);
    const feedbackSnap = await getDoc(feedbackRef);
    
    if (feedbackSnap.exists()) {
      return {
        id: feedbackSnap.id,
        ...feedbackSnap.data(),
      } as Feedback;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting feedback:', error);
    throw error;
  }
}

/**
 * Delete feedback
 */
export async function deleteFeedback(feedbackId: string): Promise<void> {
  try {
    const feedbackRef = doc(db, COLLECTION_NAME, feedbackId);
    await deleteDoc(feedbackRef);
  } catch (error) {
    console.error('Error deleting feedback:', error);
    throw error;
  }
}

/**
 * Get average rating
 */
export async function getAverageRating(): Promise<number> {
  try {
    const feedback = await getAllFeedback();
    if (feedback.length === 0) return 0;
    
    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    return totalRating / feedback.length;
  } catch (error) {
    console.error('Error calculating average rating:', error);
    throw error;
  }
}
