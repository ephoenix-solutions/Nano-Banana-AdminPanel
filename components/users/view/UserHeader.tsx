import { Icons } from '@/config/icons';
import { User } from '@/lib/types/user.types';

interface UserHeaderProps {
  user: User;
  onEdit: () => void;
  hideActions?: boolean;
}

export default function UserHeader({ user, onEdit, hideActions = false }: UserHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
      <div className="flex items-center gap-6">
        {/* Profile Image */}
        <div className="relative">
          {user.photoURL ? (
            <div className="relative group">
              <img
                src={user.photoURL}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
              <div 
                className="w-32 h-32 rounded-full bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center"
                style={{ display: 'none' }}
              >
                <span className="text-5xl font-bold text-accent">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Hover overlay to view full image */}
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Icons.images size={32} className="text-white" />
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-5xl font-bold text-accent">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* User Basic Info */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-primary font-heading mb-2">
            {user.name}
          </h2>
          <p className="text-lg text-secondary font-body mb-3">
            {user.email}
          </p>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
              user.role === 'admin' 
                ? 'bg-secondary/20 text-secondary' 
                : 'bg-accent/20 text-primary'
            }`}>
              <Icons.users size={16} className="mr-2" />
              {user.role || 'user'}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
              user.provider.toLowerCase() === 'google' 
                ? 'bg-accent-100 text-accent-700'
                : user.provider.toLowerCase() === 'apple' || user.provider.toLowerCase() === 'ios'
                ? 'bg-primary-100 text-primary-700'
                : user.provider.toLowerCase() === 'manual'
                ? 'bg-secondary-100 text-secondary-700'
                : 'bg-accent/20 text-primary'
            }`}>
              <Icons.globe size={16} className="mr-2" />
              {user.provider}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-primary uppercase">
              <Icons.globe size={16} className="mr-2" />
              {user.language}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
