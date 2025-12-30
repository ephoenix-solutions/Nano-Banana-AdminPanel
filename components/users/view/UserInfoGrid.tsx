import { Icons } from '@/config/icons';
import { User } from '@/lib/types/user.types';
import { Timestamp } from 'firebase/firestore';

interface UserInfoGridProps {
  user: User;
  formatTimestamp: (timestamp: Timestamp) => string;
}

export default function UserInfoGrid({ user, formatTimestamp }: UserInfoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* User ID */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.users size={20} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary font-body mb-1">User ID</p>
            <p className="text-base font-semibold text-primary font-body break-all">
              {user.id}
            </p>
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.feedback size={20} className="text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary font-body mb-1">Email Address</p>
            <p className="text-base font-semibold text-primary font-body break-all">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Role */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            user.role === 'admin' ? 'bg-secondary/20' : 'bg-accent/20'
          }`}>
            <Icons.users size={20} className={user.role === 'admin' ? 'text-secondary' : 'text-accent'} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">User Role</p>
            <p className="text-base font-semibold text-primary font-body capitalize">
              {user.role || 'user'}
            </p>
          </div>
        </div>
      </div>

      {/* Provider */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.globe size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Authentication Provider</p>
            <p className="text-base font-semibold text-primary font-body capitalize">
              {user.provider}
            </p>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.globe size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Preferred Language</p>
            <p className="text-base font-semibold text-primary font-body uppercase">
              {user.language}
            </p>
          </div>
        </div>
      </div>

      {/* Created At */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.clock size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Account Created</p>
            <p className="text-base font-semibold text-primary font-body">
              {formatTimestamp(user.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Last Login */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.check size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Last Login</p>
            <p className="text-base font-semibold text-primary font-body">
              {formatTimestamp(user.lastLogin)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
