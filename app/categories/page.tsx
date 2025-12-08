'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { Category, Subcategory } from '@/lib/types/category.types';
import {
  getAllCategories,
  deleteCategory,
  deleteSubcategory,
} from '@/lib/services/category.service';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'category' | 'subcategory';
    categoryId: string | null;
    subcategoryId: string | null;
    name: string;
  }>({
    isOpen: false,
    type: 'category',
    categoryId: null,
    subcategoryId: null,
    name: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleAddCategory = () => {
    router.push('/categories/add');
  };

  const handleViewCategory = (categoryId: string) => {
    router.push(`/categories/view/${categoryId}`);
  };

  const handleEditCategory = (categoryId: string) => {
    router.push(`/categories/edit/${categoryId}`);
  };

  const handleDeleteCategoryClick = (category: Category) => {
    setDeleteModal({
      isOpen: true,
      type: 'category',
      categoryId: category.id,
      subcategoryId: null,
      name: category.name,
    });
  };

  const handleAddSubcategory = (categoryId: string) => {
    router.push(`/categories/${categoryId}/subcategories/add`);
  };

  const handleEditSubcategory = (
    categoryId: string,
    subcategoryId: string
  ) => {
    router.push(`/categories/${categoryId}/subcategories/edit/${subcategoryId}`);
  };

  const handleDeleteSubcategoryClick = (
    categoryId: string,
    subcategory: Subcategory
  ) => {
    setDeleteModal({
      isOpen: true,
      type: 'subcategory',
      categoryId,
      subcategoryId: subcategory.id,
      name: subcategory.name,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteModal.type === 'category' && deleteModal.categoryId) {
        await deleteCategory(deleteModal.categoryId);
      } else if (
        deleteModal.type === 'subcategory' &&
        deleteModal.categoryId &&
        deleteModal.subcategoryId
      ) {
        await deleteSubcategory(
          deleteModal.categoryId,
          deleteModal.subcategoryId
        );
      }
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting:', err);
      setError(`Failed to delete ${deleteModal.type}`);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Categories' }]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Categories
            </h1>
            <p className="text-secondary mt-2 font-body">
              Manage categories and subcategories
            </p>
          </div>
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.plus size={20} />
            <span>Add Category</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Categories
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {categories.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.categories size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Subcategories
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {categories.reduce(
                    (sum, cat) => sum + (cat.subcategories?.length || 0),
                    0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.file size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Searches
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {categories.reduce(
                    (sum, cat) =>
                      sum + parseInt(String(cat.searchCount) || '0'),
                    0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.search size={24} className="text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error}</p>
            </div>
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body w-12"></th>
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
                    Subcategories
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {categories.map((category) => {
                  const isExpanded = expandedCategories.has(category.id);
                  const hasSubcategories =
                    category.subcategories && category.subcategories.length > 0;

                  return (
                    <>
                      {/* Category Row */}
                      <tr
                        key={category.id}
                        className="hover:bg-background/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {hasSubcategories && (
                            <button
                              onClick={() => toggleCategory(category.id)}
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
                              <Icons.categories
                                size={20}
                                className="text-accent"
                              />
                            </div>
                            <span className="font-semibold text-primary">
                              {category.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-primary">
                          {category.order}
                        </td>
                        <td className="px-6 py-4 text-sm text-primary">
                          {category.searchCount}
                        </td>
                        <td className="px-6 py-4 text-sm text-primary">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/20 text-primary">
                            {category.subcategories?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAddSubcategory(category.id)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all"
                              title="Add Subcategory"
                            >
                              <Icons.plus size={16} />
                            </button>
                            <button
                              onClick={() => handleViewCategory(category.id)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-all"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleEditCategory(category.id)}
                              className="px-3 py-1.5 text-sm font-medium text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCategoryClick(category)
                              }
                              className="px-3 py-1.5 text-sm font-medium text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Subcategories Rows */}
                      {isExpanded &&
                        hasSubcategories &&
                        category.subcategories!.map((subcategory) => (
                          <tr
                            key={`${category.id}-${subcategory.id}`}
                            className="bg-background/30 hover:bg-background/50 transition-colors"
                          >
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2 ml-8">
                                <Icons.chevronRight
                                  size={14}
                                  className="text-secondary"
                                />
                                <span className="text-sm text-primary">
                                  {subcategory.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sm text-primary">
                              {subcategory.order}
                            </td>
                            <td className="px-6 py-3 text-sm text-primary">
                              {subcategory.searchCount}
                            </td>
                            <td className="px-6 py-3 text-sm text-secondary">
                              -
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    handleEditSubcategory(
                                      category.id,
                                      subcategory.id
                                    )
                                  }
                                  className="px-3 py-1.5 text-sm font-medium text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteSubcategoryClick(
                                      category.id,
                                      subcategory
                                    )
                                  }
                                  className="px-3 py-1.5 text-sm font-medium text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() =>
            setDeleteModal({
              isOpen: false,
              type: 'category',
              categoryId: null,
              subcategoryId: null,
              name: '',
            })
          }
          onConfirm={handleDeleteConfirm}
          title={`Delete ${
            deleteModal.type === 'category' ? 'Category' : 'Subcategory'
          }`}
          message={`Are you sure you want to delete "${deleteModal.name}"? ${
            deleteModal.type === 'category'
              ? 'This will also delete all subcategories.'
              : 'This action cannot be undone.'
          }`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
