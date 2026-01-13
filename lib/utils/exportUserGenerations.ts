import { UserGeneration } from '@/lib/types/user-generation.types';
import { User } from '@/lib/types/user.types';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';

export type ExportFormat = 'csv' | 'json';

interface ExportOptions {
  generations: UserGeneration[];
  userCache: Record<string, User>;
  planCache: Record<string, SubscriptionPlan>;
  formatTimestamp: (timestamp: any) => string | null;
}

/**
 * Export user generations to CSV or JSON format
 */
export function exportUserGenerations(
  format: ExportFormat,
  options: ExportOptions
): void {
  const { generations, userCache, planCache, formatTimestamp } = options;

  if (format === 'csv') {
    exportAsCSV(generations, userCache, planCache, formatTimestamp);
  } else {
    exportAsJSON(generations, userCache, planCache, formatTimestamp);
  }
}

/**
 * Export as CSV
 */
function exportAsCSV(
  generations: UserGeneration[],
  userCache: Record<string, User>,
  planCache: Record<string, SubscriptionPlan>,
  formatTimestamp: (timestamp: any) => string | null
): void {
  // CSV Headers
  const headers = [
    'ID',
    'User Name',
    'User Email',
    'Prompt Text',
    'Status',
    'Plan',
    'Processing Time (s)',
    'Model',
    'Image URL',
    'Error Message',
    'Created At',
    'Subscription ID',
  ];

  // CSV Rows
  const rows = generations.map((gen) => {
    const user = userCache[gen.userId];
    const plan = gen.planId ? planCache[gen.planId] : null;
    const processingTime = gen.metadata?.processingTime
      ? (gen.metadata.processingTime / 1000).toFixed(2)
      : 'N/A';

    return [
      gen.id,
      user?.name || 'Unknown',
      user?.email || 'N/A',
      `"${(gen.promptText || '').replace(/"/g, '""')}"`, // Escape quotes
      gen.generationStatus,
      plan?.name || 'N/A',
      processingTime,
      gen.metadata?.model || 'N/A',
      gen.imageUrl || 'N/A',
      gen.errorMessage ? `"${gen.errorMessage.replace(/"/g, '""')}"` : 'N/A',
      formatTimestamp(gen.createdAt) || 'N/A',
      gen.subscriptionId || 'N/A',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Download
  downloadFile(csvContent, 'user-generations.csv', 'text/csv');
}

/**
 * Export as JSON
 */
function exportAsJSON(
  generations: UserGeneration[],
  userCache: Record<string, User>,
  planCache: Record<string, SubscriptionPlan>,
  formatTimestamp: (timestamp: any) => string | null
): void {
  const data = generations.map((gen) => {
    const user = userCache[gen.userId];
    const plan = gen.planId ? planCache[gen.planId] : null;

    return {
      id: gen.id,
      user: {
        id: gen.userId,
        name: user?.name || 'Unknown',
        email: user?.email || 'N/A',
      },
      promptText: gen.promptText,
      status: gen.generationStatus,
      plan: plan
        ? {
            id: plan.id,
            name: plan.name,
          }
        : null,
      processingTime: gen.metadata?.processingTime
        ? `${(gen.metadata.processingTime / 1000).toFixed(2)}s`
        : null,
      metadata: {
        model: gen.metadata?.model || null,
        parameters: gen.metadata?.parameters || null,
      },
      imageUrl: gen.imageUrl || null,
      errorMessage: gen.errorMessage || null,
      createdAt: formatTimestamp(gen.createdAt),
      subscriptionId: gen.subscriptionId || null,
    };
  });

  const jsonContent = JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      totalGenerations: generations.length,
      generations: data,
    },
    null,
    2
  );

  downloadFile(jsonContent, 'user-generations.json', 'application/json');
}

/**
 * Download file helper
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
