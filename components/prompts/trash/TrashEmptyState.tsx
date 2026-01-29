import { Icons } from '@/config/icons';

interface TrashEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function TrashEmptyState({
  hasActiveFilters,
  onClearFilters,
}: TrashEmptyStateProps) {
  if (hasActiveFilters) {
    return (
      <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
            <Icons.search size={32} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary font-heading mb-2">
              No Results Found
            </h3>
            <p className="text-secondary font-body mb-4">
              No deleted prompts match your current filters
            </p>
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
            >
              <Icons.close size={20} />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
          <Icons.trash size={32} className="text-secondary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-primary font-heading mb-2">
            Trash is Empty
          </h3>
          <p className="text-secondary font-body">
            Deleted prompts will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
