import { Icons } from '@/config/icons';
import { Subcategory } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import UserCell from './UserCell';

interface SubcategoryRowProps {
  categoryId: string;
  subcategory: Subcategory;
  userCache: Record<string, User>;
  formatTimestamp: (timestamp: any) => string | null;
  onEdit: (categoryId: string, subcategoryId: string) => void;
  onDelete: (categoryId: string, subcategory: Subcategory) => void;
}

export default function SubcategoryRow({
  categoryId,
  subcategory,
  userCache,
  formatTimestamp,
  onEdit,
  onDelete,
}: SubcategoryRowProps) {
  return (
    <tr className="bg-accent/10 hover:bg-accent/20 transition-colors border-l-4 border-accent">
      <td className="px-6 py-3 pl-10"></td>
      <td className="px-6 py-3 pl-10">
        <div className="flex items-center gap-2">
          <Icons.cornerDownRight size={18} className="text-secondary" />
          <span className="text-sm text-primary">
            {subcategory.name}
          </span>
        </div>
      </td>
      <td className="px-6 py-3 pl-10 text-sm text-primary">
        {subcategory.order}
      </td>
      <td className="px-6 py-3 pl-10 text-sm text-primary">
        {subcategory.searchCount}
      </td>
      <td className="px-6 py-3 pl-10 text-sm text-secondary">
        -
      </td>
      <td className="px-6 py-3 pl-10 text-sm text-primary">
        <UserCell
          user={userCache[subcategory.createdBy] || null}
          timestamp={subcategory.createdAt}
          formatTimestamp={formatTimestamp}
        />
      </td>
      <td className="px-6 py-3 pl-10 text-sm text-primary">
        {subcategory.updatedBy ? (
          <UserCell
            user={userCache[subcategory.updatedBy] || null}
            timestamp={subcategory.updatedAt}
            formatTimestamp={formatTimestamp}
          />
        ) : (
          <span className="text-secondary text-xs">Not updated</span>
        )}
      </td>
      <td className="px-6 py-3 pr-10 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(categoryId, subcategory.id)}
            className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer"
            title="Edit"
          >
            <Icons.edit size={18} />
          </button>
          <button
            onClick={() => onDelete(categoryId, subcategory)}
            className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
            title="Delete"
          >
            <Icons.trash size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
