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
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Country,
  CreateCountryInput,
  UpdateCountryInput,
} from '@/lib/types/country.types';

const COLLECTION_NAME = 'countries';

/**
 * Get all countries (excluding deleted by default)
 */
export async function getAllCountries(includeDeleted: boolean = false): Promise<Country[]> {
  try {
    const countriesRef = collection(db, COLLECTION_NAME);
    const constraints = [];
    
    if (!includeDeleted) {
      constraints.push(where('isDeleted', '==', false));
    }
    
    constraints.push(orderBy('name', 'asc'));
    
    const q = query(countriesRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const countries: Country[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Country));
    
    return countries;
  } catch (error) {
    console.error('Error getting countries:', error);
    throw error;
  }
}

/**
 * Get deleted countries (trash)
 */
export async function getDeletedCountries(): Promise<Country[]> {
  try {
    const countriesRef = collection(db, COLLECTION_NAME);
    const q = query(
      countriesRef,
      where('isDeleted', '==', true),
      orderBy('deletedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const countries: Country[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Country));
    
    return countries;
  } catch (error) {
    console.error('Error getting deleted countries:', error);
    throw error;
  }
}

/**
 * Get a single country by ID
 */
export async function getCountryById(countryId: string): Promise<Country | null> {
  try {
    const countryRef = doc(db, COLLECTION_NAME, countryId);
    const countrySnap = await getDoc(countryRef);
    
    if (countrySnap.exists()) {
      return {
        id: countrySnap.id,
        ...countrySnap.data(),
      } as Country;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting country:', error);
    throw error;
  }
}

/**
 * Get countries that use a specific category (excluding deleted)
 */
export async function getCountriesByCategory(categoryId: string): Promise<Country[]> {
  try {
    const countriesRef = collection(db, COLLECTION_NAME);
    const q = query(
      countriesRef,
      where('categories', 'array-contains', categoryId),
      where('isDeleted', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    const countries: Country[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Country));
    
    return countries;
  } catch (error) {
    console.error('Error getting countries by category:', error);
    return [];
  }
}

/**
 * Count countries that use a specific category (excluding deleted)
 */
export async function countCountriesByCategory(categoryId: string): Promise<number> {
  try {
    const countriesRef = collection(db, COLLECTION_NAME);
    const q = query(
      countriesRef,
      where('categories', 'array-contains', categoryId),
      where('isDeleted', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error counting countries by category:', error);
    return 0;
  }
}

/**
 * Create a new country
 */
export async function createCountry(countryData: CreateCountryInput): Promise<string> {
  try {
    const countriesRef = collection(db, COLLECTION_NAME);
    
    const newCountry = {
      name: countryData.name,
      isoCode: countryData.isoCode,
      categories: countryData.categories || [],
      createdAt: Timestamp.now(),
      createdBy: countryData.createdBy,
      isDeleted: false, // New countries are not deleted
    };
    
    const docRef = await addDoc(countriesRef, newCountry);
    return docRef.id;
  } catch (error) {
    console.error('Error creating country:', error);
    throw error;
  }
}

/**
 * Update an existing country
 */
export async function updateCountry(
  countryId: string,
  countryData: UpdateCountryInput
): Promise<void> {
  try {
    const countryRef = doc(db, COLLECTION_NAME, countryId);
    const updateData: Record<string, any> = {};
    
    if (countryData.name !== undefined) updateData.name = countryData.name;
    if (countryData.isoCode !== undefined) updateData.isoCode = countryData.isoCode;
    if (countryData.categories !== undefined) updateData.categories = countryData.categories;
    
    // Add updatedBy and updatedAt fields
    if (countryData.updatedBy !== undefined) {
      updateData.updatedBy = countryData.updatedBy;
      updateData.updatedAt = Timestamp.now();
    }
    
    await updateDoc(countryRef, updateData);
  } catch (error) {
    console.error('Error updating country:', error);
    throw error;
  }
}

/**
 * Soft delete a country
 */
export async function softDeleteCountry(
  countryId: string,
  deletedBy: string
): Promise<void> {
  try {
    const countryRef = doc(db, COLLECTION_NAME, countryId);
    await updateDoc(countryRef, {
      isDeleted: true,
      deletedAt: Timestamp.now(),
      deletedBy: deletedBy,
    });
  } catch (error) {
    console.error('Error soft deleting country:', error);
    throw error;
  }
}

/**
 * Restore a deleted country
 */
export async function restoreCountry(countryId: string): Promise<void> {
  try {
    const countryRef = doc(db, COLLECTION_NAME, countryId);
    await updateDoc(countryRef, {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
    });
  } catch (error) {
    console.error('Error restoring country:', error);
    throw error;
  }
}

/**
 * Permanently delete a country (hard delete)
 */
export async function permanentlyDeleteCountry(countryId: string): Promise<void> {
  try {
    const countryRef = doc(db, COLLECTION_NAME, countryId);
    await deleteDoc(countryRef);
  } catch (error) {
    console.error('Error permanently deleting country:', error);
    throw error;
  }
}

/**
 * Bulk import countries from JSON data
 */
export async function bulkImportCountries(
  countries: { Name: string; isoCode: string }[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const countriesRef = collection(db, COLLECTION_NAME);
    
    countries.forEach((country) => {
      const docRef = doc(countriesRef);
      batch.set(docRef, {
        name: country.Name,
        isoCode: country.isoCode,
        categories: [],
        isDeleted: false,
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error bulk importing countries:', error);
    throw error;
  }
}
