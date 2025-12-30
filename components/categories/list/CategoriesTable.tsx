import React from 'react';
import { Category } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import { SortField, SortOrder } from '@/lib/hooks/useCategoriesList';
import SortableHeader from './SortableHeader';
import CategoryRow from './CategoryRow';

interface CategoriesTableProps {
  categories: Category[];
  userCache: Record<string, User>;
  expandedCategories: Set<string>;
  sortField: SortField;
  sortOrder: SortOrder;
  formatTimestamp: (timestamp: any) => string | null;
  onSort: (field: SortField) => void;
  onToggle: (categoryId: string) => void;
  onView: (categoryId: string) => void;
  onEdit: (categoryId: string) => void;
  onDelete: (category: Category) => void;
  onAddSubcategory: (categoryId: string) => void;
  onEditSubcategory: (categoryId: string, subcategoryId: string) => void;
  onDeleteSubcategory: (categoryId: string, subcategory: any) => void;
}

export default function CategoriesTable({
  categories,
  userCache,
  expandedCategories,
  sortField,
  sortOrder,
  formatTimestamp,
  onSort,
  onToggle,
  onView,
  onEdit,
  onDelete,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
}: CategoriesTableProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body w-12"></th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="name"
                  label="Name"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="order"
                  label="Order"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="searchCount"
                  label="Search Count"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="subcategories"
                  label="Subcategories"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="createdAt"
                  label="Created By"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader
                  field="updatedAt"
                  label="Updated By"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <CategoryRow
                key={category.id}
                category={category}
                index={index}
                isExpanded={expandedCategories.has(category.id)}
                userCache={userCache}
                formatTimestamp={formatTimestamp}
                onToggle={onToggle}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSubcategory={onAddSubcategory}
                onEditSubcategory={onEditSubcategory}
                onDeleteSubcategory={onDeleteSubcategory}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
