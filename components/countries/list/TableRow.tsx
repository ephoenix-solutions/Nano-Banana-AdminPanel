import { Icons } from '@/config/icons';
import { Country } from '@/lib/types/country.types';
import UserCell from './UserCell';

interface TableRowProps {
  country: Country;
  index: number;
  getCategoryNames: (categoryIds: string[]) => string;
  fetchUserName: (userId: string) => Promise<string>;
  formatTimestamp: (timestamp: any) => string | null;
  onView: (country: Country) => void;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
}

export default function TableRow({
  country,
  index,
  getCategoryNames,
  fetchUserName,
  formatTimestamp,
  onView,
  onEdit,
  onDelete,
}: TableRowProps) {
  return (
    <tr
      className={`transition-colors ${
        index % 2 === 0
          ? 'bg-white hover:bg-background/50'
          : 'bg-background hover:bg-background-200'
      }`}
    >
      <td className="px-6 py-4">
        <span className="font-medium text-primary">
          {country.name}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary font-mono">
          {country.isoCode}
        </span>
      </td>
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
      <td className="px-6 py-4 text-sm text-primary">
        <UserCell 
          userId={country.createdBy} 
          timestamp={country.createdAt}
          fetchUserName={fetchUserName}
          formatTimestamp={formatTimestamp}
        />
      </td>
      <td className="px-6 py-4 text-sm text-primary">
        {country.updatedBy ? (
          <UserCell 
            userId={country.updatedBy} 
            timestamp={country.updatedAt}
            fetchUserName={fetchUserName}
            formatTimestamp={formatTimestamp}
          />
        ) : (
          <span className="text-secondary text-xs">Not updated</span>
        )}
      </td>
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
            onClick={() => onEdit(country)}
            className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer"
            title="Edit"
          >
            <Icons.edit size={18} />
          </button>
          <button
            onClick={() => onDelete(country)}
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
