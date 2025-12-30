import { Feedback } from '@/lib/types/feedback.types';
import { User } from '@/lib/types/user.types';
import { SortField, SortOrder } from '@/lib/hooks/useFeedbackList';
import SortableHeader from './SortableHeader';
import TableRow from './TableRow';

interface FeedbackTableProps {
  feedback: Feedback[];
  userCache: Record<string, User>;
  sortField: SortField;
  sortOrder: SortOrder;
  formatTimestamp: (timestamp: any) => string | null;
  onSort: (field: SortField) => void;
  onView: (feedback: Feedback) => void;
  onDelete: (feedback: Feedback) => void;
}

export default function FeedbackTable({
  feedback,
  userCache,
  sortField,
  sortOrder,
  formatTimestamp,
  onSort,
  onView,
  onDelete,
}: FeedbackTableProps) {
  const renderStars = (rating: number) => {
    const emojis = ["😡", "😕", "😐", "🙂", "🥰"];
    const emoji = emojis[rating - 1] || "😐";
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <span className="text-sm font-semibold text-primary">
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="user"
                  label="User"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Message
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="rating"
                  label="Rating"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                OS & Version
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Model
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="createdAt"
                  label="Date"
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
            {feedback.map((item, index) => (
              <TableRow
                key={item.id}
                feedback={item}
                index={index}
                user={userCache[item.userId] || null}
                renderStars={renderStars}
                formatTimestamp={formatTimestamp}
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
