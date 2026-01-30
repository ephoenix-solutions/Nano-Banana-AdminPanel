import { Icons } from '@/config/icons';
import { User } from '@/lib/types/user.types';
import { Timestamp } from 'firebase/firestore';
import UserCell from '@/components/users/list/UserCell';

interface TrashTableRowProps {
  user: User;
  index: number;
  userCache: Record<string, User>;
  formatTimestamp: (timestamp: Timestamp) => string;
  getDeletedById: (user: User) => string | null;
  onView: (user: User) => void;
  onRestore: (user: User) => void;
  onPermanentDelete: (user: User) => void;
}

export default function TrashTableRow({
  user,
  index,
  userCache,
  formatTimestamp,
  getDeletedById,
  onView,
  onRestore,
  onPermanentDelete,
}: TrashTableRowProps) {
  const deletedById = getDeletedById(user);
  const deletedByUser = deletedById ? userCache[deletedById] : null;

  return (
    <tr
      className={`transition-colors ${
        index % 2 === 0
          ? 'bg-white hover:bg-background/50'
          : 'bg-background hover:bg-background-200'
      }`}
    >
      {/* Name Column - EXACT SAME */}
      <td className="px-6 py-4 text-sm text-primary font-body">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-primary">{user.name}</p>
            <p className="text-xs text-secondary">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Provider Column - EXACT SAME */}
      <td className="px-6 py-4 text-sm text-primary font-body">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
            user.provider.toLowerCase() === 'google'
              ? 'bg-accent-100 text-accent-700'
              : user.provider.toLowerCase() === 'apple' || user.provider.toLowerCase() === 'ios'
              ? 'bg-primary-100 text-primary-700'
              : user.provider.toLowerCase() === 'manual'
              ? 'bg-secondary-100 text-secondary-700'
              : 'bg-accent/20 text-primary'
          }`}
        >
          {user.provider}
        </span>
      </td>

      {/* Role Column - EXACT SAME */}
      <td className="px-6 py-4 text-sm text-primary font-body">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${
            user.role === 'admin'
              ? 'bg-secondary/20 text-secondary'
              : 'bg-accent/20 text-primary'
          }`}
        >
          {user.role || 'user'}
        </span>
      </td>

      {/* Language Column - EXACT SAME */}
      <td className="px-6 py-4 text-sm text-primary font-body">
        <span className="uppercase text-sm font-medium">{user.language}</span>
      </td>

      {/* Created At Column - EXACT SAME */}
      <td className="px-6 py-4 text-sm text-primary font-body">
        <span className="text-sm">{formatTimestamp(user.createdAt)}</span>
      </td>

      {/* Created By Column - EXACT SAME */}
      <td className="px-6 py-4 text-sm text-primary font-body">
        {user.createdBy ? (
          <UserCell
            user={userCache[user.createdBy] || null}
            timestamp={null}
            formatTimestamp={formatTimestamp}
          />
        ) : (
          <span className="text-secondary text-xs">By Login</span>
        )}
      </td>

      {/* Last Login Column - EXACT SAME */}
      <td className="px-6 py-4 text-sm text-primary font-body">
        <span className="text-sm">{formatTimestamp(user.lastLogin)}</span>
      </td>

      {/* Deleted By Column - NEW */}
      <td className="px-6 py-4 text-sm text-primary font-body">
        {deletedByUser ? (
          <UserCell
            user={deletedByUser}
            timestamp={user.deletedAt!}
            formatTimestamp={formatTimestamp}
          />
        ) : (
          <span className="text-secondary text-xs">Unknown</span>
        )}
      </td>

      {/* Actions Column - VIEW + RESTORE + PERMANENT DELETE */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onView(user)}
            className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
            title="View"
          >
            <Icons.eye size={18} />
          </button>
          <button
            onClick={() => onRestore(user)}
            className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
            title="Restore User"
          >
            <Icons.rotateCcw size={18} />
          </button>
          <button
            onClick={() => onPermanentDelete(user)}
            className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
            title="Permanently Delete"
          >
            <Icons.trash size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
