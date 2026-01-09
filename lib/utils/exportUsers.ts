import { User } from '@/lib/types/user.types';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  users: User[];
  formatTimestamp: (timestamp: any) => string | null;
}

/**
 * Generate timestamp string for filename
 * Format: YYYY_MM_DD_HH_MM_SS
 */
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
}

/**
 * Escape CSV special characters
 */
function escapeCSV(value: string | number): string {
  if (typeof value === 'number') return value.toString();
  
  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Download file to user's computer
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

/**
 * Export users data to CSV format
 */
function exportToCSV(options: ExportOptions): void {
  const { users, formatTimestamp } = options;

  // Define CSV headers
  const headers = [
    'ID',
    'Name',
    'Email',
    'Role',
    'Provider',
    'Language',
    'Photo URL',
    'Created At',
    'Last Login',
  ];

  // Convert users to CSV rows
  const rows = users.map(user => {
    return [
      user.id,
      escapeCSV(user.name || ''),
      escapeCSV(user.email || ''),
      escapeCSV(user.role || 'user'),
      escapeCSV(user.provider || ''),
      escapeCSV(user.language || ''),
      escapeCSV(user.photoURL || ''),
      formatTimestamp(user.createdAt) || 'N/A',
      formatTimestamp(user.lastLogin) || 'N/A',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `users_export_${timestamp}.csv`;

  // Download CSV file
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export users data to JSON format
 */
function exportToJSON(options: ExportOptions): void {
  const { users, formatTimestamp } = options;

  // Convert users to JSON format with additional information
  const exportData = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    provider: user.provider,
    language: user.language,
    photoURL: user.photoURL || null,
    createdAt: formatTimestamp(user.createdAt),
    lastLogin: formatTimestamp(user.lastLogin),
  }));

  const jsonContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    totalUsers: users.length,
    users: exportData,
  }, null, 2);

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `users_export_${timestamp}.json`;

  // Download JSON file
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Main export function
 */
export function exportUsers(format: ExportFormat, options: ExportOptions): void {
  if (format === 'csv') {
    exportToCSV(options);
  } else if (format === 'json') {
    exportToJSON(options);
  }
}
