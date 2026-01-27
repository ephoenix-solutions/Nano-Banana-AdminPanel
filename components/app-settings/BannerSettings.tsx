'use client';
'use client';

import { Icons } from '@/config/icons';

interface BannerSettingsProps {
  banner: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BannerSettings({
  banner,
  isEditing,
  onChange,
}: BannerSettingsProps) {
  return (
    <div className="bg-background rounded-lg p-6 border border-primary/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
          <Icons.images size={20} className="text-secondary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary font-heading">
            Banner Image
          </h2>
          <p className="text-sm text-secondary font-body">
            Configure the home screen banner image
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label
            htmlFor="banner"
            className="block text-sm font-semibold text-primary mb-2 font-body"
          >
            Banner Image URL
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icons.link size={18} className="text-secondary" />
              </div>
              <input
                type="url"
                id="banner"
                name="banner"
                value={banner || ''}
                onChange={onChange}
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-white transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            {banner && (
              <a
                href={banner}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-3 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-all border border-secondary/20"
                title="Open in new tab"
              >
                <Icons.link size={18} />
              </a>
            )}
          </div>
          <p className="text-xs text-secondary mt-1 font-body">
            Image for displaying on the application's home screen
          </p>
        </div>
        
        {banner && (
          <div>
            <div className="border border-primary/10 rounded-lg overflow-hidden bg-white">
              <img
                src={banner}
                alt="Banner preview"
                className="w-full h-92 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"%3E%3Crect fill="%23f0f0f0" width="1200" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3EInvalid Image URL%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
