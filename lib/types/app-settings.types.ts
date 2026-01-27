export interface AppSettings {
  id: string;
  languagesSupported: string[];
  privacyPolicy: string;
  terms: string;
  minimumVersion: string;
  liveVersion: string;
  banner: string;
  maxAccountsPerDevice: number;
}

export interface UpdateAppSettingsInput {
  languagesSupported?: string[];
  privacyPolicy?: string;
  terms?: string;
  minimumVersion?: string;
  liveVersion?: string;
  banner?: string;
  maxAccountsPerDevice?: number;
}
