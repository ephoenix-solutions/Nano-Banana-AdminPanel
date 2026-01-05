import { Icons } from '@/config/icons';
import { User } from '@/lib/types/user.types';

interface UserCellProps {
  user: User | null;
  timestamp?: any;
  formatTimestamp: (timestamp: any) => string | null;
}

export default function UserCell({ user, timestamp, formatTimestamp }: UserCellProps) {
  const userName = user?.name || 'Unknown';
  const userPhoto = user?.photoURL || '';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {userPhoto ? (
          <img
            src={userPhoto}
            alt={userName}
            className="w-6 h-6 rounded-full object-cover border border-accent/20"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center"
          style={{ display: userPhoto ? 'none' : 'flex' }}
        >
          <Icons.users size={12} className="text-accent" />
        </div>
        <span className="text-sm">{userName}</span>
      </div>
      {timestamp && (
        <span className="text-xs text-secondary">
          {formatTimestamp(timestamp)}
        </span>
      )}
    </div>
  );
}
