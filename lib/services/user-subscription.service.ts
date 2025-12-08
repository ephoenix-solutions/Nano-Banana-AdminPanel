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
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  UserSubscription,
  CreateUserSubscriptionInput,
  UpdateUserSubscriptionInput,
} from '@/lib/types/user-subscription.types';

const COLLECTION_NAME = 'user_subscriptions';

/**
 * Get all user subscriptions
 */
export async function getAllUserSubscriptions(): Promise<UserSubscription[]> {
  try {
    const subscriptionsRef = collection(db, COLLECTION_NAME);
    const q = query(subscriptionsRef, orderBy('startDate', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const subscriptions: UserSubscription[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as UserSubscription));
    
    return subscriptions;
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    throw error;
  }
}

/**
 * Get active subscriptions only
 */
export async function getActiveSubscriptions(): Promise<UserSubscription[]> {
  try {
    const subscriptionsRef = collection(db, COLLECTION_NAME);
    const q = query(
      subscriptionsRef,
      where('isActive', '==', true),
      orderBy('startDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const subscriptions: UserSubscription[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as UserSubscription));
    
    return subscriptions;
  } catch (error) {
    console.error('Error getting active subscriptions:', error);
    throw error;
  }
}

/**
 * Get subscriptions by user ID
 */
export async function getSubscriptionsByUserId(userId: string): Promise<UserSubscription[]> {
  try {
    const subscriptionsRef = collection(db, COLLECTION_NAME);
    const q = query(
      subscriptionsRef,
      where('userId', '==', userId),
      orderBy('startDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const subscriptions: UserSubscription[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as UserSubscription));
    
    return subscriptions;
  } catch (error) {
    console.error('Error getting subscriptions by user:', error);
    throw error;
  }
}

/**
 * Get subscriptions by plan ID
 */
export async function getSubscriptionsByPlanId(planId: string): Promise<UserSubscription[]> {
  try {
    const subscriptionsRef = collection(db, COLLECTION_NAME);
    const q = query(
      subscriptionsRef,
      where('planId', '==', planId),
      orderBy('startDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const subscriptions: UserSubscription[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as UserSubscription));
    
    return subscriptions;
  } catch (error) {
    console.error('Error getting subscriptions by plan:', error);
    throw error;
  }
}

/**
 * Get a single user subscription by ID
 */
export async function getUserSubscriptionById(
  subscriptionId: string
): Promise<UserSubscription | null> {
  try {
    const subscriptionRef = doc(db, COLLECTION_NAME, subscriptionId);
    const subscriptionSnap = await getDoc(subscriptionRef);
    
    if (subscriptionSnap.exists()) {
      return {
        id: subscriptionSnap.id,
        ...subscriptionSnap.data(),
      } as UserSubscription;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
}

/**
 * Create a new user subscription
 */
export async function createUserSubscription(
  subscriptionData: CreateUserSubscriptionInput
): Promise<string> {
  try {
    const subscriptionsRef = collection(db, COLLECTION_NAME);
    
    const newSubscription = {
      userId: subscriptionData.userId,
      planId: subscriptionData.planId,
      startDate: subscriptionData.startDate,
      endDate: subscriptionData.endDate,
      isActive: subscriptionData.isActive ?? true,
      paymentMethod: subscriptionData.paymentMethod,
      transactionId: subscriptionData.transactionId,
    };
    
    const docRef = await addDoc(subscriptionsRef, newSubscription);
    return docRef.id;
  } catch (error) {
    console.error('Error creating user subscription:', error);
    throw error;
  }
}

/**
 * Update an existing user subscription
 */
export async function updateUserSubscription(
  subscriptionId: string,
  subscriptionData: UpdateUserSubscriptionInput
): Promise<void> {
  try {
    const subscriptionRef = doc(db, COLLECTION_NAME, subscriptionId);
    const updateData: Record<string, any> = {};
    
    if (subscriptionData.userId !== undefined) updateData.userId = subscriptionData.userId;
    if (subscriptionData.planId !== undefined) updateData.planId = subscriptionData.planId;
    if (subscriptionData.startDate !== undefined) updateData.startDate = subscriptionData.startDate;
    if (subscriptionData.endDate !== undefined) updateData.endDate = subscriptionData.endDate;
    if (subscriptionData.isActive !== undefined) updateData.isActive = subscriptionData.isActive;
    if (subscriptionData.paymentMethod !== undefined) updateData.paymentMethod = subscriptionData.paymentMethod;
    if (subscriptionData.transactionId !== undefined) updateData.transactionId = subscriptionData.transactionId;
    
    await updateDoc(subscriptionRef, updateData);
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

/**
 * Delete a user subscription
 */
export async function deleteUserSubscription(subscriptionId: string): Promise<void> {
  try {
    const subscriptionRef = doc(db, COLLECTION_NAME, subscriptionId);
    await deleteDoc(subscriptionRef);
  } catch (error) {
    console.error('Error deleting user subscription:', error);
    throw error;
  }
}

/**
 * Toggle active status
 */
export async function toggleSubscriptionActive(
  subscriptionId: string,
  isActive: boolean
): Promise<void> {
  try {
    const subscriptionRef = doc(db, COLLECTION_NAME, subscriptionId);
    await updateDoc(subscriptionRef, { isActive });
  } catch (error) {
    console.error('Error toggling subscription active status:', error);
    throw error;
  }
}
