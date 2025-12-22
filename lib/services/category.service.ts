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
 * Get all categories with their subcategories
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, COLLECTION_NAME);
    const q = query(categoriesRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const categories: Category[] = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const categoryData = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as Category;
        
        // Get subcategories for this category
        const subcategories = await getSubcategories(docSnapshot.id);
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
 * Delete a category and all its subcategories
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    // First, delete all subcategories
    const subcategories = await getSubcategories(categoryId);
    await Promise.all(
      subcategories.map((sub) => deleteSubcategory(categoryId, sub.id))
    );
    
    // Then delete the category
    const categoryRef = doc(db, COLLECTION_NAME, categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// ============================================
// SUBCATEGORY OPERATIONS
// ============================================

/**
 * Get all subcategories for a category
 */
export async function getSubcategories(categoryId: string): Promise<Subcategory[]> {
  try {
    const subcategoriesRef = collection(
      db,
      COLLECTION_NAME,
      categoryId,
      SUBCOLLECTION_NAME
    );
    const q = query(subcategoriesRef, orderBy('order', 'asc'));
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
 * Delete a subcategory
 */
export async function deleteSubcategory(
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
    console.error('Error deleting subcategory:', error);
    throw error;
  }
}
