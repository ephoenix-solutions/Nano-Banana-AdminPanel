import { Timestamp } from 'firebase/firestore';

export interface AppSettingsActivity {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  changes: FieldChange[];
  timestamp: Timestamp;
  createdAt: Timestamp;
}

export interface FieldChange {
  field: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
}

export interface CreateAppSettingsActivityInput {
  adminId: string;
  adminName: string;
  adminEmail: string;
  changes: FieldChange[];
}
