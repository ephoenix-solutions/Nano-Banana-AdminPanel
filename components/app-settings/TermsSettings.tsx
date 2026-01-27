'use client';

import { Icons } from '@/config/icons';

interface TermsSettingsProps {
  terms: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TermsSettings({
  terms,
  isEditing,
  onChange,
}: TermsSettingsProps) {
  return (
    <div className="bg-background rounded-lg p-6 border border-primary/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
          <Icons.fileText size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary font-heading">
            Terms & Conditions
          </h2>
          <p className="text-sm text-secondary font-body">
            Link to your terms and conditions document
          </p>
        </div>
      </div>
      
      <div>
        <label
          htmlFor="terms"
          className="block text-sm font-semibold text-primary mb-2 font-body"
        >
          Terms & Conditions URL
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icons.link size={18} className="text-accent" />
            </div>
            <input
              type="url"
              id="terms"
              name="terms"
              value={terms || ''}
              onChange={onChange}
              disabled={!isEditing}
              className="w-full pl-10 pr-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-white transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="https://example.com/terms-and-conditions"
            />
          </div>
          {terms && (
            <a
              href={terms}
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
          URL to your terms and conditions page
        </p>
      </div>
    </div>
  );
}
