import { useState, useEffect } from 'react';
import { Icons } from '@/config/icons';
import { getUserById } from '@/lib/services/user.service';

interface UserCellProps {
  userId: string;
  timestamp?: any;
  fetchUserName: (userId: string) => Promise<string>;
  formatTimestamp: (timestamp: any) => string | null;
}

export default function UserCell({ 
  userId, 
  timestamp,
  fetchUserName,
  formatTimestamp 
}: UserCellProps) {
  const [name, setName] = useState<string>('Loading...');
  const [photoURL, setPhotoURL] = useState<string>('');

  useEffect(() => {
    if (userId) {
      fetchUserName(userId).then(setName);
      // Fetch user photo
      getUserById(userId).then(user => {
        if (user?.photoURL) {
          setPhotoURL(user.photoURL);
        }
      }).catch(() => {
        setPhotoURL('');
      });
    } else {
      setName('Unknown');
    }
  }, [userId, fetchUserName]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {photoURL ? (
          <img
            src={photoURL}
            alt={name}
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
          style={{ display: photoURL ? 'none' : 'flex' }}
        >
          <Icons.users size={12} className="text-accent" />
        </div>
        <span className="text-sm">{name}</span>
      </div>
      {timestamp && (
        <span className="text-xs text-secondary">
          {formatTimestamp(timestamp)}
        </span>
      )}
    </div>
  );
}
