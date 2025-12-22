import { Timestamp } from 'firebase/firestore';

export interface Prompt {
  id: string;
  title: string;
  categoryId: string;
  subCategoryId: string;
  prompt: string;
  url: string;
  tags: string[];
  isTrending: boolean;
  likes: number;
  searchCount: number;
  createdAt: Timestamp;
  createdBy: string;
  updatedBy?: string;
  updatedAt?: Timestamp;
}

export interface CreatePromptInput {
  title: string;
  categoryId: string;
  subCategoryId: string;
  prompt: string;
  url?: string;
  tags?: string[];
  isTrending?: boolean;
  likes?: number;
  searchCount?: number;
  createdBy: string;
}

export interface UpdatePromptInput {
  title?: string;
  categoryId?: string;
  subCategoryId?: string;
  prompt?: string;
  url?: string;
  tags?: string[];
  isTrending?: boolean;
  likes?: number;
  searchCount?: number;
  updatedBy?: string;
}
