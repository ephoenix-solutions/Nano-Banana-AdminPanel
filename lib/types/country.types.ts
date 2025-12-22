import { Timestamp } from 'firebase/firestore';

export interface Country {
  id: string;
  name: string;
  isoCode: string;
  categories: string[];
  createdAt: Timestamp;
  createdBy: string;
  updatedBy?: string;
  updatedAt?: Timestamp;
}

export interface CreateCountryInput {
  name: string;
  isoCode: string;
  categories?: string[];
  createdBy: string;
}

export interface UpdateCountryInput {
  name?: string;
  isoCode?: string;
  categories?: string[];
  updatedBy?: string;
}
  