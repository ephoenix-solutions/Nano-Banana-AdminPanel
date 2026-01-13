import { Icons } from '@/config/icons';
import { UserGeneration } from '@/lib/types/user-generation.types';
import { User } from '@/lib/types/user.types';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';
import UserCell from './UserCell';
import { useState } from 'react';

interface TableRowProps {
  generation: UserGeneration;
  index: number;
  userCache: Record<string, User>;
  planCache: Record<string, SubscriptionPlan>;
  formatTimestamp: (timestamp: any) => string | null;
  getStatusColor: (status: string) => string;
  getStatusBadge: (status: string) => string;
  onView: (generation: UserGeneration) => void;
  onDelete: (generation: UserGeneration) => void;
}

export default function TableRow({
  generation,
  index,
  userCache,
  planCache,
  formatTimestamp,
  getStatusColor,
  getStatusBadge,
  onView,
  onDelete,
}: TableRowProps) {
  const user = userCache[generation.userId];
  const plan = generation.planId ? planCache[generation.planId] : null;
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <>
      <tr
        className={`transition-colors ${index % 2 === 0
            ? 'bg-white hover:bg-background/50'
            : 'bg-background hover:bg-background-200'
          }`}
      >

        {/* Generated Image Column */}
        <td className="px-6 py-4 text-sm text-primary font-body">
          {generation.imageUrl && generation.generationStatus === 'success' ? (
            <div
              className="relative group cursor-pointer"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={generation.imageUrl}
                alt="Generated"
                className="w-16 h-16 rounded-lg object-cover border border-primary/10 hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Icons.eye size={20} className="text-white" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center border border-primary/10">
              <Icons.images size={24} className="text-secondary/40" />
            </div>
          )}
        </td>

        {/* User Column */}
        <td className="px-6 py-4 text-sm text-primary font-body">
          <UserCell user={user} userId={generation.userId} />
        </td>

        {/* Prompt Text Column */}
        <td className="px-6 py-4 text-sm text-primary font-body">
          <p className="line-clamp-2 max-w-md">
            {generation.promptText}
          </p>
        </td>

        {/* Status Column */}
        <td className="px-6 py-4 text-sm text-primary font-body">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(
              generation.generationStatus
            )}`}
          >
            {generation.generationStatus === 'success' && (
              <Icons.check size={14} className="mr-1" />
            )}
            {generation.generationStatus === 'failed' && (
              <Icons.x size={14} className="mr-1" />
            )}
            {generation.generationStatus === 'pending' && (
              <Icons.clock size={14} className="mr-1" />
            )}
            {getStatusBadge(generation.generationStatus)}
          </span>
        </td>

        {/* Plan Column */}
        <td className="px-6 py-4 text-sm text-primary font-body">
          <span className="text-sm">{plan?.name || 'N/A'}</span>
        </td>

        {/* Processing Time Column */}
        <td className="px-6 py-4 text-sm text-primary font-body">
          <span className="text-sm">
            {generation.metadata?.processingTime
              ? `${(generation.metadata.processingTime / 1000).toFixed(2)}s`
              : 'N/A'}
          </span>
        </td>

        {/* Created At Column */}
        <td className="px-6 py-4 text-sm text-primary font-body">
          <span className="text-sm">{formatTimestamp(generation.createdAt)}</span>
        </td>

        {/* Actions Column */}
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onView(generation)}
              className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
              title="View"
            >
              <Icons.eye size={18} />
            </button>
            <button
              onClick={() => onDelete(generation)}
              className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
              title="Delete"
            >
              <Icons.trash size={18} />
            </button>
          </div>
        </td>
      </tr>

      {/* Image Modal - Higher z-index, Bigger */}
      {showImageModal && generation.imageUrl && (
        <tr>
          <td colSpan={8} className="p-0">
            <div
              className="fixed inset-0 bg-black/95 z-[2000] flex items-center justify-center p-4"
              onClick={() => setShowImageModal(false)}
            >
              <div className="relative w-full h-full flex items-center justify-center max-w-[95vw] max-h-[95vh]">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute top-4 right-4 p-3 text-white hover:text-accent transition-colors bg-black/50 rounded-lg backdrop-blur-sm z-10"
                >
                  <Icons.close size={32} />
                </button>
                <img
                  src={generation.imageUrl}
                  alt="Generated Image"
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
