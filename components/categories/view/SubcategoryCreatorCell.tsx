import { useState, useEffect } from 'react';
import { Icons } from '@/config/icons';
import { getUserById } from '@/lib/services/user.service';

interface SubcategoryCreatorCellProps {
  userId: string;
  timestamp?: any;
  formatTimestamp: (timestamp: any) => string;
}

export default function SubcategoryCreatorCell({ 
  userId, 
  timestamp,
  formatTimestamp 
}: SubcategoryCreatorCellProps) {
  const [name, setName] = useState<string>('Loading...');
  const [photoURL, setPhotoURL] = useState<string>('');

  useEffect(() => {
    if (userId) {
      getUserById(userId).then(user => {
        if (user) {
          setName(user.name || 'Unknown Admin');
          setPhotoURL(user.photoURL || '');
        } else {
          setName('Unknown Admin');
        }
      }).catch(() => {
        setName('Unknown Admin');
      });
    } else {
      setName('Unknown');
    }
  }, [userId]);

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
        <span className="text-xs text-secondary ml-8">
          {formatTimestamp(timestamp)}
        </span>
      )}
    </div>
  );
}
