import { Device } from '@/lib/types/device.types';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  devices: Device[];
  formatTimestamp: (timestamp: any) => string;
}

/**
 * Export devices to CSV or JSON
 */
export function exportDevices(
  format: ExportFormat,
  options: ExportOptions
): void {
  const { devices, formatTimestamp } = options;

  if (format === 'csv') {
    exportAsCSV(devices, formatTimestamp);
  } else if (format === 'json') {
    exportAsJSON(devices, formatTimestamp);
  }
}

/**
 * Export as CSV
 */
function exportAsCSV(
  devices: Device[],
  formatTimestamp: (timestamp: any) => string
): void {
  const headers = [
    'Device ID',
    'Model',
    'OS',
    'App Version',
    'Account Count',
    'Account IDs',
    'Account Names',
    'Account Emails',
    'First Login',
    'Last Login',
  ];

  const rows = devices.map((device) => [
    device.deviceId,
    device.deviceInfo.model,
    device.deviceInfo.os,
    device.deviceInfo.appVersion,
    String(device.accountCount),
    device.accountIds.join('; '),
    device.accounts.map((a) => a.name).join('; '),
    device.accounts.map((a) => a.email).join('; '),
    formatTimestamp(device.firstLoginAt),
    formatTimestamp(device.lastLoginAt),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  downloadFile(
    csvContent,
    `devices-${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv'
  );
}

/**
 * Export as JSON
 */
function exportAsJSON(
  devices: Device[],
  formatTimestamp: (timestamp: any) => string
): void {
  const jsonData = devices.map((device) => ({
    deviceId: device.deviceId,
    deviceInfo: device.deviceInfo,
    accountCount: device.accountCount,
    accountIds: device.accountIds,
    accounts: device.accounts.map((acc) => ({
      userId: acc.userId,
      email: acc.email,
      name: acc.name,
      photoURL: acc.photoURL,
      firstLoginAt: formatTimestamp(acc.firstLoginAt),
      lastLoginAt: formatTimestamp(acc.lastLoginAt),
    })),
    firstLoginAt: formatTimestamp(device.firstLoginAt),
    lastLoginAt: formatTimestamp(device.lastLoginAt),
    createdAt: formatTimestamp(device.createdAt),
    updatedAt: formatTimestamp(device.updatedAt),
  }));

  const jsonContent = JSON.stringify(jsonData, null, 2);

  downloadFile(
    jsonContent,
    `devices-${new Date().toISOString().split('T')[0]}.json`,
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
