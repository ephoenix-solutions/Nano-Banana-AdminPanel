'use client';

import { Icons } from '@/config/icons';

interface PrivacyPolicySettingsProps {
  privacyPolicy: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PrivacyPolicySettings({
  privacyPolicy,
  isEditing,
  onChange,
}: PrivacyPolicySettingsProps) {
  return (
    <div className="bg-background rounded-lg p-6 border border-primary/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
          <Icons.shield size={20} className="text-secondary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary font-heading">
            Privacy Policy
          </h2>
          <p className="text-sm text-secondary font-body">
            Link to your privacy policy document
          </p>
        </div>
      </div>
      
      <div>
        <label
          htmlFor="privacyPolicy"
          className="block text-sm font-semibold text-primary mb-2 font-body"
        >
          Privacy Policy URL
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icons.link size={18} className="text-secondary" />
            </div>
            <input
              type="url"
              id="privacyPolicy"
              name="privacyPolicy"
              value={privacyPolicy || ''}
              onChange={onChange}
              disabled={!isEditing}
              className="w-full pl-10 pr-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-white transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="https://example.com/privacy-policy"
            />
          </div>
          {privacyPolicy && (
            <a
              href={privacyPolicy}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-3 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-all border border-accent/20"
              title="Open in new tab"
            >
              <Icons.link size={18} />
            </a>
          )}
        </div>
        <p className="text-xs text-secondary mt-1 font-body">
          URL to your privacy policy page
        </p>
      </div>
    </div>
  );
}
