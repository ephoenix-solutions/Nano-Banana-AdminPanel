import { Timestamp } from 'firebase/firestore';

export interface Prompt {
  id: string;
  categoryId: string;
  subCategoryId: string;
  prompt: string;
  url: string;
  isTrending: boolean;
  likes: number;
  searchCount: number;
  createdAt: Timestamp;
}

export interface CreatePromptInput {
  categoryId: string;
  subCategoryId: string;
  prompt: string;
  url?: string;
  isTrending?: boolean;
  likes?: number;
  searchCount?: number;
}

export interface UpdatePromptInput {
  categoryId?: string;
  subCategoryId?: string;
  prompt?: string;
  url?: string;
  isTrending?: boolean;
  likes?: number;
  searchCount?: number;
}
