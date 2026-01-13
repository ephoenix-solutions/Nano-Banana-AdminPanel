import { Country } from '@/lib/types/country.types';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  countries: Country[];
  getCategoryNames: (categoryIds: string[]) => string;
  fetchUserName: (userId: string) => Promise<string>;
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
 * Export countries data to CSV format
 */
async function exportToCSV(options: ExportOptions): Promise<void> {
  const { countries, getCategoryNames, fetchUserName, formatTimestamp } = options;

  // Define CSV headers
  const headers = [
    'ID',
    'Name',
    'ISO Code',
    'Categories',
    'Categories Count',
    'Created By',
    'Created At',
    'Updated By',
    'Updated At',
  ];

  // Convert countries to CSV rows (need to fetch user names)
  const rows = await Promise.all(
    countries.map(async (country) => {
      const createdBy = await fetchUserName(country.createdBy);
      const updatedBy = country.updatedBy ? await fetchUserName(country.updatedBy) : 'N/A';
      
      return [
        country.id,
        escapeCSV(country.name || ''),
        escapeCSV(country.isoCode || ''),
        escapeCSV(getCategoryNames(country.categories || [])),
        country.categories?.length || 0,
        escapeCSV(createdBy),
        formatTimestamp(country.createdAt) || 'N/A',
        escapeCSV(updatedBy),
        formatTimestamp(country.updatedAt) || 'N/A',
      ];
    })
  );

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `countries_export_${timestamp}.csv`;

  // Download CSV file
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export countries data to JSON format
 */
async function exportToJSON(options: ExportOptions): Promise<void> {
  const { countries, getCategoryNames, fetchUserName, formatTimestamp } = options;

  // Convert countries to JSON format with additional information
  const exportData = await Promise.all(
    countries.map(async (country) => ({
      id: country.id,
      name: country.name,
      isoCode: country.isoCode,
      categories: {
        ids: country.categories || [],
        names: getCategoryNames(country.categories || []),
        count: country.categories?.length || 0,
      },
      createdBy: {
        id: country.createdBy,
        name: await fetchUserName(country.createdBy),
      },
      createdAt: formatTimestamp(country.createdAt),
      updatedBy: country.updatedBy ? {
        id: country.updatedBy,
        name: await fetchUserName(country.updatedBy),
      } : null,
      updatedAt: formatTimestamp(country.updatedAt) || null,
    }))
  );

  const jsonContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    totalCountries: countries.length,
    countries: exportData,
  }, null, 2);

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `countries_export_${timestamp}.json`;

  // Download JSON file
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Main export function
 */
export async function exportCountries(format: ExportFormat, options: ExportOptions): Promise<void> {
  if (format === 'csv') {
    await exportToCSV(options);
  } else if (format === 'json') {
    await exportToJSON(options);
  }
}
