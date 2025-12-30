import { Icons } from '@/config/icons';
import { User } from '@/lib/types/user.types';

interface UserInfoSectionProps {
  user: User | null;
}

export default function UserInfoSection({ user }: UserInfoSectionProps) {
  if (!user) return null;

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-primary font-heading mb-6">
        User Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Name */}
        <div className="bg-background rounded-lg p-4 border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icons.users size={20} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-secondary font-body mb-1">User Name</p>
              <p className="text-base font-semibold text-primary font-body">
                {user.name}
              </p>
            </div>
          </div>
        </div>

        {/* User Email */}
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
      </div>
    </div>
  );
}
