import { AppSettingsActivity } from '@/lib/types/app-settings-activity.types';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  activities: AppSettingsActivity[];
  formatTimestamp: (timestamp: any) => string;
}

/**
 * Export app settings activity to CSV or JSON
 */
export function exportAppSettingsActivity(
  format: ExportFormat,
  options: ExportOptions
): void {
  const { activities, formatTimestamp } = options;

  if (format === 'csv') {
    exportAsCSV(activities, formatTimestamp);
  } else if (format === 'json') {
    exportAsJSON(activities, formatTimestamp);
  }
}

/**
 * Export as CSV
 */
function exportAsCSV(
  activities: AppSettingsActivity[],
  formatTimestamp: (timestamp: any) => string
): void {
  // CSV Headers
  const headers = [
    'Timestamp',
    'Admin Name',
    'Admin Email',
    'Field Changed',
    'Old Value',
    'New Value',
  ];

  // CSV Rows
  const rows = activities.flatMap((activity) =>
    activity.changes.map((change) => [
      formatTimestamp(activity.timestamp),
      activity.adminName,
      activity.adminEmail,
      change.fieldLabel,
      String(change.oldValue),
      String(change.newValue),
    ])
  );

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  // Download
  downloadFile(
    csvContent,
    `app-settings-activity-${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv'
  );
}

/**
 * Export as JSON
 */
function exportAsJSON(
  activities: AppSettingsActivity[],
  formatTimestamp: (timestamp: any) => string
): void {
  const jsonData = activities.map((activity) => ({
    timestamp: formatTimestamp(activity.timestamp),
    adminName: activity.adminName,
    adminEmail: activity.adminEmail,
    adminId: activity.adminId,
    changes: activity.changes.map((change) => ({
      field: change.field,
      fieldLabel: change.fieldLabel,
      oldValue: change.oldValue,
      newValue: change.newValue,
    })),
  }));

  const jsonContent = JSON.stringify(jsonData, null, 2);

  downloadFile(
    jsonContent,
    `app-settings-activity-${new Date().toISOString().split('T')[0]}.json`,
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
