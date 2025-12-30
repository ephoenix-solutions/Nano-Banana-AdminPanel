import { Icons } from '@/config/icons';
import { Category } from '@/lib/types/category.types';

interface CategoriesSelectionProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string) => void;
}

export default function CategoriesSelection({
  categories,
  selectedCategories,
  onCategoryToggle,
}: CategoriesSelectionProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-primary mb-3 font-body">
        Assign Categories <span className="text-secondary/50">(Optional)</span>
      </label>
      <div className="border border-primary/10 rounded-lg p-4 bg-background max-h-64 overflow-y-auto">
        {categories.length === 0 ? (
          <p className="text-sm text-secondary text-center py-4">
            No categories available
          </p>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories?.includes(category.id) || false}
                  onChange={() => onCategoryToggle(category.id)}
                  className="w-5 h-5 rounded border-primary/10 text-accent focus:ring-accent focus:ring-2"
                />
                <div className="flex items-center gap-2 flex-1">
                  {category.iconImage ? (
                    <img
                      src={category.iconImage}
                      alt={category.name}
                      className="w-6 h-6 rounded object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center">
                      <Icons.categories size={14} className="text-accent" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-primary">
                    {category.name}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-secondary mt-2">
        Selected: {selectedCategories?.length || 0} categories
      </p>
    </div>
  );
}
