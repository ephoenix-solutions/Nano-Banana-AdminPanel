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
 * Filtering is done client-side to avoid complex indexes
 */
export async function getAllUsers(
  includeDeleted: boolean = false
): Promise<User[]> {
  try {
    const usersRef = collection(db, COLLECTION_NAME);
    
    const constraints: QueryConstraint[] = [];
    
    if (!includeDeleted) {
      constraints.push(where('isDeleted', '==', false));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    
    const q = query(usersRef, ...constraints);
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
 * Get all deleted users
 * Filtering is done client-side to avoid complex indexes
 */
export async function getDeletedUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, COLLECTION_NAME);
    
    const constraints: QueryConstraint[] = [
      where('isDeleted', '==', true),
      orderBy('deletedAt', 'desc')
    ];
    
    const q = query(usersRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const users: User[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as User));
    
    return users;
  } catch (error) {
    console.error('Error getting deleted users:', error);
    throw error;
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(userId: string, includeDeleted: boolean = false): Promise<User | null> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid userId provided to getUserById:', userId);
      return null;
    }

    const userRef = doc(db, COLLECTION_NAME, userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const user = {
        id: userSnap.id,
        ...userSnap.data(),
      } as User;
      
      if (!includeDeleted && user.isDeleted) {
        return null;
      }
      
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
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
      role: userData.role || 'user',
      createdAt: now,
      lastLogin: now,
      isDeleted: false,
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
    
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.language !== undefined) updateData.language = userData.language;
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.photoURL !== undefined) updateData.photoURL = userData.photoURL;
    if (userData.provider !== undefined) updateData.provider = userData.provider;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.password !== undefined) updateData.password = userData.password;
    
    if (userData.isDeleted !== undefined) updateData.isDeleted = userData.isDeleted;
    if (userData.deletedAt !== undefined) updateData.deletedAt = userData.deletedAt;
    if (userData.deletedBy !== undefined) updateData.deletedBy = userData.deletedBy;
    
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
  }
}

/**
 * Soft delete a user (mark as deleted)
 */
export async function softDeleteUser(
  userId: string,
  deletedBy: string
): Promise<void> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid userId provided to softDeleteUser');
    }

    const userRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(userRef, {
      isDeleted: true,
      deletedAt: Timestamp.now(),
      deletedBy: deletedBy,
    });
  } catch (error) {
    console.error('Error soft deleting user:', error);
    throw error;
  }
}

/**
 * Restore a soft-deleted user
 */
export async function restoreUser(userId: string): Promise<void> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid userId provided to restoreUser');
    }

    const userRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(userRef, {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });
  } catch (error) {
    console.error('Error restoring user:', error);
    throw error;
  }
}

/**
 * Permanently delete a user (hard delete)
 */
export async function permanentlyDeleteUser(userId: string): Promise<void> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid userId provided to permanentlyDeleteUser');
    }

    const user = await getUserById(userId, true);
    const userRef = doc(db, COLLECTION_NAME, userId);
    await deleteDoc(userRef);
    
    if (user?.photoURL && typeof window === 'undefined') {
      try {
        const bucketName = process.env.AWS_S3_BUCKET_NAME || 'nano-banana-images';
        if (user.photoURL.includes(bucketName) || user.photoURL.includes('s3.amazonaws.com')) {
          const { deleteFromS3 } = await import('@/lib/utils/s3-upload');
          await deleteFromS3(user.photoURL);
        }
      } catch (s3Error) {
        console.error('Error deleting S3 photo (non-critical):', s3Error);
      }
    }
  } catch (error) {
    console.error('Error permanently deleting user:', error);
    throw error;
  }
}

/**
 * Get multiple users by their IDs
 */
export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  try {
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
    return [];
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

export async function addLoginHistory(
  userId: string,
  loginData: CreateLoginHistoryInput
): Promise<string> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('Invalid userId provided to addLoginHistory');
    }

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
    return docRef.id;
  } catch (error) {
    console.error('Error adding login history:', error);
    throw error;
  }
}

export async function getLoginHistory(
  userId: string,
  limitCount: number = 50
): Promise<LoginHistory[]> {
  try {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('Invalid userId provided to getLoginHistory:', userId);
      return [];
    }

    const loginHistoryRef = collection(
      db,
      COLLECTION_NAME,
      userId,
      LOGIN_HISTORY_SUBCOLLECTION
    );
    
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

export async function getRecentLoginHistory(
  userId: string,
  count: number = 10
): Promise<LoginHistory[]> {
  return getLoginHistory(userId, count);
}

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
