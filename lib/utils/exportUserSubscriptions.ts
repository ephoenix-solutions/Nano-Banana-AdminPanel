import { UserSubscription } from '@/lib/types/user-subscription.types';
import { Timestamp } from 'firebase/firestore';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  subscriptions: UserSubscription[];
  getUserName: (userId: string) => string;
  getPlanName: (planId: string) => string;
  formatTimestamp: (timestamp: Timestamp) => string;
  isExpired: (endDate: Timestamp) => boolean;
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
function escapeCSV(value: string | number | boolean): string {
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  
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
 * Export user subscriptions data to CSV format
 */
function exportToCSV(options: ExportOptions): void {
  const { subscriptions, getUserName, getPlanName, formatTimestamp, isExpired } = options;

  // Define CSV headers
  const headers = [
    'ID',
    'User Name',
    'Plan Name',
    'Start Date',
    'End Date',
    'Is Active',
    'Is Expired',
    'Payment Method',
    'Transaction ID',
  ];

  // Convert subscriptions to CSV rows
  const rows = subscriptions.map(subscription => {
    return [
      subscription.id,
      escapeCSV(getUserName(subscription.userId)),
      escapeCSV(getPlanName(subscription.planId)),
      formatTimestamp(subscription.startDate),
      formatTimestamp(subscription.endDate),
      escapeCSV(subscription.isActive),
      escapeCSV(isExpired(subscription.endDate)),
      escapeCSV(subscription.paymentMethod || ''),
      escapeCSV(subscription.transactionId || ''),
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `user_subscriptions_export_${timestamp}.csv`;

  // Download CSV file
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export user subscriptions data to JSON format
 */
function exportToJSON(options: ExportOptions): void {
  const { subscriptions, getUserName, getPlanName, formatTimestamp, isExpired } = options;

  // Convert subscriptions to JSON format with additional information
  const exportData = subscriptions.map(subscription => ({
    id: subscription.id,
    user: {
      id: subscription.userId,
      name: getUserName(subscription.userId),
    },
    plan: {
      id: subscription.planId,
      name: getPlanName(subscription.planId),
    },
    startDate: formatTimestamp(subscription.startDate),
    endDate: formatTimestamp(subscription.endDate),
    isActive: subscription.isActive,
    isExpired: isExpired(subscription.endDate),
    paymentMethod: subscription.paymentMethod || null,
    transactionId: subscription.transactionId || null,
  }));

  const jsonContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(s => s.isActive).length,
    expiredSubscriptions: subscriptions.filter(s => isExpired(s.endDate)).length,
    subscriptions: exportData,
  }, null, 2);

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `user_subscriptions_export_${timestamp}.json`;

  // Download JSON file
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Main export function
 */
export function exportUserSubscriptions(format: ExportFormat, options: ExportOptions): void {
  if (format === 'csv') {
    exportToCSV(options);
  } else if (format === 'json') {
    exportToJSON(options);
  }
}
