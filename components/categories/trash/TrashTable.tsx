import React from 'react';
import { Category } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import { SortField, SortOrder } from '@/lib/hooks/useCategoriesTrash';
import SortableHeader from './SortableHeader';
import TrashCategoryRow from './TrashCategoryRow';

interface TrashTableProps {
  categories: Category[];
  userCache: Record<string, User>;
  expandedCategories: Set<string>;
  sortField: SortField;
  sortOrder: SortOrder;
  formatTimestamp: (timestamp: any) => string | null;
  onSort: (field: SortField) => void;
  onToggle: (categoryId: string) => void;
  onView: (category: Category) => void;
  onRestore: (category: Category) => void;
  onPermanentDelete: (category: Category) => void;
}

export default function TrashTable({
  categories,
  userCache,
  expandedCategories,
  sortField,
  sortOrder,
  formatTimestamp,
  onSort,
  onToggle,
  onView,
  onRestore,
  onPermanentDelete,
}: TrashTableProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="overflow-x-visible">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              {/* Expand Toggle */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body w-12"></th>
              {/* Name */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="name"
                  label="Name"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Order */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="order"
                  label="Order"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Search Count */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="searchCount"
                  label="Search Count"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Subcategories */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="subcategories"
                  label="Subcategories"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Created By */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Created By
              </th>
              {/* Updated By */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Updated By
              </th>
              {/* Deleted By - EXTRA COLUMN */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="deletedAt"
                  label="Deleted By"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Actions */}
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <TrashCategoryRow
                key={category.id}
                category={category}
                index={index}
                isExpanded={expandedCategories.has(category.id)}
                userCache={userCache}
                formatTimestamp={formatTimestamp}
                onToggle={onToggle}
                onView={onView}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
