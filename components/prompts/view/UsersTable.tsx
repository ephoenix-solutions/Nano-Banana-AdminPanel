import { Icons } from '@/config/icons';
import { User } from '@/lib/types/user.types';
import { Timestamp } from 'firebase/firestore';
import { formatTimestamp } from '@/lib/utils/format.utils';

interface UsersTableProps {
  users: Array<{ user: User; timestamp: Timestamp }>;
  loading: boolean;
  title: string;
  icon: 'check' | 'bookmark' | 'heart';
  emptyMessage: string;
  timestampLabel: string;
  onViewUser: (userId: string) => void;
  fullWidth?: boolean;
}

export default function UsersTable({
  users,
  loading,
  title,
  icon,
  emptyMessage,
  timestampLabel,
  onViewUser,
  fullWidth = false,
}: UsersTableProps) {
  const IconComponent = icon === 'check' ? Icons.check : icon === 'heart' ? Icons.heart : Icons.bookmark;

  return (
    <div className={`bg-white rounded-lg border border-primary/10 overflow-hidden ${fullWidth ? '' : ''}`}>
      <div className="p-6 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-primary font-heading flex items-center gap-2">
              <IconComponent size={24} className="text-accent" />
              {title}
            </h3>
            <p className="text-sm text-secondary mt-1">
              {users.length} {users.length === 1 ? 'user' : 'users'}
            </p>
          </div>
        </div>
      </div>

      <div className="">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    {timestampLabel}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((item, index) => (
                  <tr
                    key={item.user.id}
                    className={`transition-colors ${
                      index % 2 === 0
                        ? 'bg-white hover:bg-background/50'
                        : 'bg-background hover:bg-background-200'
                    }`}
                  >
                    {/* Name Column */}
                    <td className="px-6 py-4 text-sm text-primary font-body">
                      <div className="flex items-center gap-3">
                        {item.user.photoURL ? (
                          <img
                            src={item.user.photoURL}
                            alt={item.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-semibold text-sm">
                            {item.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-primary">{item.user.name}</p>
                            {item.user.isDeleted && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/20 text-secondary">
                                <Icons.trash size={12} className="mr-1" />
                                Deleted
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-secondary">{item.user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Timestamp Column */}
                    <td className="px-6 py-4 text-sm text-primary font-body">
                      <span className="text-sm">{formatTimestamp(item.timestamp)}</span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewUser(item.user.id)}
                          className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                          title="View"
                        >
                          <Icons.eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <IconComponent size={48} className="text-secondary/30 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-primary mb-2">No Users Yet</h4>
            <p className="text-secondary text-sm">
              {emptyMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
