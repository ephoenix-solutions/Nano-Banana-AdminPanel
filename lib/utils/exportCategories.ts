import { Category } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  categories: Category[];
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
 * Export categories data to CSV format
 */
function exportToCSV(options: ExportOptions): void {
  const { categories, userCache, formatTimestamp } = options;

  // Define CSV headers
  const headers = [
    'ID',
    'Name',
    'Order',
    'Search Count',
    'Subcategories Count',
    'Icon Image',
    'Created By',
    'Created At',
    'Updated By',
    'Updated At',
  ];

  // Convert categories to CSV rows
  const rows = categories.map(category => {
    const createdBy = userCache[category.createdBy]?.name || 'Unknown';
    const updatedBy = category.updatedBy ? (userCache[category.updatedBy]?.name || 'Unknown') : 'N/A';
    
    return [
      category.id,
      escapeCSV(category.name || ''),
      category.order,
      category.searchCount || 0,
      category.subcategories?.length || 0,
      escapeCSV(category.iconImage || ''),
      escapeCSV(createdBy),
      formatTimestamp(category.createdAt) || 'N/A',
      escapeCSV(updatedBy),
      formatTimestamp(category.updatedAt) || 'N/A',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `categories_export_${timestamp}.csv`;

  // Download CSV file
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export categories data to JSON format
 */
function exportToJSON(options: ExportOptions): void {
  const { categories, userCache, formatTimestamp } = options;

  // Convert categories to JSON format with additional information
  const exportData = categories.map(category => ({
    id: category.id,
    name: category.name,
    order: category.order,
    searchCount: category.searchCount || 0,
    iconImage: category.iconImage || null,
    subcategories: category.subcategories?.map(sub => ({
      id: sub.id,
      name: sub.name,
      order: sub.order,
      searchCount: sub.searchCount || 0,
      createdBy: {
        id: sub.createdBy,
        name: userCache[sub.createdBy]?.name || 'Unknown',
      },
      createdAt: formatTimestamp(sub.createdAt),
      updatedBy: sub.updatedBy ? {
        id: sub.updatedBy,
        name: userCache[sub.updatedBy]?.name || 'Unknown',
      } : null,
      updatedAt: formatTimestamp(sub.updatedAt) || null,
    })) || [],
    createdBy: {
      id: category.createdBy,
      name: userCache[category.createdBy]?.name || 'Unknown',
    },
    createdAt: formatTimestamp(category.createdAt),
    updatedBy: category.updatedBy ? {
      id: category.updatedBy,
      name: userCache[category.updatedBy]?.name || 'Unknown',
    } : null,
    updatedAt: formatTimestamp(category.updatedAt) || null,
  }));

  const jsonContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    totalCategories: categories.length,
    totalSubcategories: categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0),
    categories: exportData,
  }, null, 2);

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `categories_export_${timestamp}.json`;

  // Download JSON file
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Main export function
 */
export function exportCategories(format: ExportFormat, options: ExportOptions): void {
  if (format === 'csv') {
    exportToCSV(options);
  } else if (format === 'json') {
    exportToJSON(options);
  }
}
