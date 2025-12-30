import { Icons } from '@/config/icons';
import { Prompt } from '@/lib/types/prompt.types';

interface PromptHeaderProps {
  prompt: Prompt;
}

export default function PromptHeader({ prompt }: PromptHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
      <div className="flex items-start gap-6">
        {/* Prompt Image */}
        <div className="relative flex-shrink-0">
          {prompt.url ? (
            <div className="relative group">
              <img
                src={prompt.url}
                alt="Prompt preview"
                className="w-64 h-64 rounded-lg object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
              <div 
                className="w-64 h-64 rounded-lg bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center"
                style={{ display: 'none' }}
              >
                <Icons.images size={64} className="text-accent" />
              </div>
              {/* Hover overlay to view full image */}
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Icons.images size={48} className="text-white" />
              </div>
            </div>
          ) : (
            <div className="w-64 h-64 rounded-lg bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center">
              <Icons.images size={64} className="text-accent" />
            </div>
          )}
        </div>

        {/* Prompt Basic Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold text-primary font-heading mb-2">
            {prompt.title || 'Untitled Prompt'}
          </h2>
          <p className="text-base text-primary font-body mb-6 leading-relaxed">
            {prompt.prompt}
          </p>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {prompt.isTrending && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent text-primary">
                <Icons.chart size={16} className="mr-2" />
                Trending
              </span>
            )}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-primary">
              <Icons.check size={16} className="mr-2" />
              {prompt.likesCount || 0} likes
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-primary">
              <Icons.search size={16} className="mr-2" />
              {prompt.searchCount} searches
            </span>
          </div>
          {prompt.tags && prompt.tags.length > 0 && (
            <div>
              <p className="text-xs text-secondary font-body mb-2">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-accent/20 text-primary border border-accent/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
