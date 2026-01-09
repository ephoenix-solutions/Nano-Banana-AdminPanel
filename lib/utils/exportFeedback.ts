import { Feedback } from '@/lib/types/feedback.types';
import { User } from '@/lib/types/user.types';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  feedback: Feedback[];
  userCache: Record<string, User>;
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
 * Export feedback data to CSV format
 */
function exportToCSV(options: ExportOptions): void {
  const { feedback, userCache, formatTimestamp } = options;

  // Define CSV headers
  const headers = [
    'ID',
    'User Name',
    'User Email',
    'Rating',
    'Message',
    'Device Model',
    'Device OS',
    'App Version',
    'Created At',
  ];

  // Convert feedback to CSV rows
  const rows = feedback.map(fb => {
    const user = userCache[fb.userId];
    
    return [
      fb.id,
      escapeCSV(user?.name || 'Unknown User'),
      escapeCSV(user?.email || 'N/A'),
      fb.rating,
      escapeCSV(fb.message || ''),
      escapeCSV(fb.deviceInfo?.model || 'N/A'),
      escapeCSV(fb.deviceInfo?.os || 'N/A'),
      escapeCSV(fb.deviceInfo?.appVersion || 'N/A'),
      formatTimestamp(fb.createdAt) || 'N/A',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `feedback_export_${timestamp}.csv`;

  // Download CSV file
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export feedback data to JSON format
 */
function exportToJSON(options: ExportOptions): void {
  const { feedback, userCache, formatTimestamp } = options;

  // Convert feedback to JSON format with additional information
  const exportData = feedback.map(fb => {
    const user = userCache[fb.userId];
    
    return {
      id: fb.id,
      user: {
        id: fb.userId,
        name: user?.name || 'Unknown User',
        email: user?.email || 'N/A',
      },
      rating: fb.rating,
      message: fb.message,
      deviceInfo: {
        model: fb.deviceInfo?.model || 'N/A',
        os: fb.deviceInfo?.os || 'N/A',
        appVersion: fb.deviceInfo?.appVersion || 'N/A',
      },
      createdAt: formatTimestamp(fb.createdAt),
    };
  });

  // Calculate statistics
  const totalFeedback = feedback.length;
  const averageRating = totalFeedback > 0 
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(2)
    : '0.00';
  
  const ratingDistribution = {
    5: feedback.filter(f => f.rating === 5).length,
    4: feedback.filter(f => f.rating === 4).length,
    3: feedback.filter(f => f.rating === 3).length,
    2: feedback.filter(f => f.rating === 2).length,
    1: feedback.filter(f => f.rating === 1).length,
  };

  const jsonContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    totalFeedback,
    averageRating,
    ratingDistribution,
    feedback: exportData,
  }, null, 2);

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `feedback_export_${timestamp}.json`;

  // Download JSON file
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Main export function
 */
export function exportFeedback(format: ExportFormat, options: ExportOptions): void {
  if (format === 'csv') {
    exportToCSV(options);
  } else if (format === 'json') {
    exportToJSON(options);
  }
}
