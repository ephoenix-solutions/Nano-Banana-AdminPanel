import React from 'react';
import { Icons } from '@/config/icons';
import { Category } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import UserCell from '@/components/categories/list/UserCell';
import TrashSubcategoryRow from './TrashSubcategoryRow';

interface TrashCategoryRowProps {
  category: Category;
  index: number;
  isExpanded: boolean;
  userCache: Record<string, User>;
  formatTimestamp: (timestamp: any) => string | null;
  onToggle: (categoryId: string) => void;
  onView: (category: Category) => void;
  onRestore: (category: Category) => void;
  onPermanentDelete: (category: Category) => void;
}

export default function TrashCategoryRow({
  category,
  index,
  isExpanded,
  userCache,
  formatTimestamp,
  onToggle,
  onView,
  onRestore,
  onPermanentDelete,
}: TrashCategoryRowProps) {
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  const deletedByUser = category.deletedBy ? userCache[category.deletedBy] : null;

  return (
    <React.Fragment>
      {/* Category Row */}
      <tr
        className={`transition-colors ${
          index % 2 === 0
            ? 'bg-white hover:bg-background/50'
            : 'bg-background hover:bg-background-200'
        }`}
      >
        {/* Expand Toggle - EXACT SAME */}
        <td className="px-6 py-4">
          {hasSubcategories && (
            <button
              onClick={() => onToggle(category.id)}
              className="p-1 hover:bg-accent/20 rounded transition-colors"
            >
              <Icons.chevronRight
                size={18}
                className={`transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
          )}
        </td>

        {/* Name - EXACT SAME */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            {category.iconImage ? (
              <img
                src={category.iconImage}
                alt={category.name}
                className="w-10 h-10 rounded-lg object-cover border border-primary/10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center"
              style={{ display: category.iconImage ? 'none' : 'flex' }}
            >
              <Icons.categories size={20} className="text-accent" />
            </div>
            <span className="font-semibold text-primary">
              {category.name}
            </span>
          </div>
        </td>

        {/* Order - EXACT SAME */}
        <td className="px-6 py-4 text-sm text-primary">
          {category.order}
        </td>

        {/* Search Count - EXACT SAME */}
        <td className="px-6 py-4 text-sm text-primary">
          {category.searchCount}
        </td>

        {/* Subcategories - EXACT SAME */}
        <td className="px-6 py-4 text-sm text-primary">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/20 text-primary">
            {category.subcategories?.length || 0}
          </span>
        </td>

        {/* Created By - EXACT SAME */}
        <td className="px-6 py-4 text-sm text-primary">
          <UserCell
            user={userCache[category.createdBy] || null}
            timestamp={category.createdAt}
            formatTimestamp={formatTimestamp}
          />
        </td>

        {/* Updated By - EXACT SAME */}
        <td className="px-6 py-4 text-sm text-primary">
          {category.updatedBy ? (
            <UserCell
              user={userCache[category.updatedBy] || null}
              timestamp={category.updatedAt}
              formatTimestamp={formatTimestamp}
            />
          ) : (
            <span className="text-secondary text-xs">Not updated</span>
          )}
        </td>

        {/* Deleted By - NEW COLUMN */}
        <td className="px-6 py-4 text-sm text-primary">
          {deletedByUser ? (
            <UserCell
              user={deletedByUser}
              timestamp={category.deletedAt}
              formatTimestamp={formatTimestamp}
            />
          ) : (
            <span className="text-secondary text-xs">Unknown</span>
          )}
        </td>

        {/* Actions - VIEW + RESTORE + PERMANENT DELETE */}
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onView(category)}
              className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
              title="View"
            >
              <Icons.eye size={18} />
            </button>
            <button
              onClick={() => onRestore(category)}
              className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
              title="Restore Category"
            >
              <Icons.rotateCcw size={18} />
            </button>
            <button
              onClick={() => onPermanentDelete(category)}
              className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
              title="Permanently Delete"
            >
              <Icons.trash size={18} />
            </button>
          </div>
        </td>
      </tr>

      {/* Subcategories Rows */}
      {isExpanded &&
        hasSubcategories &&
        category.subcategories!.map((subcategory) => (
          <TrashSubcategoryRow
            key={`${category.id}-${subcategory.id}`}
            categoryId={category.id}
            subcategory={subcategory}
            userCache={userCache}
            formatTimestamp={formatTimestamp}
          />
        ))}
    </React.Fragment>
  );
}
