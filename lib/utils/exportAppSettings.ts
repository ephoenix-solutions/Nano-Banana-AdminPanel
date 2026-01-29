import { AppSettings } from '@/lib/types/app-settings.types';

export type ExportFormat = 'csv' | 'json';

/**
 * Export app settings to CSV or JSON
 */
export function exportAppSettings(
  format: ExportFormat,
  settings: AppSettings | null
): void {
  if (!settings) {
    console.error('No settings to export');
    return;
  }

  if (format === 'csv') {
    exportAsCSV(settings);
  } else if (format === 'json') {
    exportAsJSON(settings);
  }
}

/**
 * Export as CSV
 */
function exportAsCSV(settings: AppSettings): void {
  const headers = ['Field', 'Value'];

  const rows = [
    ['Minimum Version', settings.minimumVersion],
    ['Live Version', settings.liveVersion],
    ['Max Accounts Per Device', String(settings.maxAccountsPerDevice)],
    ['Supported Languages', settings.languagesSupported.join(', ')],
    ['Privacy Policy URL', settings.privacyPolicy || '(empty)'],
    ['Terms & Conditions URL', settings.terms || '(empty)'],
    ['Banner Images', `${settings.banners?.length || 0} image${settings.banners?.length !== 1 ? 's' : ''}`],
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  downloadFile(
    csvContent,
    `app-settings-${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv'
  );
}

/**
 * Export as JSON
 */
function exportAsJSON(settings: AppSettings): void {
  const jsonData = {
    minimumVersion: settings.minimumVersion,
    liveVersion: settings.liveVersion,
    maxAccountsPerDevice: settings.maxAccountsPerDevice,
    languagesSupported: settings.languagesSupported,
    privacyPolicy: settings.privacyPolicy,
    terms: settings.terms,
    banners: settings.banners || [],
    exportedAt: new Date().toISOString(),
  };

  const jsonContent = JSON.stringify(jsonData, null, 2);

  downloadFile(
    jsonContent,
    `app-settings-${new Date().toISOString().split('T')[0]}.json`,
    'application/json'
  );
}

/**
 * Helper function to download file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
