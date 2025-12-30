import { Icons } from '@/config/icons';
import { Feedback } from '@/lib/types/feedback.types';
import { User } from '@/lib/types/user.types';
import UserCell from './UserCell';

interface TableRowProps {
  feedback: Feedback;
  index: number;
  user: User | null;
  renderStars: (rating: number) => React.ReactNode;
  formatTimestamp: (timestamp: any) => string | null;
  onView: (feedback: Feedback) => void;
  onDelete: (feedback: Feedback) => void;
}

export default function TableRow({
  feedback,
  index,
  user,
  renderStars,
  formatTimestamp,
  onView,
  onDelete,
}: TableRowProps) {
  return (
    <tr
      className={`transition-colors ${
        index % 2 === 0
          ? 'bg-white hover:bg-background/50'
          : 'bg-background hover:bg-background-200'
      }`}
    >
      {/* User */}
      <td className="px-6 py-4">
        <UserCell user={user} userId={feedback.userId} />
      </td>

      {/* Message */}
      <td className="px-6 py-4">
        <div className="max-w-md">
          <p className="text-sm text-primary line-clamp-2">
            {feedback.message}
          </p>
        </div>
      </td>

      {/* Rating */}
      <td className="px-6 py-4">{renderStars(feedback.rating)}</td>

      {/* OS & Version */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {feedback.deviceInfo?.os ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
              {feedback.deviceInfo.os}
            </span>
          ) : null}
          {feedback.deviceInfo?.appVersion ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
              {feedback.deviceInfo.appVersion}
            </span>
          ) : null}
          {!feedback.deviceInfo?.os && !feedback.deviceInfo?.appVersion && (
            <span className="text-sm text-secondary">None</span>
          )}
        </div>
      </td>

      {/* Model */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {feedback.deviceInfo?.model ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
              {feedback.deviceInfo.model}
            </span>
          ) : (
            <span className="text-sm text-secondary">None</span>
          )}
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4 text-sm text-primary">
        {formatTimestamp(feedback.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onView(feedback)}
            className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
            title="View"
          >
            <Icons.eye size={18} />
          </button>
          <button
            onClick={() => onDelete(feedback)}
            className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
            title="Delete"
          >
            <Icons.trash size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
