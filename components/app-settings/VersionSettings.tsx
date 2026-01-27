'use client';

import { Icons } from '@/config/icons';

interface VersionSettingsProps {
  minimumVersion: string;
  liveVersion: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function VersionSettings({
  minimumVersion,
  liveVersion,
  isEditing,
  onChange,
}: VersionSettingsProps) {
  return (
    <div className="bg-background rounded-lg p-6 border border-primary/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
          <Icons.code size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary font-heading">
            Version Information
          </h2>
          <p className="text-sm text-secondary font-body">
            Manage app version requirements
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="minimumVersion"
            className="block text-sm font-semibold text-primary mb-2 font-body"
          >
            Minimum Version <span className="text-secondary">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icons.arrowDown size={18} className="text-secondary" />
            </div>
            <input
              type="text"
              id="minimumVersion"
              name="minimumVersion"
              value={minimumVersion || ''}
              onChange={onChange}
              disabled={!isEditing}
              required
              className="w-full pl-10 pr-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-white transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="1.0.0"
            />
          </div>
          <p className="text-xs text-secondary mt-1 font-body">
            Minimum app version required to use the app
          </p>
        </div>

        <div>
          <label
            htmlFor="liveVersion"
            className="block text-sm font-semibold text-primary mb-2 font-body"
          >
            Live Version <span className="text-secondary">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icons.arrowUp size={18} className="text-accent" />
            </div>
            <input
              type="text"
              id="liveVersion"
              name="liveVersion"
              value={liveVersion || ''}
              onChange={onChange}
              disabled={!isEditing}
              required
              className="w-full pl-10 pr-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-white transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="1.0.0"
            />
          </div>
          <p className="text-xs text-secondary mt-1 font-body">
            Current live version of the app
          </p>
        </div>
      </div>
    </div>
  );
}
