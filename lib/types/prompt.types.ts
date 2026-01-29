import { Timestamp } from 'firebase/firestore';

export interface Prompt {
  id: string;
  title: string;
  categoryId: string;
  subCategoryId: string;
  prompt: string;
  url: string;
  imageRequirement: number; // -1: none, 0: optional, 1-4: required count
  tags: string[];
  isTrending: boolean;
  likesCount: number;
  savesCount: number;
  searchCount: number;
  createdAt: Timestamp;
  createdBy: string;
  updatedBy?: string;
  updatedAt?: Timestamp;
  // Soft delete fields
  isDeleted: boolean;
  deletedAt?: Timestamp;
  deletedBy?: string;
}

export interface CreatePromptInput {
  title: string;
  categoryId: string;
  subCategoryId: string;
  prompt: string;
  url?: string;
  imageRequirement?: number; // -1: none, 0: optional, 1-4: required count
  tags?: string[];
  isTrending?: boolean;
  likesCount?: number;
  savesCount?: number;
  searchCount?: number;
  createdBy: string;
}

export interface UpdatePromptInput {
  title?: string;
  categoryId?: string;
  subCategoryId?: string;
  prompt?: string;
  url?: string;
  imageRequirement?: number; // -1: none, 0: optional, 1-4: required count
  tags?: string[];
  isTrending?: boolean;
  likesCount?: number;
  savesCount?: number;
  searchCount?: number;
  updatedBy?: string;
  // Soft delete fields
  isDeleted?: boolean;
  deletedAt?: Timestamp;
  deletedBy?: string;
}
