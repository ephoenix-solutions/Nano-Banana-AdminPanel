import { Icons } from '@/config/icons';
import { Category } from '@/lib/types/category.types';

interface CategoryHeaderProps {
  category: Category;
}

export default function CategoryHeader({ category }: CategoryHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
      <div className="flex items-center gap-6">
        {/* Category Icon */}
        <div className="relative">
          {category.iconImage ? (
            <div className="relative group">
              <img
                src={category.iconImage}
                alt={category.name}
                className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
              <div 
                className="w-32 h-32 rounded-lg bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center"
                style={{ display: 'none' }}
              >
                <Icons.categories size={48} className="text-accent" />
              </div>
              {/* Hover overlay to view full image */}
              <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Icons.images size={32} className="text-white" />
              </div>
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center">
              <Icons.categories size={48} className="text-accent" />
            </div>
          )}
        </div>

        {/* Category Basic Info */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-primary font-heading mb-2">
            {category.name}
          </h2>
          <div className="flex items-center gap-3 mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-primary">
              <Icons.file size={16} className="mr-2" />
              Order: {category.order}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-primary">
              <Icons.search size={16} className="mr-2" />
              {category.searchCount} searches
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-primary">
              <Icons.categories size={16} className="mr-2" />
              {category.subcategories?.length || 0} subcategories
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
