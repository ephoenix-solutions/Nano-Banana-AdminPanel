import { Icons } from '@/config/icons';
import { Subcategory } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import UserCell from '@/components/categories/list/UserCell';

interface TrashSubcategoryRowProps {
  categoryId: string;
  subcategory: Subcategory;
  userCache: Record<string, User>;
  formatTimestamp: (timestamp: any) => string | null;
}

export default function TrashSubcategoryRow({
  categoryId,
  subcategory,
  userCache,
  formatTimestamp,
}: TrashSubcategoryRowProps) {
  const deletedByUser = subcategory.deletedBy ? userCache[subcategory.deletedBy] : null;

  return (
    <tr className="bg-accent/10 hover:bg-accent/20 transition-colors border-l-4 border-accent">
      {/* Empty Toggle Column */}
      <td className="px-6 py-3 pl-10"></td>

      {/* Name - EXACT SAME */}
      <td className="px-6 py-3 pl-10">
        <div className="flex items-center gap-2">
          <Icons.cornerDownRight size={18} className="text-secondary" />
          <span className="text-sm text-primary">
            {subcategory.name}
          </span>
        </div>
      </td>

      {/* Order - EXACT SAME */}
      <td className="px-6 py-3 pl-10 text-sm text-primary">
        {subcategory.order}
      </td>

      {/* Search Count - EXACT SAME */}
      <td className="px-6 py-3 pl-10 text-sm text-primary">
        {subcategory.searchCount}
      </td>

      {/* Subcategories Count - EXACT SAME */}
      <td className="px-6 py-3 pl-10 text-sm text-secondary">
        -
      </td>

      {/* Created By - EXACT SAME */}
      <td className="px-6 py-3 pl-10 text-sm text-primary">
        <UserCell
          user={userCache[subcategory.createdBy] || null}
          timestamp={subcategory.createdAt}
          formatTimestamp={formatTimestamp}
        />
      </td>

      {/* Updated By - EXACT SAME */}
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

      {/* Deleted By - NEW COLUMN */}
      <td className="px-6 py-3 pl-10 text-sm text-primary">
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

      {/* Actions - No actions for subcategories in trash (restored with parent) */}
      <td className="px-6 py-3 pr-10 text-right">
        <span className="text-xs text-secondary italic">Restored with category</span>
      </td>
    </tr>
  );
}
