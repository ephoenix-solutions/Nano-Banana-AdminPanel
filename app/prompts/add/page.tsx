'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useAddPromptForm } from '@/lib/hooks/useAddPromptForm';
import FormInput from '@/components/prompts/utils/FormInput';
import FormTextarea from '@/components/prompts/utils/FormTextarea';
import FormSelect from '@/components/prompts/utils/FormSelect';
import ImageRequirementRadio from '@/components/prompts/utils/ImageRequirementRadio';
import TagsInput from '@/components/prompts/utils/TagsInput';
import FormActions from '@/components/prompts/utils/FormActions';
import ErrorMessage from '@/components/prompts/utils/ErrorMessage';
import ImageUpload from '@/components/shared/ImageUpload';

export default function AddPromptPage() {
  const {
    loading,
    loadingCategories,
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
  } = useAddPromptForm();

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

            {/* Image Upload Field */}
            <ImageUpload
              value={formData.url}
              onChange={(url) => handleChange({ target: { name: 'url', value: url } } as any)}
              folder="prompts"
              label="Prompt Image"
              required={true}
              enableCrop={true}
              aspectRatio={4/3}
            />

            {/* Image Requirement Radio Buttons */}
            <ImageRequirementRadio
              value={formData.imageRequirement}
              onChange={handleChange}
            />

            {/* Tags Field */}
            <TagsInput
              tags={formData.tags || []}
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

            {/* Form Actions */}
            <FormActions loading={loading} onCancel={handleCancel} />
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
