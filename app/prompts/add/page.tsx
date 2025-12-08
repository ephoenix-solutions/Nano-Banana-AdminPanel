'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { createPrompt } from '@/lib/services/prompt.service';
import { getAllCategories } from '@/lib/services/category.service';
import { CreatePromptInput } from '@/lib/types/prompt.types';
import { Category, Subcategory } from '@/lib/types/category.types';

export default function AddPromptPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [formData, setFormData] = useState<CreatePromptInput>({
    title: '',
    categoryId: '',
    subCategoryId: '',
    prompt: '',
    url: '',
    tags: [],
    isTrending: false,
    likes: 0,
    searchCount: 0,
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      const category = categories.find((c) => c.id === formData.categoryId);
      setSubcategories(category?.subcategories || []);
      // Reset subcategory when category changes
      setFormData((prev) => ({ ...prev, subCategoryId: '' }));
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId, categories]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'likes' || name === 'searchCount') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags?.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.prompt.trim()) {
        throw new Error('Prompt text is required');
      }
      if (!formData.categoryId) {
        throw new Error('Category is required');
      }
      if (!formData.subCategoryId) {
        throw new Error('Subcategory is required');
      }

      await createPrompt(formData);
      router.push('/prompts');
    } catch (err: any) {
      console.error('Error creating prompt:', err);
      setError(err.message || 'Failed to create prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/prompts');
  };

  if (loadingCategories) {
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
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Prompts', href: '/prompts' },
            { label: 'Add Prompt' }
          ]} 
        />

        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
          >
            <Icons.arrowLeft size={20} />
            <span className="font-body text-sm">Back to Prompts</span>
          </button>
          <h1 className="text-4xl font-bold text-primary font-heading">
            Add New Prompt
          </h1>
          <p className="text-secondary mt-2 font-body">
            Create a new AI prompt
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-primary/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field - Full Width */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-primary mb-2 font-body"
              >
                Title <span className="text-secondary">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="Enter a descriptive title for the prompt..."
              />
            </div>

            {/* Prompt Text Field - Full Width */}
            <div>
              <label
                htmlFor="prompt"
                className="block text-sm font-semibold text-primary mb-2 font-body"
              >
                Prompt Text <span className="text-secondary">*</span>
              </label>
              <textarea
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                placeholder="Enter the AI prompt text..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Field */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Category <span className="text-secondary">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Field */}
              <div>
                <label
                  htmlFor="subCategoryId"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Subcategory <span className="text-secondary">*</span>
                </label>
                <select
                  id="subCategoryId"
                  name="subCategoryId"
                  value={formData.subCategoryId}
                  onChange={handleChange}
                  required
                  disabled={!formData.categoryId || subcategories.length === 0}
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image URL Field - Full Width */}
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-semibold text-primary mb-2 font-body"
              >
                Image URL <span className="text-secondary/50">(Optional)</span>
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Tags Field - Full Width */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-semibold text-primary mb-2 font-body"
              >
                Tags <span className="text-secondary/50">(Optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="flex-1 px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="Enter a tag and press Enter or click Add"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-all"
                >
                  Add Tag
                </button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent/20 text-primary border border-accent/30"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-secondary transition-colors"
                      >
                        <Icons.close size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Trending Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isTrending"
                name="isTrending"
                checked={formData.isTrending}
                onChange={handleChange}
                className="w-5 h-5 rounded border-primary/10 text-accent focus:ring-accent focus:ring-2"
              />
              <label
                htmlFor="isTrending"
                className="text-sm font-medium text-primary font-body cursor-pointer"
              >
                Mark as Trending
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Icons.alert size={20} className="text-secondary" />
                  <p className="text-secondary font-body text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary/10">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Icons.check size={20} />
                    <span>Create Prompt</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
