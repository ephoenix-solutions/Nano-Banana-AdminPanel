import { Icons } from '@/config/icons';
import { Prompt } from '@/lib/types/prompt.types';
import { User } from '@/lib/types/user.types';
import UserCell from './UserCell';

interface TableRowProps {
  prompt: Prompt;
  index: number;
  userCache: Record<string, User>;
  getCategoryName: (categoryId: string) => string;
  getSubcategoryName: (categoryId: string, subcategoryId: string) => string;
  formatTimestamp: (timestamp: any) => string | null;
  onView: (prompt: Prompt) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (prompt: Prompt) => void;
  onToggleTrending: (promptId: string, isTrending: boolean) => void;
}

export default function TableRow({
  prompt,
  index,
  userCache,
  getCategoryName,
  getSubcategoryName,
  formatTimestamp,
  onView,
  onEdit,
  onDelete,
  onToggleTrending,
}: TableRowProps) {
  return (
    <tr
      className={`transition-colors ${
        index % 2 === 0
          ? 'bg-white hover:bg-background/50'
          : 'bg-background hover:bg-background-200'
      }`}
    >
      {/* Image */}
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

      {/* Title */}
      <td className="px-6 py-4">
        <div className="max-w-xs">
          <p className="text-sm text-primary font-semibold">
            {prompt.title || 'Untitled'}
          </p>
        </div>
      </td>

      {/* Image Requirement */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
            (prompt.imageRequirement ?? 0) === -1
              ? 'bg-secondary/20 text-secondary'
              : (prompt.imageRequirement ?? 0) === 0
              ? 'bg-accent/20 text-primary'
              : 'bg-accent/30 text-primary'
          }`}
        >
          {(prompt.imageRequirement ?? 0) === -1
            ? 'None'
            : (prompt.imageRequirement ?? 0) === 0
            ? 'Optional'
            : `${prompt.imageRequirement} Req.`}
        </span>
      </td>

      {/* Category */}
      <td className="px-6 py-4 text-sm text-primary">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{getCategoryName(prompt.categoryId)}</span>
          <span className="text-xs text-secondary flex items-center gap-1">
            <Icons.cornerDownRight size={12} />
            {getSubcategoryName(prompt.categoryId, prompt.subCategoryId)}
          </span>
        </div>
      </td>

      {/* Trending Toggle */}
      <td className="px-6 py-4">
        <button
          onClick={() => onToggleTrending(prompt.id, prompt.isTrending)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 cursor-pointer ${
            prompt.isTrending ? 'bg-accent' : 'bg-secondary/30'
          }`}
          title={prompt.isTrending ? 'Trending' : 'Not Trending'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              prompt.isTrending ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </td>

      {/* Likes */}
      <td className="px-6 py-4 text-sm text-primary">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
          {prompt.likesCount || 0}
        </span>
      </td>

      {/* Searches */}
      <td className="px-6 py-4 text-sm text-primary">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/20 text-primary">
          {prompt.searchCount || 0}
        </span>
      </td>

      {/* Saves */}
      <td className="px-6 py-4 text-sm text-primary">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
          <Icons.bookmark size={12} />
          {prompt.savesCount || 0}
        </span>
      </td>

      {/* Created By */}
      <td className="px-6 py-4 text-sm text-primary">
        <UserCell
          user={userCache[prompt.createdBy] || null}
          timestamp={prompt.createdAt}
          formatTimestamp={formatTimestamp}
        />
      </td>

      {/* Updated By */}
      <td className="px-6 py-4 text-sm text-primary">
        {prompt.updatedBy ? (
          <UserCell
            user={userCache[prompt.updatedBy] || null}
            timestamp={prompt.updatedAt}
            formatTimestamp={formatTimestamp}
          />
        ) : (
          <span className="text-secondary text-xs">Not updated</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onView(prompt)}
            className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
            title="View"
          >
            <Icons.eye size={18} />
          </button>
          <button
            onClick={() => onEdit(prompt)}
            className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer"
            title="Edit"
          >
            <Icons.edit size={18} />
          </button>
          <button
            onClick={() => onDelete(prompt)}
            className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
            title="Delete"
          >
            <Icons.trash size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
