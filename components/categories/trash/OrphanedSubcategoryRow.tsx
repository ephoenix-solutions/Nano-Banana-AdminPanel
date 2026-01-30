import { Icons } from '@/config/icons';
import { Subcategory } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import UserCell from '@/components/categories/list/UserCell';

interface OrphanedSubcategoryRowProps {
  categoryId: string;
  categoryName: string;
  subcategory: Subcategory;
  index: number;
  userCache: Record<string, User>;
  formatTimestamp: (timestamp: any) => string | null;
  onRestore: (categoryId: string, categoryName: string, subcategory: Subcategory) => void;
  onPermanentDelete: (categoryId: string, categoryName: string, subcategory: Subcategory) => void;
}

export default function OrphanedSubcategoryRow({
  categoryId,
  categoryName,
  subcategory,
  index,
  userCache,
  formatTimestamp,
  onRestore,
  onPermanentDelete,
}: OrphanedSubcategoryRowProps) {
  const deletedByUser = subcategory.deletedBy ? userCache[subcategory.deletedBy] : null;

  return (
    <tr
      className={`transition-colors ${
        index % 2 === 0
          ? 'bg-white hover:bg-background/50'
          : 'bg-background hover:bg-background-200'
      }`}
    >
      {/* Empty Toggle Column */}
      <td className="px-6 py-4"></td>

      {/* Name with Parent Category */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icons.cornerDownRight size={18} className="text-secondary" />
            <span className="font-semibold text-primary">{subcategory.name}</span>
          </div>
          <span className="text-xs text-secondary pl-6">
            Parent: {categoryName}
          </span>
        </div>
      </td>

      {/* Order */}
      <td className="px-6 py-4 text-sm text-primary">
        {subcategory.order}
      </td>

      {/* Search Count */}
      <td className="px-6 py-4 text-sm text-primary">
        {subcategory.searchCount}
      </td>

      {/* Created By */}
      <td className="px-6 py-4 text-sm text-primary">
        <UserCell
          user={userCache[subcategory.createdBy] || null}
          timestamp={subcategory.createdAt}
          formatTimestamp={formatTimestamp}
        />
      </td>

      {/* Updated By */}
      <td className="px-6 py-4 text-sm text-primary">
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

      {/* Deleted By */}
      <td className="px-6 py-4 text-sm text-primary">
        {deletedByUser ? (
          <UserCell
            user={deletedByUser}
            timestamp={subcategory.deletedAt}
            formatTimestamp={formatTimestamp}
          />
        ) : (
          <span className="text-secondary text-xs">Unknown</span>
        )}
      </td>

      {/* Actions - Individual Restore/Delete */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onRestore(categoryId, categoryName, subcategory)}
            className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
            title="Restore Subcategory"
          >
            <Icons.rotateCcw size={18} />
          </button>
          <button
            onClick={() => onPermanentDelete(categoryId, categoryName, subcategory)}
            className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
            title="Permanently Delete"
          >
            <Icons.trash size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
