import { Icons } from '@/config/icons';
import { Prompt } from '@/lib/types/prompt.types';
import { User } from '@/lib/types/user.types';
import UserCell from '@/components/prompts/list/UserCell';

interface TrashTableRowProps {
  prompt: Prompt;
  index: number;
  userCache: Record<string, User>;
  getCategoryName: (categoryId: string) => string;
  getSubcategoryName: (categoryId: string, subcategoryId: string) => string;
  formatTimestamp: (timestamp: any) => string | null;
  onView: (prompt: Prompt) => void;
  onRestore: (prompt: Prompt) => void;
  onPermanentDelete: (prompt: Prompt) => void;
}

export default function TrashTableRow({
  prompt,
  index,
  userCache,
  getCategoryName,
  getSubcategoryName,
  formatTimestamp,
  onView,
  onRestore,
  onPermanentDelete,
}: TrashTableRowProps) {
  const deletedByUser = prompt.deletedBy ? userCache[prompt.deletedBy] : null;

  return (
    <tr
      className={`transition-colors ${
        index % 2 === 0
          ? 'bg-white hover:bg-background/50'
          : 'bg-background hover:bg-background-200'
      }`}
    >
      {/* Image - EXACT SAME */}
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

      {/* Title - EXACT SAME */}
      <td className="px-6 py-4">
        <div className="max-w-xs">
          <p className="text-sm text-primary font-semibold">
            {prompt.title || 'Untitled'}
          </p>
        </div>
      </td>

      {/* Image Requirement - EXACT SAME */}
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
            : `${prompt.imageRequirement}`}
        </span>
      </td>

      {/* Category - EXACT SAME */}
      <td className="px-6 py-4 text-sm text-primary">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{getCategoryName(prompt.categoryId)}</span>
          <span className="text-xs text-secondary flex items-center gap-1">
            <Icons.cornerDownRight size={12} />
            {getSubcategoryName(prompt.categoryId, prompt.subCategoryId)}
          </span>
        </div>
      </td>

      {/* Trending - EXACT SAME (but disabled) */}
      <td className="px-6 py-4">
        <div
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors opacity-50 cursor-not-allowed ${
            prompt.isTrending ? 'bg-accent' : 'bg-secondary/30'
          }`}
          title={prompt.isTrending ? 'Was Trending' : 'Not Trending'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              prompt.isTrending ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </div>
      </td>

      {/* Stats (Likes, Searches, Saves) - COMBINED */}
      <td className="px-6 py-4 text-sm text-primary">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-xs">
            <Icons.heart size={12} className="text-accent" />
            <span>{prompt.likesCount || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Icons.search size={12} className="text-secondary" />
            <span>{prompt.searchCount || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Icons.bookmark size={12} className="text-accent" />
            <span>{prompt.savesCount || 0}</span>
          </div>
        </div>
      </td>

      {/* Created By - EXACT SAME */}
      <td className="px-6 py-4 text-sm text-primary">
        <UserCell
          user={userCache[prompt.createdBy] || null}
          timestamp={prompt.createdAt}
          formatTimestamp={formatTimestamp}
        />
      </td>

      {/* Updated By - EXACT SAME */}
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

      {/* Deleted By - NEW COLUMN */}
      <td className="px-6 py-4 text-sm text-primary">
        {deletedByUser ? (
          <UserCell
            user={deletedByUser}
            timestamp={prompt.deletedAt}
            formatTimestamp={formatTimestamp}
          />
        ) : (
          <span className="text-secondary text-xs">Unknown</span>
        )}
      </td>

      {/* Actions - VIEW + RESTORE + PERMANENT DELETE */}
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
            onClick={() => onRestore(prompt)}
            className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
            title="Restore Prompt"
          >
            <Icons.rotateCcw size={18} />
          </button>
          <button
            onClick={() => onPermanentDelete(prompt)}
            className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
            title="Permanently Delete"
          >
            <Icons.trash size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
