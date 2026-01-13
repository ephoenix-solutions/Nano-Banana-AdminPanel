import { UserGeneration } from '@/lib/types/user-generation.types';
import { User } from '@/lib/types/user.types';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';
import { SortField, SortOrder } from '@/lib/hooks/useUserGenerationsList';
import SortableHeader from './SortableHeader';
import TableRow from './TableRow';

interface GenerationsTableProps {
  generations: UserGeneration[];
  userCache: Record<string, User>;
  planCache: Record<string, SubscriptionPlan>;
  sortField: SortField;
  sortOrder: SortOrder;
  formatTimestamp: (timestamp: any) => string | null;
  getStatusColor: (status: string) => string;
  getStatusBadge: (status: string) => string;
  onSort: (field: SortField) => void;
  onView: (generation: UserGeneration) => void;
  onDelete: (generation: UserGeneration) => void;
}

export default function GenerationsTable({
  generations,
  userCache,
  planCache,
  sortField,
  sortOrder,
  formatTimestamp,
  getStatusColor,
  getStatusBadge,
  onSort,
  onView,
  onDelete,
}: GenerationsTableProps) {
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
                  field="userId"
                  label="User"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Prompt Text
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="generationStatus"
                  label="Status"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Plan
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Processing Time
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
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {generations.map((generation, index) => (
              <TableRow
                key={generation.id}
                generation={generation}
                index={index}
                userCache={userCache}
                planCache={planCache}
                formatTimestamp={formatTimestamp}
                getStatusColor={getStatusColor}
                getStatusBadge={getStatusBadge}
                onView={onView}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
