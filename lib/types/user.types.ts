import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  createdAt: Timestamp;
  email: string;
  language: string;
  lastLogin: Timestamp;
  name: string;
  photoURL: string;
  provider: string;
}

export interface CreateUserInput {
  email: string;
  language: string;
  name: string;
  photoURL?: string;
  provider: string;
}

export interface UpdateUserInput {
  email?: string;
  language?: string;
  name?: string;
  photoURL?: string;
  provider?: string;
}
