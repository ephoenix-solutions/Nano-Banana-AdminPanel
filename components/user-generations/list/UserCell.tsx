import { User } from '@/lib/types/user.types';

interface UserCellProps {
  user: User | undefined;
  userId: string;
}

export default function UserCell({ user, userId }: UserCellProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-semibold text-sm">
          ?
        </div>
        <div>
          <p className="font-semibold text-primary">Unknown User</p>
          <p className="text-xs text-secondary">{userId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* User Photo with Fallback */}
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
            if (placeholder) placeholder.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-semibold text-sm"
        style={{ display: user.photoURL ? 'none' : 'flex' }}
      >
        {user.name.charAt(0).toUpperCase()}
      </div>
      
      {/* User Info */}
      <div>
        <p className="font-semibold text-primary">{user.name}</p>
        <p className="text-xs text-secondary">{user.email}</p>
      </div>
    </div>
  );
}
