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
  limit,
  where,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { User, CreateUserInput, UpdateUserInput } from '@/lib/types/user.types';

const COLLECTION_NAME = 'users';

/**
 * Get all users from Firestore
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, COLLECTION_NAME);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const users: User[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      } as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Get users by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = collection(db, COLLECTION_NAME);
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: CreateUserInput): Promise<string> {
  try {
    const now = Timestamp.now();
    const usersRef = collection(db, COLLECTION_NAME);
    
    const newUser = {
      ...userData,
      photoURL: userData.photoURL || '',
      role: userData.role || 'user', // Default role is 'user'
      createdAt: now,
      lastLogin: now,
    };
    
    const docRef = await addDoc(usersRef, newUser);
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update an existing user
 */
export async function updateUser(
  userId: string,
  userData: UpdateUserInput
): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId);
    const updateData: Record<string, any> = {};
    
    // Only add defined fields to update
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.language !== undefined) updateData.language = userData.language;
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.photoURL !== undefined) updateData.photoURL = userData.photoURL;
    if (userData.provider !== undefined) updateData.provider = userData.provider;
    if (userData.role !== undefined) updateData.role = userData.role;
    
    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(userRef, {
      lastLogin: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Get users with pagination
 */
export async function getUsersPaginated(
  limitCount: number = 10,
  orderByField: string = 'createdAt',
  orderDirection: 'asc' | 'desc' = 'desc'
): Promise<User[]> {
  try {
    const usersRef = collection(db, COLLECTION_NAME);
    const q = query(
      usersRef,
      orderBy(orderByField, orderDirection),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    const users: User[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
    
    return users;
  } catch (error) {
    console.error('Error getting paginated users:', error);
    throw error;
  }
}

/**
 * Search users by name or email
 */
export async function searchUsers(searchTerm: string): Promise<User[]> {
  try {
    const usersRef = collection(db, COLLECTION_NAME);
    const querySnapshot = await getDocs(usersRef);
    
    const users: User[] = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as User))
      .filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

/**
 * Get users by provider
 */
export async function getUsersByProvider(provider: string): Promise<User[]> {
  try {
    const usersRef = collection(db, COLLECTION_NAME);
    const q = query(usersRef, where('provider', '==', provider));
    const querySnapshot = await getDocs(q);
    
    const users: User[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
    
    return users;
  } catch (error) {
    console.error('Error getting users by provider:', error);
    throw error;
  }
}
