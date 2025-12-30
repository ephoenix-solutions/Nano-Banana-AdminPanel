'use client';

import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useEditPromptForm } from '@/lib/hooks/useEditPromptForm';
import FormInput from '@/components/prompts/utils/FormInput';
import FormTextarea from '@/components/prompts/utils/FormTextarea';
import FormSelect from '@/components/prompts/utils/FormSelect';
import ImageRequirementRadio from '@/components/prompts/utils/ImageRequirementRadio';
import TagsInput from '@/components/prompts/utils/TagsInput';
import ErrorMessage from '@/components/prompts/utils/ErrorMessage';

export default function EditPromptPage() {
  const params = useParams();
  const promptId = params.id as string;

  const {
    loading,
    saving,
    error,
    categories,
    subcategories,
    formData,
    tagInput,
    setTagInput,
    handleChange,
    handleAddTag,
    handleRemoveTag,
    handleTagInputKeyDown,
    handleSubmit,
    handleCancel,
  } = useEditPromptForm(promptId);

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
            {/* Title Field */}
            <FormInput
              id="title"
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter a descriptive title for the prompt..."
            />

            {/* Prompt Text Field */}
            <FormTextarea
              id="prompt"
              name="prompt"
              label="Prompt Text"
              value={formData.prompt}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Enter the AI prompt text..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Field */}
              <FormSelect
                id="categoryId"
                name="categoryId"
                label="Category"
                value={formData.categoryId}
                onChange={handleChange}
                options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
                required
                placeholder="Select a category"
              />

              {/* Subcategory Field */}
              <FormSelect
                id="subCategoryId"
                name="subCategoryId"
                label="Subcategory"
                value={formData.subCategoryId}
                onChange={handleChange}
                options={subcategories.map((sub) => ({ value: sub.id, label: sub.name }))}
                required
                disabled={!formData.categoryId || subcategories.length === 0}
                placeholder="Select a subcategory"
              />
            </div>

            {/* Image URL Field */}
            <FormInput
              id="url"
              name="url"
              label="Image URL"
              value={formData.url}
              onChange={handleChange}
              type="url"
              optional
              placeholder="https://example.com/image.jpg"
            />

            {/* Image Requirement Radio Buttons */}
            <ImageRequirementRadio
              value={formData.imageRequirement}
              onChange={handleChange}
            />

            {/* Tags Field */}
            <TagsInput
              tags={formData.tags}
              tagInput={tagInput}
              onTagInputChange={setTagInput}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onKeyDown={handleTagInputKeyDown}
            />

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
            <ErrorMessage message={error} />

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
