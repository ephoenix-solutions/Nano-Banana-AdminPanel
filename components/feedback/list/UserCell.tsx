import { User } from '@/lib/types/user.types';

interface UserCellProps {
  user: User | null;
  userId: string;
}

export default function UserCell({ user, userId }: UserCellProps) {
  if (user) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-primary">
          {user.name}
        </span>
        <span className="text-xs text-secondary">
          {user.email}
        </span>
      </div>
    );
  }

  return (
    <span className="text-sm text-secondary font-mono">
      {userId.substring(0, 8)}
    </span>
  );
}
