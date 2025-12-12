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
  role: string; // 'user' or 'admin'
  password?: string; // Hashed password (optional for backward compatibility)
}

export interface CreateUserInput {
  email: string;
  language: string;
  name: string;
  photoURL?: string;
  provider: string;
  role?: string; // Optional, defaults to 'user'
  password?: string; // Hashed password (optional)
}

export interface UpdateUserInput {
  email?: string;
  language?: string;
  name?: string;
  photoURL?: string;
  provider?: string;
  role?: string;
  password?: string; // Hashed password (optional)
}
