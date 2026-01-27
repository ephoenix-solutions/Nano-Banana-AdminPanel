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
import { 
  User, 
  CreateUserInput, 
  UpdateUserInput,
  LoginHistory,
  CreateLoginHistoryInput,
} from '@/lib/types/user.types';

const COLLECTION_NAME = 'users';
const LOGIN_HISTORY_SUBCOLLECTION = 'loginHistory';

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
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid userId provided to getUserById:', userId);
      return null;
    }

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
    return null; // Return null instead of throwing to prevent crashes
  }
}

/**
 * Get users by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    if (!email || typeof email !== 'string' || email.trim() === '') {
      console.warn('Invalid email provided to getUserByEmail:', email);
      return null;
    }

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
    return null;
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
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid userId provided to updateUser');
    }

    const userRef = doc(db, COLLECTION_NAME, userId);
    const updateData: Record<string, any> = {};
    
    // Only add defined fields to update
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.language !== undefined) updateData.language = userData.language;
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.photoURL !== undefined) updateData.photoURL = userData.photoURL;
    if (userData.provider !== undefined) updateData.provider = userData.provider;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.password !== undefined) updateData.password = userData.password; // Add password field
    
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
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid userId provided to updateLastLogin:', userId);
      return;
    }

    const userRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(userRef, {
      lastLogin: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw, just log the error
  }
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid userId provided to deleteUser');
    }

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
    if (!searchTerm || typeof searchTerm !== 'string') {
      return [];
    }

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
    if (!provider || typeof provider !== 'string') {
      return [];
    }

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

/**
 * Get multiple users by their IDs
 */
export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  try {
    // Filter out invalid userIds
    const validUserIds = userIds.filter(
      (id) => id && typeof id === 'string' && id.trim() !== ''
    );

    if (validUserIds.length === 0) {
      return [];
    }

    const users = await Promise.all(
      validUserIds.map(async (userId) => {
        try {
          const user = await getUserById(userId);
          return user;
        } catch (err) {
          console.error(`Error fetching user ${userId}:`, err);
          return null;
        }
      })
    );
    
    return users.filter((user): user is User => user !== null);
  } catch (error) {
    console.error('Error getting users by IDs:', error);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Get user info (name and photo) by ID
 */
export async function getUserInfo(userId: string): Promise<{ name: string; photoURL: string } | null> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid userId provided to getUserInfo:', userId);
      return null;
    }

    const user = await getUserById(userId);
    if (user) {
      return {
        name: user.name || 'Unknown',
        photoURL: user.photoURL || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

// ============================================
// LOGIN HISTORY OPERATIONS (Subcollection)
// ============================================

/**
 * Add a new login history record to user's subcollection
 * Path: users/{userId}/loginHistory/{loginId}
 */
export async function addLoginHistory(
  userId: string,
  loginData: CreateLoginHistoryInput
): Promise<string> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid userId provided to addLoginHistory');
    }

    // Reference to the loginHistory subcollection under the user
    const loginHistoryRef = collection(
      db,
      COLLECTION_NAME,
      userId,
      LOGIN_HISTORY_SUBCOLLECTION
    );
    
    const newLoginHistory = {
      loginTime: Timestamp.now(),
      deviceInfo: loginData.deviceInfo,
      deviceId: loginData.deviceId,
    };
    
    const docRef = await addDoc(loginHistoryRef, newLoginHistory);
    console.log('Login history added:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding login history:', error);
    throw error;
  }
}

/**
 * Get all login history for a user
 * Path: users/{userId}/loginHistory
 */
export async function getLoginHistory(
  userId: string,
  limitCount: number = 50
): Promise<LoginHistory[]> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid userId provided to getLoginHistory:', userId);
      return [];
    }

    // Reference to the loginHistory subcollection
    const loginHistoryRef = collection(
      db,
      COLLECTION_NAME,
      userId,
      LOGIN_HISTORY_SUBCOLLECTION
    );
    
    // Query to get login history ordered by loginTime (most recent first)
    const q = query(
      loginHistoryRef,
      orderBy('loginTime', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    const loginHistory: LoginHistory[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as LoginHistory));
    
    return loginHistory;
  } catch (error) {
    console.error('Error getting login history:', error);
    return [];
  }
}

/**
 * Get recent login history (last N logins)
 */
export async function getRecentLoginHistory(
  userId: string,
  count: number = 10
): Promise<LoginHistory[]> {
  return getLoginHistory(userId, count);
}

/**
 * Delete a specific login history record
 */
export async function deleteLoginHistory(
  userId: string,
  loginHistoryId: string
): Promise<void> {
  try {
    if (!userId || !loginHistoryId) {
      throw new Error('Invalid userId or loginHistoryId');
    }

    const loginHistoryDocRef = doc(
      db,
      COLLECTION_NAME,
      userId,
      LOGIN_HISTORY_SUBCOLLECTION,
      loginHistoryId
    );
    await deleteDoc(loginHistoryDocRef);
    console.log('Login history deleted:', loginHistoryId);
  } catch (error) {
    console.error('Error deleting login history:', error);
    throw error;
  }
}

/**
 * Get login history count for a user
 */
export async function getLoginHistoryCount(userId: string): Promise<number> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return 0;
    }

    const loginHistoryRef = collection(
      db,
      COLLECTION_NAME,
      userId,
      LOGIN_HISTORY_SUBCOLLECTION
    );
    const querySnapshot = await getDocs(loginHistoryRef);
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting login history count:', error);
    return 0;
  }
}
