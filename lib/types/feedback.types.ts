import { Timestamp } from 'firebase/firestore';

export interface DeviceInfo {
  model: string;
  os: string;
  appVersion: string;
}

export interface Feedback {
  id: string;
  userId: string;
  message: string;
  rating: number;
  deviceInfo: DeviceInfo;
  createdAt: Timestamp;
}
