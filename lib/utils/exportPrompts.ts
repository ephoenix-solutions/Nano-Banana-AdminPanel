import { Prompt } from '@/lib/types/prompt.types';
import { User } from '@/lib/types/user.types';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  prompts: Prompt[];
  userCache: Record<string, User>;
  getCategoryName: (categoryId: string) => string;
  getSubcategoryName: (categoryId: string, subcategoryId: string) => string;
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
 * Export prompts data to CSV format
 */
function exportToCSV(options: ExportOptions): void {
  const { prompts, userCache, getCategoryName, getSubcategoryName, formatTimestamp } = options;

  // Define CSV headers
  const headers = [
    'ID',
    'Title',
    'Prompt',
    'Category',
    'Subcategory',
    'Image Requirement',
    'Is Trending',
    'Likes Count',
    'Saves Count',
    'Search Count',
    'Tags',
    'Image URL',
    'Created By',
    'Created At',
    'Updated By',
    'Updated At',
  ];

  // Convert prompts to CSV rows
  const rows = prompts.map(prompt => {
    const createdBy = userCache[prompt.createdBy]?.name || 'Unknown';
    const updatedBy = prompt.updatedBy ? (userCache[prompt.updatedBy]?.name || 'Unknown') : 'N/A';
    
    return [
      prompt.id,
      escapeCSV(prompt.title || ''),
      escapeCSV(prompt.prompt || ''),
      escapeCSV(getCategoryName(prompt.categoryId)),
      escapeCSV(getSubcategoryName(prompt.categoryId, prompt.subCategoryId)),
      prompt.imageRequirement === -1 ? 'None' : prompt.imageRequirement === 0 ? 'Optional' : prompt.imageRequirement,
      prompt.isTrending ? 'Yes' : 'No',
      prompt.likesCount || 0,
      prompt.savesCount || 0,
      prompt.searchCount || 0,
      escapeCSV((prompt.tags || []).join(', ')),
      escapeCSV(prompt.url || ''),
      escapeCSV(createdBy),
      formatTimestamp(prompt.createdAt) || 'N/A',
      escapeCSV(updatedBy),
      formatTimestamp(prompt.updatedAt) || 'N/A',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `prompts_export_${timestamp}.csv`;

  // Download CSV file
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export prompts data to JSON format
 */
function exportToJSON(options: ExportOptions): void {
  const { prompts, userCache, getCategoryName, getSubcategoryName, formatTimestamp } = options;

  // Convert prompts to JSON format with additional information
  const exportData = prompts.map(prompt => ({
    id: prompt.id,
    title: prompt.title,
    prompt: prompt.prompt,
    category: {
      id: prompt.categoryId,
      name: getCategoryName(prompt.categoryId),
    },
    subcategory: {
      id: prompt.subCategoryId,
      name: getSubcategoryName(prompt.categoryId, prompt.subCategoryId),
    },
    imageRequirement: prompt.imageRequirement,
    imageRequirementText: prompt.imageRequirement === -1 ? 'None' : prompt.imageRequirement === 0 ? 'Optional' : `${prompt.imageRequirement} Required`,
    isTrending: prompt.isTrending,
    stats: {
      likes: prompt.likesCount || 0,
      saves: prompt.savesCount || 0,
      searches: prompt.searchCount || 0,
    },
    tags: prompt.tags || [],
    imageUrl: prompt.url || null,
    createdBy: {
      id: prompt.createdBy,
      name: userCache[prompt.createdBy]?.name || 'Unknown',
      email: userCache[prompt.createdBy]?.email || null,
    },
    createdAt: formatTimestamp(prompt.createdAt),
    updatedBy: prompt.updatedBy ? {
      id: prompt.updatedBy,
      name: userCache[prompt.updatedBy]?.name || 'Unknown',
      email: userCache[prompt.updatedBy]?.email || null,
    } : null,
    updatedAt: formatTimestamp(prompt.updatedAt) || null,
  }));

  const jsonContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    totalPrompts: prompts.length,
    prompts: exportData,
  }, null, 2);

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `prompts_export_${timestamp}.json`;

  // Download JSON file
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Main export function
 */
export function exportPrompts(format: ExportFormat, options: ExportOptions): void {
  if (format === 'csv') {
    exportToCSV(options);
  } else if (format === 'json') {
    exportToJSON(options);
  }
}
