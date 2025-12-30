import { Icons } from '@/config/icons';
import { User } from '@/lib/types/user.types';
import { Timestamp } from 'firebase/firestore';

interface TableRowProps {
  user: User;
  index: number;
  formatTimestamp: (timestamp: Timestamp) => string;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function TableRow({
  user,
  index,
  formatTimestamp,
  onView,
  onEdit,
  onDelete,
}: TableRowProps) {
  const editDisabled = user.role === 'admin';
  const deleteDisabled = user.role === 'admin';

  return (
    <tr
      className={`transition-colors ${
        index % 2 === 0
          ? 'bg-white hover:bg-background/50'
          : 'bg-background hover:bg-background-200'
      }`}
    >
      {/* Name Column */}
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

      {/* Provider Column */}
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

      {/* Role Column */}
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

      {/* Language Column */}
      <td className="px-6 py-4 text-sm text-primary font-body">
        <span className="uppercase text-sm font-medium">{user.language}</span>
      </td>

      {/* Created At Column */}
      <td className="px-6 py-4 text-sm text-primary font-body">
        <span className="text-sm">{formatTimestamp(user.createdAt)}</span>
      </td>

      {/* Last Login Column */}
      <td className="px-6 py-4 text-sm text-primary font-body">
        <span className="text-sm">{formatTimestamp(user.lastLogin)}</span>
      </td>

      {/* Actions Column */}
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
            onClick={() => !editDisabled && onEdit(user)}
            disabled={editDisabled}
            className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background"
            title={editDisabled ? 'Cannot edit admin users' : 'Edit'}
          >
            <Icons.edit size={18} />
          </button>
          <button
            onClick={() => !deleteDisabled && onDelete(user)}
            disabled={deleteDisabled}
            className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-secondary"
            title={deleteDisabled ? 'Cannot delete admin users' : 'Delete'}
          >
            <Icons.trash size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
