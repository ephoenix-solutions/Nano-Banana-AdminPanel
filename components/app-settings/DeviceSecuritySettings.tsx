'use client';

import { Icons } from '@/config/icons';

interface DeviceSecuritySettingsProps {
  maxAccountsPerDevice: number;
  originalMaxAccounts: number;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DeviceSecuritySettings({
  maxAccountsPerDevice,
  originalMaxAccounts,
  isEditing,
  onChange,
}: DeviceSecuritySettingsProps) {
  return (
    <div className="bg-background rounded-lg p-6 border border-primary/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
          <Icons.shield size={20} className="text-secondary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary font-heading">
            Device & Security Settings
          </h2>
          <p className="text-sm text-secondary font-body">
            Configure device access limits
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label
            htmlFor="maxAccountsPerDevice"
            className="block text-sm font-semibold text-primary mb-2 font-body"
          >
            Max Accounts Per Device
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icons.users size={18} className="text-secondary" />
            </div>
            <input
              type="number"
              id="maxAccountsPerDevice"
              name="maxAccountsPerDevice"
              min="1"
              value={maxAccountsPerDevice || 3}
              onChange={onChange}
              disabled={!isEditing}
              className="w-full md:w-64 pl-10 pr-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-white transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-secondary mt-2 font-body">
            Maximum number of different accounts allowed per device
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-accent/20">
          <div className="flex items-start gap-3">
            <Icons.info size={18} className="text-accent flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-primary font-body">
                How it works
              </h3>
              <ul className="text-xs text-secondary font-body space-y-1">
                <li>• Limit applies to new login attempts only</li>
                <li>• Existing accounts can always re-login</li>
                <li>• Devices with more accounts are grandfathered</li>
                <li>• Changes take effect immediately</li>
              </ul>
            </div>
          </div>
        </div>

        {isEditing && maxAccountsPerDevice && maxAccountsPerDevice < originalMaxAccounts && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icons.alert size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 font-body">
                  Warning: Reducing Limit
                </p>
                <p className="text-xs text-yellow-700 mt-1 font-body">
                  Reducing the limit will NOT remove existing accounts from devices.
                  It only affects new login attempts. Devices with more than {maxAccountsPerDevice} accounts
                  will be grandfathered.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
