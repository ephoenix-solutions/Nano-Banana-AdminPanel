export interface AppSettings {
  id: string;
  languagesSupported: string[];
  privacyPolicy: string;
  terms: string;
  currentVersion: string;
  latestVersion: string;
}

export interface UpdateAppSettingsInput {
  languagesSupported?: string[];
  privacyPolicy?: string;
  terms?: string;
  currentVersion?: string;
  latestVersion?: string;
}
