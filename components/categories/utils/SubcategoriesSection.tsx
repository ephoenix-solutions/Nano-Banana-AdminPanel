import { Icons } from '@/config/icons';
import FormInput from './FormInput';

interface SubcategoryFormData {
  name: string;
  order: number;
}

interface SubcategoriesSectionProps {
  subcategories: SubcategoryFormData[];
  onSubcategoryChange: (index: number, field: string, value: string) => void;
  onAddSubcategory: () => void;
  onRemoveSubcategory: (index: number) => void;
}

export default function SubcategoriesSection({
  subcategories,
  onSubcategoryChange,
  onAddSubcategory,
  onRemoveSubcategory,
}: SubcategoriesSectionProps) {
  return (
    <div className="border-t border-primary/10 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-primary font-heading">
            Subcategories
          </h3>
          <p className="text-sm text-secondary font-body mt-1">
            At least one subcategory is required
          </p>
        </div>
        <button
          type="button"
          onClick={onAddSubcategory}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-primary font-semibold rounded-lg transition-colors"
        >
          <Icons.plus size={18} />
          <span>Add Subcategory</span>
        </button>
      </div>

      <div className="space-y-4">
        <div
          className=""
        >
          {subcategories.map((subcategory, index) => (
            <div className="flex items-start gap-4 py-3" key={index}>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id={`subcategory-name-${index}`}
                  name={`subcategory-name-${index}`}
                  label="Subcategory Name"
                  value={subcategory.name}
                  onChange={(e) =>
                    onSubcategoryChange(index, 'name', e.target.value)
                  }
                  required
                  placeholder="Enter subcategory name"
                />

                <FormInput
                  id={`subcategory-order-${index}`}
                  name={`subcategory-order-${index}`}
                  label="Order"
                  value={subcategory.order.toString()}
                  onChange={(e) =>
                    onSubcategoryChange(index, 'order', e.target.value)
                  }
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                />
              </div>

              {subcategories.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveSubcategory(index)}
                  className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove subcategory"
                >
                  <Icons.trash size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {subcategories.length === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800 font-body">
            <strong>Note:</strong> At least one subcategory is required. Click "Add Subcategory" to add one.
          </p>
        </div>
      )}
    </div>
  );
}
