import { Icons } from '@/config/icons';
import { Country } from '@/lib/types/country.types';
import { User } from '@/lib/types/user.types';
import UserCell from '@/components/countries/list/UserCell';

interface TrashTableRowProps {
  country: Country;
  index: number;
  userCache: Record<string, User>;
  getCategoryNames: (categoryIds: string[]) => string;
  formatTimestamp: (timestamp: any) => string | null;
  onView: (country: Country) => void;
  onRestore: (country: Country) => void;
  onPermanentDelete: (country: Country) => void;
}

export default function TrashTableRow({
  country,
  index,
  userCache,
  getCategoryNames,
  formatTimestamp,
  onView,
  onRestore,
  onPermanentDelete,
}: TrashTableRowProps) {
  const deletedByUser = country.deletedBy ? userCache[country.deletedBy] : null;
  const createdByUser = userCache[country.createdBy] || null;
  const updatedByUser = country.updatedBy ? userCache[country.updatedBy] : null;

  return (
    <tr
      className={`transition-colors ${
        index % 2 === 0
          ? 'bg-white hover:bg-background/50'
          : 'bg-background hover:bg-background-200'
      }`}
    >
      {/* Country Name - EXACT SAME */}
      <td className="px-6 py-4">
        <span className="font-medium text-primary">
          {country.name}
        </span>
      </td>

      {/* ISO Code - EXACT SAME */}
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary font-mono">
          {country.isoCode}
        </span>
      </td>

      {/* Assigned Categories - EXACT SAME */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/20 text-primary">
            {country.categories?.length || 0} categories
          </span>
          {country.categories && country.categories.length > 0 && (
            <span className="text-xs text-secondary truncate max-w-xs">
              {getCategoryNames(country.categories)}
            </span>
          )}
        </div>
      </td>

      {/* Created At - EXACT SAME */}
      <td className="px-6 py-4 text-sm text-primary">
        {createdByUser ? (
          <div className="flex flex-col">
            <span className="font-medium">{createdByUser.name}</span>
            <span className="text-xs text-secondary">
              {formatTimestamp(country.createdAt)}
            </span>
          </div>
        ) : (
          <span className="text-secondary text-xs">Unknown</span>
        )}
      </td>

      {/* Updated By - EXACT SAME */}
      <td className="px-6 py-4 text-sm text-primary">
        {country.updatedBy && updatedByUser ? (
          <div className="flex flex-col">
            <span className="font-medium">{updatedByUser.name}</span>
            <span className="text-xs text-secondary">
              {formatTimestamp(country.updatedAt)}
            </span>
          </div>
        ) : (
          <span className="text-secondary text-xs">Not updated</span>
        )}
      </td>

      {/* Deleted By - NEW COLUMN */}
      <td className="px-6 py-4 text-sm text-primary">
        {deletedByUser ? (
          <div className="flex flex-col">
            <span className="font-medium">{deletedByUser.name}</span>
            <span className="text-xs text-secondary">
              {formatTimestamp(country.deletedAt)}
            </span>
          </div>
        ) : (
          <span className="text-secondary text-xs">Unknown</span>
        )}
      </td>

      {/* Actions - VIEW + RESTORE + PERMANENT DELETE */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onView(country)}
            className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
            title="View"
          >
            <Icons.eye size={18} />
          </button>
          <button
            onClick={() => onRestore(country)}
            className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
            title="Restore Country"
          >
            <Icons.rotateCcw size={18} />
          </button>
          <button
            onClick={() => onPermanentDelete(country)}
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
