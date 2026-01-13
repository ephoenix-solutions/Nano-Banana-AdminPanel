import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  plans: SubscriptionPlan[];
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
 * Export subscription plans data to CSV format
 */
async function exportToCSV(options: ExportOptions): Promise<void> {
  const { plans, fetchUserName, formatTimestamp } = options;

  // Define CSV headers
  const headers = [
    'ID',
    'Name',
    'Price',
    'Currency',
    'Duration Days',
    'Generation Limit',
    'Features',
    'Is Active',
    'Order',
    'Created By',
    'Created At',
    'Updated By',
    'Updated At',
  ];

  // Convert plans to CSV rows (need to fetch user names)
  const rows = await Promise.all(
    plans.map(async (plan) => {
      const createdBy = await fetchUserName(plan.createdBy);
      const updatedBy = plan.updatedBy ? await fetchUserName(plan.updatedBy) : 'N/A';
      
      return [
        plan.id,
        escapeCSV(plan.name || ''),
        escapeCSV(plan.price || ''),
        escapeCSV(plan.currency || ''),
        plan.durationDays,
        plan.generationLimit,
        escapeCSV((plan.features || []).join(', ')),
        escapeCSV(plan.isActive),
        plan.order,
        escapeCSV(createdBy),
        formatTimestamp(plan.createdAt) || 'N/A',
        escapeCSV(updatedBy),
        formatTimestamp(plan.updatedAt) || 'N/A',
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
  const filename = `subscription_plans_export_${timestamp}.csv`;

  // Download CSV file
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export subscription plans data to JSON format
 */
async function exportToJSON(options: ExportOptions): Promise<void> {
  const { plans, fetchUserName, formatTimestamp } = options;

  // Convert plans to JSON format with additional information
  const exportData = await Promise.all(
    plans.map(async (plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      durationDays: plan.durationDays,
      generationLimit: plan.generationLimit,
      features: plan.features || [],
      isActive: plan.isActive,
      order: plan.order,
      createdBy: {
        id: plan.createdBy,
        name: await fetchUserName(plan.createdBy),
      },
      createdAt: formatTimestamp(plan.createdAt),
      updatedBy: plan.updatedBy ? {
        id: plan.updatedBy,
        name: await fetchUserName(plan.updatedBy),
      } : null,
      updatedAt: formatTimestamp(plan.updatedAt) || null,
    }))
  );

  const jsonContent = JSON.stringify({
    exportDate: new Date().toISOString(),
    totalPlans: plans.length,
    activePlans: plans.filter(p => p.isActive).length,
    plans: exportData,
  }, null, 2);

  // Generate filename with timestamp
  const timestamp = generateTimestamp();
  const filename = `subscription_plans_export_${timestamp}.json`;

  // Download JSON file
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Main export function
 */
export async function exportSubscriptionPlans(format: ExportFormat, options: ExportOptions): Promise<void> {
  if (format === 'csv') {
    await exportToCSV(options);
  } else if (format === 'json') {
    await exportToJSON(options);
  }
}
