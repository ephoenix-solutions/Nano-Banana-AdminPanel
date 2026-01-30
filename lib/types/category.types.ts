import { Timestamp } from 'firebase/firestore';

export interface Subcategory {
  id: string;
  name: string;
  order: number;
  searchCount: number;
  createdBy: string;
  updatedBy?: string;
  updatedAt?: Timestamp;
  createdAt: Timestamp;
  // Soft delete fields
  isDeleted: boolean;
  deletedAt?: Timestamp;
  deletedBy?: string;
}

export interface Category {
  id: string;
  name: string;
  iconImage: string;
  order: number;
  searchCount: string | number;
  subcategories?: Subcategory[];
  createdBy: string;
  updatedBy?: string;
  updatedAt?: Timestamp;
  createdAt: Timestamp;
  // Soft delete fields
  isDeleted: boolean;
  deletedAt?: Timestamp;
  deletedBy?: string;
}

export interface CreateCategoryInput {
  name: string;
  iconImage?: string;
  order: number;
  searchCount?: string | number;
  createdBy: string;
  subcategories?: CreateSubcategoryInput[]; // Add subcategories array
}

export interface UpdateCategoryInput {
  name?: string;
  iconImage?: string;
  order?: number;
  searchCount?: string | number;
  updatedBy?: string;
  // Soft delete fields
  isDeleted?: boolean;
  deletedAt?: Timestamp;
  deletedBy?: string;
}

export interface CreateSubcategoryInput {
  name: string;
  order: number;
  searchCount?: number;
  createdBy: string;
}

export interface UpdateSubcategoryInput {
  name?: string;
  order?: number;
  searchCount?: number;
  updatedBy?: string;
  // Soft delete fields
  isDeleted?: boolean;
  deletedAt?: Timestamp;
  deletedBy?: string;
}
