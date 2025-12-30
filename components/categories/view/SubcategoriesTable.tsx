import { Icons } from '@/config/icons';
import { Category } from '@/lib/types/category.types';
import SubcategoryCreatorCell from './SubcategoryCreatorCell';

interface SubcategoriesTableProps {
  category: Category;
  onAddSubcategory: () => void;
  onEditSubcategory: (subcategoryId: string) => void;
  formatTimestamp: (timestamp: any) => string;
}

export default function SubcategoriesTable({
  category,
  onAddSubcategory,
  onEditSubcategory,
  formatTimestamp,
}: SubcategoriesTableProps) {
  if (!category.subcategories || category.subcategories.length === 0) {
    return (
      <div className="mt-6 bg-white rounded-lg border border-primary/10 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.categories size={32} className="text-accent" />
          </div>
          <h3 className="text-lg font-bold text-primary font-heading mb-2">
            No Subcategories Yet
          </h3>
          <p className="text-secondary font-body mb-4">
            This category doesn't have any subcategories yet.
          </p>
          <button
            onClick={onAddSubcategory}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.plus size={20} />
            <span>Add First Subcategory</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="p-6 border-b border-primary/10 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-primary font-heading">
            Subcategories ({category.subcategories.length})
          </h3>
          <p className="text-sm text-secondary font-body mt-1">
            All subcategories under this category
          </p>
        </div>
        <button
          onClick={onAddSubcategory}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all text-sm"
        >
          <Icons.plus size={18} />
          <span>Add Subcategory</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Order
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Search Count
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Created By
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Updated By
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {category.subcategories.map((subcategory) => (
              <tr
                key={subcategory.id}
                className="hover:bg-background/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Icons.chevronRight size={16} className="text-secondary" />
                    <span className="font-medium text-primary font-body">
                      {subcategory.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-primary font-body">
                  {subcategory.order}
                </td>
                <td className="px-6 py-4 text-sm text-primary font-body">
                  {subcategory.searchCount}
                </td>
                <td className="px-6 py-4 text-sm text-primary font-body">
                  <SubcategoryCreatorCell 
                    userId={subcategory.createdBy} 
                    timestamp={subcategory.createdAt}
                    formatTimestamp={formatTimestamp}
                  />
                </td>
                <td className="px-6 py-4 text-sm text-primary font-body">
                  {subcategory.updatedBy ? (
                    <SubcategoryCreatorCell 
                      userId={subcategory.updatedBy} 
                      timestamp={subcategory.updatedAt}
                      formatTimestamp={formatTimestamp}
                    />
                  ) : (
                    <span className="text-secondary text-xs italic">Not updated</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onEditSubcategory(subcategory.id)}
                    className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer"
                    title="Edit"
                  >
                    <Icons.edit size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
