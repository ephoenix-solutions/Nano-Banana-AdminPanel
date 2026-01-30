import { Icons } from '@/config/icons';
import { Prompt } from '@/lib/types/prompt.types';
import { Category } from '@/lib/types/category.types';
import { getCategoryName, getSubcategoryName, formatTimestamp } from '@/lib/utils/format.utils';

interface PromptInfoGridProps {
  prompt: Prompt;
  categories: Category[];
  creatorName: string;
  creatorPhoto: string;
  updaterName: string;
  updaterPhoto: string;
}

export default function PromptInfoGrid({
  prompt,
  categories,
  creatorName,
  creatorPhoto,
  updaterName,
  updaterPhoto,
}: PromptInfoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Title */}
      <div className="bg-background rounded-lg p-4 border border-primary/10 md:col-span-2">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.file size={20} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary font-body mb-1">Title</p>
            <p className="text-lg font-bold text-primary font-body">
              {prompt.title || 'Untitled'}
            </p>
          </div>
        </div>
      </div>

      {/* Prompt ID */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.file size={20} className="text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary font-body mb-1">Prompt ID</p>
            <p className="text-base font-semibold text-primary font-body break-all">
              {prompt.id}
            </p>
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.categories size={20} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary font-body mb-1">Category</p>
            <p className="text-base font-semibold text-primary font-body">
              {getCategoryName(categories, prompt.categoryId)}
            </p>
          </div>
        </div>
      </div>

      {/* Subcategory */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.file size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Subcategory</p>
            <p className="text-base font-semibold text-primary font-body">
              {getSubcategoryName(categories, prompt.categoryId, prompt.subCategoryId)}
            </p>
          </div>
        </div>
      </div>

      {/* Trending Status */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.chart size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Trending Status</p>
            <p className="text-base font-semibold text-primary font-body">
              {prompt.isTrending ? 'Yes - Trending' : 'No - Not Trending'}
            </p>
          </div>
        </div>
      </div>

      {/* Likes */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.check size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Total Likes</p>
            <p className="text-base font-semibold text-primary font-body">
              {prompt.likesCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Saves */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.bookmark size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Total Saves</p>
            <p className="text-base font-semibold text-primary font-body">
              {prompt.savesCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Search Count */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.search size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Search Count</p>
            <p className="text-base font-semibold text-primary font-body">
              {prompt.searchCount}
            </p>
          </div>
        </div>
      </div>

      {/* Image Requirement */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.images size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Image Requirement</p>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                  (prompt.imageRequirement ?? 0) === -1
                    ? 'bg-secondary/20 text-secondary'
                    : (prompt.imageRequirement ?? 0) === 0
                    ? 'bg-accent/20 text-primary'
                    : 'bg-accent/30 text-primary'
                }`}
              >
                {(prompt.imageRequirement ?? 0) === -1
                  ? 'No Images Required'
                  : (prompt.imageRequirement ?? 0) === 0
                  ? 'Optional'
                  : `${prompt.imageRequirement} Image${prompt.imageRequirement > 1 ? 's' : ''} Required`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Created By */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {creatorPhoto ? (
              <img
                src={creatorPhoto}
                alt={creatorName}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center"
              style={{ display: creatorPhoto ? 'none' : 'flex' }}
            >
              <Icons.users size={20} className="text-accent" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Created By</p>
            <p className="text-base font-semibold text-primary font-body">
              {creatorName}
            </p>
            {prompt.createdAt && (
              <p className="text-xs text-secondary font-body mt-1">
                {formatTimestamp(prompt.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Updated By */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {prompt.updatedBy && updaterPhoto ? (
              <img
                src={updaterPhoto}
                alt={updaterName}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center"
              style={{ display: (prompt.updatedBy && updaterPhoto) ? 'none' : 'flex' }}
            >
              <Icons.users size={20} className="text-secondary" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Updated By</p>
            {prompt.updatedBy ? (
              <>
                <p className="text-base font-semibold text-primary font-body">
                  {updaterName}
                </p>
                {prompt.updatedAt && (
                  <p className="text-xs text-secondary font-body mt-1">
                    {formatTimestamp(prompt.updatedAt)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-base text-secondary font-body italic">
                Not updated yet
              </p>
            )}
          </div>
        </div>
      </div>
      {/* isDeleted */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.trash size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Prompt Status</p>
            <p className="text-base font-semibold text-primary font-body">
              {prompt.isDeleted ? 'Deleted' : 'Active'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
