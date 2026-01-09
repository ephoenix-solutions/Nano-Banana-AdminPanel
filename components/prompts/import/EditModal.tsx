import Modal from '@/components/Modal';
import TagsInput from '@/components/prompts/utils/TagsInput';
import { Icons } from '@/config/icons';
import { Category } from '@/lib/types/category.types';

interface ImportedPrompt {
  title?: string;
  Title?: string;
  prompt?: string;
  Prompt?: string;
  category?: string;
  Category?: string;
  categoryId?: string;
  subcategory?: string;
  Subcategory?: string;
  subcategoryId?: string;
  imageRequirement?: number | string;
  'Image Requirement'?: number | string;
  isTrending?: string;
  'Is Trending'?: string;
  likesCount?: number | string;
  'Likes Count'?: number | string;
  savesCount?: number | string;
  'Saves Count'?: number | string;
  searchCount?: number | string;
  'Search Count'?: number | string;
  tags?: string;
  Tags?: string;
  imageUrl?: string;
  'Image URL'?: string;
  [key: string]: any;
}

interface EditModalProps {
  isOpen: boolean;
  data: ImportedPrompt | null;
  categories: Category[];
  tagInput: string;
  validationErrors: Record<string, string>;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: any) => void;
  onBatchChange: (updates: Record<string, any>) => void;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  getSubcategories: () => any[];
  validateRowData: (prompt: ImportedPrompt) => string[];
}

export default function EditModal({
  isOpen,
  data,
  categories,
  tagInput,
  validationErrors,
  onClose,
  onSave,
  onChange,
  onBatchChange,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onTagKeyDown,
  getSubcategories,
  validateRowData,
}: EditModalProps) {
  if (!data) return null;

  const warnings = validateRowData(data);
  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const hasWarnings = warnings.length > 0;
  const canSave = !hasValidationErrors && !hasWarnings;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Imported Prompt"
      size="lg"
      footer={
        <div className="space-y-2">
          {!canSave && (
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-lg">
              <Icons.alert size={16} className="text-secondary" />
              <p className="text-xs text-secondary">
                Please fix all validation errors before saving
              </p>
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={!canSave}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                canSave
                  ? 'text-white bg-accent hover:bg-accent/90 cursor-pointer'
                  : 'text-white/50 bg-accent/50 cursor-not-allowed'
              }`}
            >
              <Icons.check size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">
            Title <span className="text-secondary">*</span>
          </label>
          <input
            type="text"
            value={data.title || data.Title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
              validationErrors.title ? 'border-secondary' : 'border-primary/20'
            }`}
            placeholder="Enter prompt title"
          />
          {validationErrors.title && (
            <p className="text-xs text-secondary mt-1">{validationErrors.title}</p>
          )}
        </div>

        {/* Prompt */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">
            Prompt <span className="text-secondary">*</span>
          </label>
          <textarea
            value={data.prompt || data.Prompt || ''}
            onChange={(e) => onChange('prompt', e.target.value)}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
              validationErrors.prompt ? 'border-secondary' : 'border-primary/20'
            }`}
            placeholder="Enter prompt text"
          />
          {validationErrors.prompt && (
            <p className="text-xs text-secondary mt-1">{validationErrors.prompt}</p>
          )}
        </div>

        {/* Category and Subcategory */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Category <span className="text-secondary">*</span>
            </label>
            <select
              value={data.categoryId || ''}
              onChange={(e) => {
                const selectedCategoryId = e.target.value;
                const selectedCategory = categories.find(c => c.id === selectedCategoryId);
                
                // Batch update all category-related fields at once
                onBatchChange({
                  categoryId: selectedCategoryId,
                  category: selectedCategory?.name || '',
                  Category: selectedCategory?.name || '',
                  // Reset subcategory when category changes
                  subcategoryId: '',
                  subcategory: '',
                  Subcategory: '',
                });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                validationErrors.category || warnings.includes('category') ? 'border-secondary' : 'border-primary/20'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {(validationErrors.category || warnings.includes('category')) && (
              <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
                <Icons.alert size={14} />
                <span>{validationErrors.category || 'Category not found in database'}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Subcategory <span className="text-secondary">*</span>
            </label>
            <select
              value={data.subcategoryId || ''}
              onChange={(e) => {
                const selectedSubcategoryId = e.target.value;
                const category = categories.find(c => c.id === data.categoryId);
                const selectedSubcategory = category?.subcategories?.find(s => s.id === selectedSubcategoryId);
                
                // Batch update all subcategory-related fields at once
                onBatchChange({
                  subcategoryId: selectedSubcategoryId,
                  subcategory: selectedSubcategory?.name || '',
                  Subcategory: selectedSubcategory?.name || '',
                });
              }}
              disabled={!data.categoryId}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-background disabled:cursor-not-allowed ${
                validationErrors.subcategory || warnings.includes('subcategory') ? 'border-secondary' : 'border-primary/20'
              }`}
            >
              <option value="">Select a subcategory</option>
              {getSubcategories().map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            {(validationErrors.subcategory || warnings.includes('subcategory')) && (
              <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
                <Icons.alert size={14} />
                <span>{validationErrors.subcategory || 'Subcategory not found'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Requirement and Trending */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Image Requirement
            </label>
            <select
              value={data.imageRequirement || data['Image Requirement'] || 0}
              onChange={(e) => onChange('imageRequirement', parseInt(e.target.value))}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                warnings.includes('imageRequirement') ? 'border-secondary' : 'border-primary/20'
              }`}
            >
              <option value="-1">-1 (None)</option>
              <option value="0">0 (Optional)</option>
              <option value="1">1 (Required)</option>
              <option value="2">2 (Required)</option>
              <option value="3">3 (Required)</option>
              <option value="4">4 (Required)</option>
            </select>
            {warnings.includes('imageRequirement') && (
              <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
                <Icons.alert size={14} />
                <span>Invalid value (must be -1 to 4)</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Is Trending
            </label>
            <select
              value={data.isTrending || data['Is Trending'] || ''}
              onChange={(e) => onChange('isTrending', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                warnings.includes('trending') ? 'border-secondary' : 'border-primary/20'
              }`}
            >
              <option value="">Select Is Trending</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {warnings.includes('trending') && (
              <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
                <Icons.alert size={14} />
                <span>Must be "Yes" or "No"</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Likes Count
            </label>
            <input
              type="number"
              value={data.likesCount || data['Likes Count'] || 0}
              onChange={(e) => onChange('likesCount', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                warnings.includes('likesCount') ? 'border-secondary' : 'border-primary/20'
              }`}
            />
            {warnings.includes('likesCount') && (
              <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
                <Icons.alert size={14} />
                <span>Cannot be negative</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Saves Count
            </label>
            <input
              type="number"
              value={data.savesCount || data['Saves Count'] || 0}
              onChange={(e) => onChange('savesCount', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                warnings.includes('savesCount') ? 'border-secondary' : 'border-primary/20'
              }`}
            />
            {warnings.includes('savesCount') && (
              <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
                <Icons.alert size={14} />
                <span>Cannot be negative</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Search Count
            </label>
            <input
              type="number"
              value={data.searchCount || data['Search Count'] || 0}
              onChange={(e) => onChange('searchCount', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                warnings.includes('searchCount') ? 'border-secondary' : 'border-primary/20'
              }`}
            />
            {warnings.includes('searchCount') && (
              <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
                <Icons.alert size={14} />
                <span>Cannot be negative</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <TagsInput
          tags={(data.tags || data.Tags || '').split(',').map(t => t.trim()).filter(Boolean)}
          tagInput={tagInput}
          onTagInputChange={onTagInputChange}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          onKeyDown={onTagKeyDown}
        />

        {/* Image URL */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">
            Image URL <span className="text-secondary">*</span>
          </label>
          <input
            type="text"
            value={data.imageUrl || data['Image URL'] || ''}
            onChange={(e) => onChange('imageUrl', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
              validationErrors.imageUrl ? 'border-secondary' : 'border-primary/20'
            }`}
            placeholder="https://example.com/image.jpg"
          />
          {validationErrors.imageUrl && (
            <p className="text-xs text-secondary mt-1">{validationErrors.imageUrl}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
