import { Prompt } from '@/lib/types/prompt.types';
import { User } from '@/lib/types/user.types';
import { SortField, SortOrder } from '@/lib/hooks/usePromptsTrash';
import TrashTableRow from './TrashTableRow';
import SortableHeader from './SortableHeader';

interface TrashTableProps {
  prompts: Prompt[];
  userCache: Record<string, User>;
  sortField: SortField;
  sortOrder: SortOrder;
  getCategoryName: (categoryId: string) => string;
  getSubcategoryName: (categoryId: string, subcategoryId: string) => string;
  formatTimestamp: (timestamp: any) => string | null;
  onSort: (field: SortField) => void;
  onView: (prompt: Prompt) => void;
  onRestore: (prompt: Prompt) => void;
  onPermanentDelete: (prompt: Prompt) => void;
}

export default function TrashTable({
  prompts,
  userCache,
  sortField,
  sortOrder,
  getCategoryName,
  getSubcategoryName,
  formatTimestamp,
  onSort,
  onView,
  onRestore,
  onPermanentDelete,
}: TrashTableProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="overflow-x-visible">
        <table className="w-full table-fixed">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              {/* Image - Fixed width */}
              <th className="w-24 px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Image
              </th>
              {/* Title - Flexible */}
              <th className="w-64 px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="title"
                  label="Title"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Required - Fixed width */}
              <th className="w-24 px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Required
              </th>
              {/* Category - Fixed width */}
              <th className="w-48 px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="category"
                  label="Category"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Trending - Fixed width */}
              <th className="w-24 px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Trending
              </th>
              {/* Stats (Likes, Searches, Saves) - Combined Column */}
              <th className="w-32 px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Stats
              </th>
              {/* Created At - Fixed width */}
              <th className="w-48 px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Created At
              </th>
              {/* Updated By - Fixed width */}
              <th className="w-48 px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Updated By
              </th>
              {/* Deleted By - Fixed width - EXTRA COLUMN */}
              <th className="w-48 px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="deletedAt"
                  label="Deleted By"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Actions - Fixed width */}
              <th className="w-32 px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((prompt, index) => (
              <TrashTableRow
                key={prompt.id}
                prompt={prompt}
                index={index}
                userCache={userCache}
                getCategoryName={getCategoryName}
                getSubcategoryName={getSubcategoryName}
                formatTimestamp={formatTimestamp}
                onView={onView}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
