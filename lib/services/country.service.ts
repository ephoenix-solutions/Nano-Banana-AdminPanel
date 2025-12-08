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
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import {
  Country,
  CreateCountryInput,
  UpdateCountryInput,
} from '@/lib/types/country.types';

const COLLECTION_NAME = 'countries';

/**
 * Get all countries
 */
export async function getAllCountries(): Promise<Country[]> {
  try {
    const countriesRef = collection(db, COLLECTION_NAME);
    const q = query(countriesRef, orderBy('name', 'asc'));
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
 * Create a new country
 */
export async function createCountry(countryData: CreateCountryInput): Promise<string> {
  try {
    const countriesRef = collection(db, COLLECTION_NAME);
    
    const newCountry = {
      name: countryData.name,
      isoCode: countryData.isoCode,
      categories: countryData.categories || [],
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
    
    await updateDoc(countryRef, updateData);
  } catch (error) {
    console.error('Error updating country:', error);
    throw error;
  }
}

/**
 * Delete a country
 */
export async function deleteCountry(countryId: string): Promise<void> {
  try {
    const countryRef = doc(db, COLLECTION_NAME, countryId);
    await deleteDoc(countryRef);
  } catch (error) {
    console.error('Error deleting country:', error);
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
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error bulk importing countries:', error);
    throw error;
  }
}
