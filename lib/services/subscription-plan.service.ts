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
  SubscriptionPlan,
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
} from '@/lib/types/subscription-plan.types';

const COLLECTION_NAME = 'subscription_plans';

/**
 * Get all subscription plans
 */
export async function getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const plansRef = collection(db, COLLECTION_NAME);
    const q = query(plansRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const plans: SubscriptionPlan[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as SubscriptionPlan));
    
    return plans;
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    throw error;
  }
}

/**
 * Get active subscription plans only
 */
export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const plansRef = collection(db, COLLECTION_NAME);
    const q = query(
      plansRef,
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const plans: SubscriptionPlan[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as SubscriptionPlan));
    
    return plans;
  } catch (error) {
    console.error('Error getting active subscription plans:', error);
    throw error;
  }
}

/**
 * Get a single subscription plan by ID
 */
export async function getSubscriptionPlanById(planId: string): Promise<SubscriptionPlan | null> {
  try {
    const planRef = doc(db, COLLECTION_NAME, planId);
    const planSnap = await getDoc(planRef);
    
    if (planSnap.exists()) {
      return {
        id: planSnap.id,
        ...planSnap.data(),
      } as SubscriptionPlan;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting subscription plan:', error);
    throw error;
  }
}

/**
 * Create a new subscription plan
 */
export async function createSubscriptionPlan(
  planData: CreateSubscriptionPlanInput
): Promise<string> {
  try {
    const plansRef = collection(db, COLLECTION_NAME);
    
    const newPlan = {
      name: planData.name,
      price: planData.price,
      currency: planData.currency,
      durationDays: planData.durationDays,
      generationLimit: planData.generationLimit,
      features: planData.features,
      isActive: planData.isActive ?? true,
      order: planData.order,
    };
    
    const docRef = await addDoc(plansRef, newPlan);
    return docRef.id;
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    throw error;
  }
}

/**
 * Update an existing subscription plan
 */
export async function updateSubscriptionPlan(
  planId: string,
  planData: UpdateSubscriptionPlanInput
): Promise<void> {
  try {
    const planRef = doc(db, COLLECTION_NAME, planId);
    const updateData: Record<string, any> = {};
    
    if (planData.name !== undefined) updateData.name = planData.name;
    if (planData.price !== undefined) updateData.price = planData.price;
    if (planData.currency !== undefined) updateData.currency = planData.currency;
    if (planData.durationDays !== undefined) updateData.durationDays = planData.durationDays;
    if (planData.generationLimit !== undefined) updateData.generationLimit = planData.generationLimit;
    if (planData.features !== undefined) updateData.features = planData.features;
    if (planData.isActive !== undefined) updateData.isActive = planData.isActive;
    if (planData.order !== undefined) updateData.order = planData.order;
    
    await updateDoc(planRef, updateData);
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    throw error;
  }
}

/**
 * Delete a subscription plan
 */
export async function deleteSubscriptionPlan(planId: string): Promise<void> {
  try {
    const planRef = doc(db, COLLECTION_NAME, planId);
    await deleteDoc(planRef);
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    throw error;
  }
}

/**
 * Toggle active status
 */
export async function togglePlanActive(planId: string, isActive: boolean): Promise<void> {
  try {
    const planRef = doc(db, COLLECTION_NAME, planId);
    await updateDoc(planRef, { isActive });
  } catch (error) {
    console.error('Error toggling plan active status:', error);
    throw error;
  }
}
