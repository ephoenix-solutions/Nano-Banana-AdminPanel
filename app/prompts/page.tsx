'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { Prompt } from '@/lib/types/prompt.types';
import { Category } from '@/lib/types/category.types';
import {
  getAllPrompts,
  deletePrompt,
  toggleTrending,
} from '@/lib/services/prompt.service';
import { getAllCategories } from '@/lib/services/category.service';
import { Timestamp } from 'firebase/firestore';

export default function PromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    prompt: Prompt | null;
  }>({
    isOpen: false,
    prompt: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [promptsData, categoriesData] = await Promise.all([
        getAllPrompts(),
        getAllCategories(),
      ]);
      setPrompts(promptsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load prompts');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const subcategory = category?.subcategories?.find(
      (s) => s.id === subcategoryId
    );
    return subcategory?.name || 'Unknown';
  };

  const handleAddPrompt = () => {
    router.push('/prompts/add');
  };

  const handleView = (prompt: Prompt) => {
    router.push(`/prompts/view/${prompt.id}`);
  };

  const handleEdit = (prompt: Prompt) => {
    router.push(`/prompts/edit/${prompt.id}`);
  };

  const handleDeleteClick = (prompt: Prompt) => {
    setDeleteModal({
      isOpen: true,
      prompt,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.prompt) return;

    try {
      await deletePrompt(deleteModal.prompt.id);
      await fetchData();
    } catch (err) {
      console.error('Error deleting prompt:', err);
      setError('Failed to delete prompt');
    }
  };

  const handleToggleTrending = async (promptId: string, isTrending: boolean) => {
    try {
      await toggleTrending(promptId, !isTrending);
      await fetchData();
    } catch (err) {
      console.error('Error toggling trending:', err);
      setError('Failed to update trending status');
    }
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
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
        <Breadcrumbs items={[{ label: 'Prompts' }]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Prompts
            </h1>
            <p className="text-secondary mt-2 font-body">
              Manage all AI prompts
            </p>
          </div>
          <button
            onClick={handleAddPrompt}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.plus size={20} />
            <span>Add Prompt</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Prompts
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {prompts.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.file size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Trending
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {prompts.filter((p) => p.isTrending).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.chart size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Likes
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {prompts.reduce((sum, p) => sum + p.likes, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.check size={24} className="text-accent" />
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
                  {prompts.reduce((sum, p) => sum + p.searchCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.search size={24} className="text-secondary" />
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

        {/* Prompts Table */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Tags
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Subcategory
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Trending
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Likes
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {prompts.map((prompt) => (
                  <tr
                    key={prompt.id}
                    className="hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {prompt.url ? (
                        <img
                          src={prompt.url}
                          alt="Prompt preview"
                          className="w-24 h-16 rounded-lg object-cover border border-primary/10"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-24 h-16 rounded-lg bg-background border border-primary/10 flex items-center justify-center">
                          <Icons.images size={24} className="text-secondary/50" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-primary font-semibold">
                          {prompt.title || 'Untitled'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {prompt.tags && prompt.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {prompt.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                            {prompt.tags.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/20 text-primary">
                                +{prompt.tags.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-secondary/50">No tags</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      {getCategoryName(prompt.categoryId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      {getSubcategoryName(prompt.categoryId, prompt.subCategoryId)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleTrending(prompt.id, prompt.isTrending)
                        }
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                          prompt.isTrending
                            ? 'bg-accent text-primary'
                            : 'bg-background text-secondary border border-primary/10'
                        }`}
                      >
                        {prompt.isTrending ? 'Trending' : 'Not Trending'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      {prompt.likes}
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      {formatTimestamp(prompt.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(prompt)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-md transition-all"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(prompt)}
                          className="px-3 py-1.5 text-sm font-medium text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(prompt)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, prompt: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Prompt"
          message={`Are you sure you want to delete this prompt? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
