import { Icons } from '@/config/icons';

interface AssignedCategoriesProps {
  categoryNames: string[];
  onEdit: () => void;
  hideActions?: boolean;
}

export default function AssignedCategories({ categoryNames, onEdit, hideActions = false }: AssignedCategoriesProps) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-primary font-heading mb-4">
        Assigned Categories ({categoryNames.length})
      </h3>
      {categoryNames.length > 0 ? (
        <div className="bg-background rounded-lg p-6 border border-primary/10">
          <div className="flex flex-wrap gap-3">
            {categoryNames.map((categoryName, index) => (
              <div
                key={index}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-accent/20 border border-accent/30"
              >
                <Icons.categories size={16} className="text-accent mr-2" />
                <span className="text-sm font-medium text-primary font-body">
                  {categoryName}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-background rounded-lg p-8 border border-primary/10 text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.categories size={32} className="text-accent" />
          </div>
          <h4 className="text-lg font-bold text-primary font-heading mb-2">
            No Categories Assigned
          </h4>
          <p className="text-secondary font-body mb-4">
            This country doesn't have any categories assigned yet.
          </p>
          {!hideActions && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
            >
              <Icons.edit size={20} />
              <span>Assign Categories</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
