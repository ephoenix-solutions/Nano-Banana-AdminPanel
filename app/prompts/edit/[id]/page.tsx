'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import {
  getPromptById,
  updatePrompt,
} from '@/lib/services/prompt.service';
import { getAllCategories } from '@/lib/services/category.service';
import { UpdatePromptInput } from '@/lib/types/prompt.types';
import { Category, Subcategory } from '@/lib/types/category.types';
import { useAuth } from '@/lib/hooks/useAuth';

export default function EditPromptPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const promptId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [formData, setFormData] = useState<UpdatePromptInput>({
    title: '',
    categoryId: '',
    subCategoryId: '',
    prompt: '',
    url: '',
    imageRequirement: 0, // Default to optional
    tags: [],
    isTrending: false,
    likes: 0,
    searchCount: 0,
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchData();
  }, [promptId]);

  useEffect(() => {
    if (formData.categoryId) {
      const category = categories.find((c) => c.id === formData.categoryId);
      setSubcategories(category?.subcategories || []);
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId, categories]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prompt, categoriesData] = await Promise.all([
        getPromptById(promptId),
        getAllCategories(),
      ]);

      setCategories(categoriesData);

      if (prompt) {
        setFormData({
          title: prompt.title || '',
          categoryId: prompt.categoryId,
          subCategoryId: prompt.subCategoryId,
          prompt: prompt.prompt,
          url: prompt.url || '',
          imageRequirement: prompt.imageRequirement ?? 0,
          tags: prompt.tags || [],
          isTrending: prompt.isTrending,
          likes: prompt.likes,
          searchCount: prompt.searchCount,
        });
      } else {
        setError('Prompt not found');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load prompt');
    } finally {
      setLoading(false);
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
    } else if (name === 'imageRequirement') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value),
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
    setSaving(true);
    setError(null);

    try {
      if (!formData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.prompt?.trim()) {
        throw new Error('Prompt text is required');
      }
      if (!formData.categoryId) {
        throw new Error('Category is required');
      }
      if (!formData.subCategoryId) {
        throw new Error('Subcategory is required');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await updatePrompt(promptId, {
        ...formData,
        updatedBy: user.id,
      });
      router.push('/prompts');
    } catch (err: any) {
      console.error('Error updating prompt:', err);
      setError(err.message || 'Failed to update prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/prompts');
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
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Prompts', href: '/prompts' },
            { label: 'Edit Prompt' }
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
            Edit Prompt
          </h1>
          <p className="text-secondary mt-2 font-body">
            Update prompt information
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

            {/* Image Requirement Radio Buttons */}
            <div>
             <label htmlFor='imageRequirement' className="block text-sm font-semibold text-primary mb-2 font-body">Image Requirement</label>
               <ul className="items-center w-full text-sm font-medium text-primary bg-background border border-primary/10 rounded-lg sm:flex">
                <li className="w-full border-b border-primary/10 sm:border-b-0 sm:border-r">
                  <div className="flex items-center ps-3">
                    <input
                      id="image-req-none"
                      type="radio"
                      value="-1"
                      name="imageRequirement"
                      checked={formData.imageRequirement === -1}
                      onChange={handleChange}
                      className="w-4 h-4 border-2 border-primary/30 bg-white rounded-full appearance-none cursor-pointer checked:bg-accent checked:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
                    />
                    <label htmlFor="image-req-none" className="w-full py-3 select-none ms-2 text-sm font-medium text-primary cursor-pointer font-body">
                      No Images
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-primary/10 sm:border-b-0 sm:border-r">
                  <div className="flex items-center ps-3">
                    <input
                      id="image-req-optional"
                      type="radio"
                      value="0"
                      name="imageRequirement"
                      checked={formData.imageRequirement === 0}
                      onChange={handleChange}
                      className="w-4 h-4 border-2 border-primary/30 bg-white rounded-full appearance-none cursor-pointer checked:bg-accent checked:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
                    />
                    <label htmlFor="image-req-optional" className="w-full py-3 select-none ms-2 text-sm font-medium text-primary cursor-pointer font-body">
                      Optional
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-primary/10 sm:border-b-0 sm:border-r">
                  <div className="flex items-center ps-3">
                    <input
                      id="image-req-1"
                      type="radio"
                      value="1"
                      name="imageRequirement"
                      checked={formData.imageRequirement === 1}
                      onChange={handleChange}
                      className="w-4 h-4 border-2 border-primary/30 bg-white rounded-full appearance-none cursor-pointer checked:bg-accent checked:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
                    />
                    <label htmlFor="image-req-1" className="w-full py-3 select-none ms-2 text-sm font-medium text-primary cursor-pointer font-body">
                      1 Image
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-primary/10 sm:border-b-0 sm:border-r">
                  <div className="flex items-center ps-3">
                    <input
                      id="image-req-2"
                      type="radio"
                      value="2"
                      name="imageRequirement"
                      checked={formData.imageRequirement === 2}
                      onChange={handleChange}
                      className="w-4 h-4 border-2 border-primary/30 bg-white rounded-full appearance-none cursor-pointer checked:bg-accent checked:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
                    />
                    <label htmlFor="image-req-2" className="w-full py-3 select-none ms-2 text-sm font-medium text-primary cursor-pointer font-body">
                      2 Images
                    </label>
                  </div>
                </li>
                <li className="w-full border-b border-primary/10 sm:border-b-0 sm:border-r">
                  <div className="flex items-center ps-3">
                    <input
                      id="image-req-3"
                      type="radio"
                      value="3"
                      name="imageRequirement"
                      checked={formData.imageRequirement === 3}
                      onChange={handleChange}
                      className="w-4 h-4 border-2 border-primary/30 bg-white rounded-full appearance-none cursor-pointer checked:bg-accent checked:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
                    />
                    <label htmlFor="image-req-3" className="w-full py-3 select-none ms-2 text-sm font-medium text-primary cursor-pointer font-body">
                      3 Images
                    </label>
                  </div>
                </li>
                <li className="w-full">
                  <div className="flex items-center ps-3">
                    <input
                      id="image-req-4"
                      type="radio"
                      value="4"
                      name="imageRequirement"
                      checked={formData.imageRequirement === 4}
                      onChange={handleChange}
                      className="w-4 h-4 border-2 border-primary/30 bg-white rounded-full appearance-none cursor-pointer checked:bg-accent checked:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
                    />
                    <label htmlFor="image-req-4" className="w-full py-3 select-none ms-2 text-sm font-medium text-primary cursor-pointer font-body">
                      4 Images
                    </label>
                  </div>
                </li>
              </ul>
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
                disabled={saving}
                className="px-6 py-3 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icons.save size={20} />
                    <span>Save Changes</span>
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
