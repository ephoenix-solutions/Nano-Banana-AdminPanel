'use client';

import { Icons } from '@/config/icons';

interface LanguageSettingsProps {
  languages: string[];
  newLanguage: string;
  isEditing: boolean;
  onNewLanguageChange: (value: string) => void;
  onAddLanguage: () => void;
  onRemoveLanguage: (language: string) => void;
}

export default function LanguageSettings({
  languages,
  newLanguage,
  isEditing,
  onNewLanguageChange,
  onAddLanguage,
  onRemoveLanguage,
}: LanguageSettingsProps) {
  return (
    <div className="bg-background rounded-lg p-6 border border-primary/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
          <Icons.globe size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary font-heading">
            Supported Languages
          </h2>
          <p className="text-sm text-secondary font-body">
            Manage available languages for the app
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {isEditing && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icons.globe size={18} className="text-secondary" />
              </div>
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => onNewLanguageChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddLanguage();
                  }
                }}
                className="w-full pl-10 pr-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-white transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="Enter language (e.g., 'english', 'hindi', 'french')"
              />
            </div>
            <button
              type="button"
              onClick={onAddLanguage}
              className="px-4 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
            >
              <Icons.plus size={20} />
            </button>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <div
                key={language}
                className="flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-lg border border-accent/30"
              >
                <Icons.globe size={16} className="text-accent" />
                <span className="text-sm text-primary font-body font-medium uppercase">
                  {language}
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => onRemoveLanguage(language)}
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    <Icons.close size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
