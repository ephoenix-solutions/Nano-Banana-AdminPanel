export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  photoURL: string;
  role: string;
  provider: string;
  language: string;
  createdAt?: any; // Timestamp from Firestore
  lastLogin?: any; // Timestamp from Firestore
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}
