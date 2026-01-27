'use client';

import { Icons } from '@/config/icons';

interface StatusMessagesProps {
  success: string | null;
  error: string | null;
}

export default function StatusMessages({ success, error }: StatusMessagesProps) {
  if (!success && !error) return null;

  return (
    <>
      {success && (
        <div className="bg-accent/10 border border-accent rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Icons.check size={20} className="text-accent" />
            <p className="text-accent font-body text-sm">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Icons.alert size={20} className="text-secondary" />
            <p className="text-secondary font-body text-sm">{error}</p>
          </div>
        </div>
      )}
    </>
  );
}
