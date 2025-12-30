import { Timestamp } from 'firebase/firestore';
import { Category } from '@/lib/types/category.types';

/**
 * Format a Firestore Timestamp to a readable date string
 */
export function formatTimestamp(timestamp: any): string {
  if (!timestamp) return 'N/A';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Get category name by ID
 */
export function getCategoryName(categories: Category[], categoryId: string): string {
  const category = categories.find((c) => c.id === categoryId);
  return category?.name || 'Unknown';
}

/**
 * Get subcategory name by category ID and subcategory ID
 */
export function getSubcategoryName(
  categories: Category[],
  categoryId: string,
  subcategoryId: string
): string {
  const category = categories.find((c) => c.id === categoryId);
  const subcategory = category?.subcategories?.find((s) => s.id === subcategoryId);
  return subcategory?.name || 'Unknown';
}
