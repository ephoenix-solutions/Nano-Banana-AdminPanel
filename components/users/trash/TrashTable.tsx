import { User } from '@/lib/types/user.types';
import { SortField, SortOrder } from '@/lib/hooks/useUsersTrash';
import { Timestamp } from 'firebase/firestore';
import TrashTableRow from './TrashTableRow';
import SortableHeader from './SortableHeader';

interface TrashTableProps {
  users: User[];
  userCache: Record<string, User>;
  sortField: SortField;
  sortOrder: SortOrder;
  formatTimestamp: (timestamp: Timestamp) => string;
  getDeletedById: (user: User) => string | null;
  onSort: (field: SortField) => void;
  onView: (user: User) => void;
  onRestore: (user: User) => void;
  onPermanentDelete: (user: User) => void;
}

export default function TrashTable({
  users,
  userCache,
  sortField,
  sortOrder,
  formatTimestamp,
  getDeletedById,
  onSort,
  onView,
  onRestore,
  onPermanentDelete,
}: TrashTableProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="overflow-x-visible">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              {/* Name */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="name"
                  label="Name"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Provider */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="provider"
                  label="Provider"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Role */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="role"
                  label="Role"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Language */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Language
              </th>
              {/* Created At */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Created At
              </th>
              {/* Created By */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Created By
              </th>
              {/* Last Login */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Last Login
              </th>
              {/* Deleted By - EXTRA COLUMN */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="deletedAt"
                  label="Deleted By"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Actions */}
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <TrashTableRow
                key={user.id}
                user={user}
                index={index}
                userCache={userCache}
                formatTimestamp={formatTimestamp}
                getDeletedById={getDeletedById}
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
