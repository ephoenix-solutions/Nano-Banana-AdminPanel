import { Prompt } from '@/lib/types/prompt.types';
import { User } from '@/lib/types/user.types';
import { SortField, SortOrder } from '@/lib/hooks/usePromptsList';
import SortableHeader from './SortableHeader';
import TableRow from './TableRow';

interface PromptsTableProps {
  prompts: Prompt[];
  userCache: Record<string, User>;
  sortField: SortField;
  sortOrder: SortOrder;
  getCategoryName: (categoryId: string) => string;
  getSubcategoryName: (categoryId: string, subcategoryId: string) => string;
  formatTimestamp: (timestamp: any) => string | null;
  onSort: (field: SortField) => void;
  onView: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onToggleTrending: (promptId: string, isTrending: boolean) => void;
}

export default function PromptsTable({
  prompts,
  userCache,
  sortField,
  sortOrder,
  getCategoryName,
  getSubcategoryName,
  formatTimestamp,
  onSort,
  onView,
  onEdit,
  onDelete,
  onToggleTrending,
}: PromptsTableProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Image
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="title"
                  label="Title"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Required
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="category"
                  label="Category"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Trending
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="likes"
                  label="Likes"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="searchCount"
                  label="Searches"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="saveCount"
                  label="Saves"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="createdAt"
                  label="Created At"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="updatedAt"
                  label="Updated By"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((prompt, index) => (
              <TableRow
                key={prompt.id}
                prompt={prompt}
                index={index}
                userCache={userCache}
                getCategoryName={getCategoryName}
                getSubcategoryName={getSubcategoryName}
                formatTimestamp={formatTimestamp}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleTrending={onToggleTrending}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
