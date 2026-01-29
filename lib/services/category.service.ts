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
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Category,
  Subcategory,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateSubcategoryInput,
  UpdateSubcategoryInput,
} from '@/lib/types/category.types';

const COLLECTION_NAME = 'categories';
const SUBCOLLECTION_NAME = 'subcategories';

// ============================================
// CATEGORY OPERATIONS
// ============================================

/**
 * Get all categories with their subcategories (excluding deleted by default)
 */
export async function getAllCategories(includeDeleted: boolean = false): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, COLLECTION_NAME);
    const constraints = [];
    
    if (!includeDeleted) {
      constraints.push(where('isDeleted', '==', false));
    }
    
    constraints.push(orderBy('order', 'asc'));
    
    const q = query(categoriesRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const categories: Category[] = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const categoryData = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as Category;
        
        // Get subcategories for this category (excluding deleted)
        const subcategories = await getSubcategories(docSnapshot.id, includeDeleted);
        categoryData.subcategories = subcategories;
        
        return categoryData;
      })
    );
    
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
}

/**
 * Get deleted categories (trash)
 */
export async function getDeletedCategories(): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, COLLECTION_NAME);
    const q = query(
      categoriesRef,
      where('isDeleted', '==', true),
      orderBy('deletedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const categories: Category[] = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const categoryData = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as Category;
        
        // Get all subcategories (including deleted) for deleted categories
        const subcategories = await getSubcategories(docSnapshot.id, true);
        categoryData.subcategories = subcategories;
        
        return categoryData;
      })
    );
    
    return categories;
  } catch (error) {
    console.error('Error getting deleted categories:', error);
    throw error;
  }
}

/**
 * Get orphaned deleted subcategories (subcategories that are deleted but parent category is not)
 */
export async function getOrphanedDeletedSubcategories(): Promise<Array<{ categoryId: string; categoryName: string; subcategory: Subcategory }>> {
  try {
    const categoriesRef = collection(db, COLLECTION_NAME);
    // Get only active categories
    const q = query(categoriesRef, where('isDeleted', '==', false));
    const querySnapshot = await getDocs(q);
    
    const orphanedSubcategories: Array<{ categoryId: string; categoryName: string; subcategory: Subcategory }> = [];
    
    for (const categoryDoc of querySnapshot.docs) {
      const categoryData = categoryDoc.data();
      const subcategoriesRef = collection(
        db,
        COLLECTION_NAME,
        categoryDoc.id,
        SUBCOLLECTION_NAME
      );
      
      // Get deleted subcategories
      const subQuery = query(
        subcategoriesRef,
        where('isDeleted', '==', true),
        orderBy('deletedAt', 'desc')
      );
      const subSnapshot = await getDocs(subQuery);
      
      subSnapshot.docs.forEach((subDoc) => {
        orphanedSubcategories.push({
          categoryId: categoryDoc.id,
          categoryName: categoryData.name,
          subcategory: {
            id: subDoc.id,
            ...subDoc.data(),
          } as Subcategory,
        });
      });
    }
    
    return orphanedSubcategories;
  } catch (error) {
    console.error('Error getting orphaned deleted subcategories:', error);
    throw error;
  }
}

/**
 * Get a single category by ID with subcategories
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  try {
    const categoryRef = doc(db, COLLECTION_NAME, categoryId);
    const categorySnap = await getDoc(categoryRef);
    
    if (categorySnap.exists()) {
      const category = {
        id: categorySnap.id,
        ...categorySnap.data(),
      } as Category;
      
      // Get subcategories
      category.subcategories = await getSubcategories(categoryId);
      
      return category;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting category:', error);
    throw error;
  }
}

/**
 * Create a new category
 */
export async function createCategory(categoryData: CreateCategoryInput): Promise<string> {
  try {
    const categoriesRef = collection(db, COLLECTION_NAME);
    
    const newCategory = {
      name: categoryData.name,
      iconImage: categoryData.iconImage || '',
      order: categoryData.order,
      searchCount: categoryData.searchCount || '0',
      createdBy: categoryData.createdBy,
      createdAt: Timestamp.now(),
      isDeleted: false, // New categories are not deleted
    };
    
    const docRef = await addDoc(categoriesRef, newCategory);
    return docRef.id;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  categoryId: string,
  categoryData: UpdateCategoryInput
): Promise<void> {
  try {
    const categoryRef = doc(db, COLLECTION_NAME, categoryId);
    const updateData: Record<string, any> = {};
    
    if (categoryData.name !== undefined) updateData.name = categoryData.name;
    if (categoryData.iconImage !== undefined) updateData.iconImage = categoryData.iconImage;
    if (categoryData.order !== undefined) updateData.order = categoryData.order;
    if (categoryData.searchCount !== undefined) updateData.searchCount = categoryData.searchCount;
    
    // Add updatedBy and updatedAt fields
    if (categoryData.updatedBy !== undefined) {
      updateData.updatedBy = categoryData.updatedBy;
      updateData.updatedAt = Timestamp.now();
    }
    
    await updateDoc(categoryRef, updateData);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

/**
 * Soft delete a category and all its subcategories
 */
export async function softDeleteCategory(
  categoryId: string,
  deletedBy: string
): Promise<void> {
  try {
    const categoryRef = doc(db, COLLECTION_NAME, categoryId);
    await updateDoc(categoryRef, {
      isDeleted: true,
      deletedAt: Timestamp.now(),
      deletedBy: deletedBy,
    });
    
    // Soft delete all subcategories
    const subcategories = await getSubcategories(categoryId, false);
    await Promise.all(
      subcategories.map((sub) => softDeleteSubcategory(categoryId, sub.id, deletedBy))
    );
  } catch (error) {
    console.error('Error soft deleting category:', error);
    throw error;
  }
}

/**
 * Restore a deleted category and all its subcategories
 */
export async function restoreCategory(categoryId: string): Promise<void> {
  try {
    const categoryRef = doc(db, COLLECTION_NAME, categoryId);
    await updateDoc(categoryRef, {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });
    
    // Restore all subcategories
    const subcategories = await getSubcategories(categoryId, true);
    await Promise.all(
      subcategories.map((sub) => restoreSubcategory(categoryId, sub.id))
    );
  } catch (error) {
    console.error('Error restoring category:', error);
    throw error;
  }
}

/**
 * Permanently delete a category (hard delete)
 */
export async function permanentlyDeleteCategory(categoryId: string): Promise<void> {
  try {
    // Get category to retrieve icon URL
    const category = await getCategoryById(categoryId);
    
    // First, permanently delete all subcategories
    const subcategories = await getSubcategories(categoryId, true);
    await Promise.all(
      subcategories.map((sub) => permanentlyDeleteSubcategory(categoryId, sub.id))
    );
    
    // Then delete the category
    const categoryRef = doc(db, COLLECTION_NAME, categoryId);
    await deleteDoc(categoryRef);
    
    // Delete icon from S3 if it's an S3 URL
    if (category?.iconImage && typeof window === 'undefined') {
      // Only attempt S3 deletion on server-side
      try {
        const bucketName = process.env.AWS_S3_BUCKET_NAME || 'nano-banana-images';
        if (category.iconImage.includes(bucketName) || category.iconImage.includes('s3.amazonaws.com')) {
          const { deleteFromS3 } = await import('@/lib/utils/s3-upload');
          await deleteFromS3(category.iconImage);
        }
      } catch (s3Error) {
        console.error('Error deleting S3 icon (non-critical):', s3Error);
        // Don't throw - Firestore deletion succeeded
      }
    }
  } catch (error) {
    console.error('Error permanently deleting category:', error);
    throw error;
  }
}

// ============================================
// SUBCATEGORY OPERATIONS
// ============================================

/**
 * Get all subcategories for a category (excluding deleted by default)
 */
export async function getSubcategories(
  categoryId: string,
  includeDeleted: boolean = false
): Promise<Subcategory[]> {
  try {
    const subcategoriesRef = collection(
      db,
      COLLECTION_NAME,
      categoryId,
      SUBCOLLECTION_NAME
    );
    
    const constraints = [];
    
    if (!includeDeleted) {
      constraints.push(where('isDeleted', '==', false));
    }
    
    constraints.push(orderBy('order', 'asc'));
    
    const q = query(subcategoriesRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const subcategories: Subcategory[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Subcategory));
    
    return subcategories;
  } catch (error) {
    console.error('Error getting subcategories:', error);
    throw error;
  }
}

/**
 * Get a single subcategory by ID
 */
export async function getSubcategoryById(
  categoryId: string,
  subcategoryId: string
): Promise<Subcategory | null> {
  try {
    const subcategoryRef = doc(
      db,
      COLLECTION_NAME,
      categoryId,
      SUBCOLLECTION_NAME,
      subcategoryId
    );
    const subcategorySnap = await getDoc(subcategoryRef);
    
    if (subcategorySnap.exists()) {
      return {
        id: subcategorySnap.id,
        ...subcategorySnap.data(),
      } as Subcategory;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting subcategory:', error);
    throw error;
  }
}

/**
 * Create a new subcategory
 */
export async function createSubcategory(
  categoryId: string,
  subcategoryData: CreateSubcategoryInput
): Promise<string> {
  try {
    const subcategoriesRef = collection(
      db,
      COLLECTION_NAME,
      categoryId,
      SUBCOLLECTION_NAME
    );
    
    const newSubcategory = {
      name: subcategoryData.name,
      order: subcategoryData.order,
      searchCount: subcategoryData.searchCount || 0,
      createdBy: subcategoryData.createdBy,
      createdAt: Timestamp.now(),
      isDeleted: false, // New subcategories are not deleted
    };
    
    const docRef = await addDoc(subcategoriesRef, newSubcategory);
    return docRef.id;
  } catch (error) {
    console.error('Error creating subcategory:', error);
    throw error;
  }
}

/**
 * Update an existing subcategory
 */
export async function updateSubcategory(
  categoryId: string,
  subcategoryId: string,
  subcategoryData: UpdateSubcategoryInput
): Promise<void> {
  try {
    const subcategoryRef = doc(
      db,
      COLLECTION_NAME,
      categoryId,
      SUBCOLLECTION_NAME,
      subcategoryId
    );
    const updateData: Record<string, any> = {};
    
    if (subcategoryData.name !== undefined) updateData.name = subcategoryData.name;
    if (subcategoryData.order !== undefined) updateData.order = subcategoryData.order;
    if (subcategoryData.searchCount !== undefined) updateData.searchCount = subcategoryData.searchCount;
    
    // Add updatedBy and updatedAt fields
    if (subcategoryData.updatedBy !== undefined) {
      updateData.updatedBy = subcategoryData.updatedBy;
      updateData.updatedAt = Timestamp.now();
    }
    
    await updateDoc(subcategoryRef, updateData);
  } catch (error) {
    console.error('Error updating subcategory:', error);
    throw error;
  }
}

/**
 * Soft delete a subcategory
 */
export async function softDeleteSubcategory(
  categoryId: string,
  subcategoryId: string,
  deletedBy: string
): Promise<void> {
  try {
    const subcategoryRef = doc(
      db,
      COLLECTION_NAME,
      categoryId,
      SUBCOLLECTION_NAME,
      subcategoryId
    );
    await updateDoc(subcategoryRef, {
      isDeleted: true,
      deletedAt: Timestamp.now(),
      deletedBy: deletedBy,
    });
  } catch (error) {
    console.error('Error soft deleting subcategory:', error);
    throw error;
  }
}

/**
 * Restore a deleted subcategory
 */
export async function restoreSubcategory(
  categoryId: string,
  subcategoryId: string
): Promise<void> {
  try {
    const subcategoryRef = doc(
      db,
      COLLECTION_NAME,
      categoryId,
      SUBCOLLECTION_NAME,
      subcategoryId
    );
    await updateDoc(subcategoryRef, {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });
  } catch (error) {
    console.error('Error restoring subcategory:', error);
    throw error;
  }
}

/**
 * Permanently delete a subcategory (hard delete)
 */
export async function permanentlyDeleteSubcategory(
  categoryId: string,
  subcategoryId: string
): Promise<void> {
  try {
    const subcategoryRef = doc(
      db,
      COLLECTION_NAME,
      categoryId,
      SUBCOLLECTION_NAME,
      subcategoryId
    );
    await deleteDoc(subcategoryRef);
  } catch (error) {
    console.error('Error permanently deleting subcategory:', error);
    throw error;
  }
}
