import { Country } from '@/lib/types/country.types';
import { User } from '@/lib/types/user.types';
import { SortField, SortOrder } from '@/lib/hooks/useCountriesTrash';
import SortableHeader from './SortableHeader';
import TrashTableRow from './TrashTableRow';

interface TrashTableProps {
  countries: Country[];
  userCache: Record<string, User>;
  sortField: SortField;
  sortOrder: SortOrder;
  getCategoryNames: (categoryIds: string[]) => string;
  formatTimestamp: (timestamp: any) => string | null;
  onSort: (field: SortField) => void;
  onView: (country: Country) => void;
  onRestore: (country: Country) => void;
  onPermanentDelete: (country: Country) => void;
}

export default function TrashTable({
  countries,
  userCache,
  sortField,
  sortOrder,
  getCategoryNames,
  formatTimestamp,
  onSort,
  onView,
  onRestore,
  onPermanentDelete,
}: TrashTableProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="overflow-x-visible">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              {/* Country Name */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="name" 
                  label="Country Name"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* ISO Code */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="isoCode" 
                  label="ISO Code"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Assigned Categories */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="categories" 
                  label="Assigned Categories"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Created At */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Created At
              </th>
              {/* Updated By */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Updated By
              </th>
              {/* Deleted By - EXTRA COLUMN */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="deletedAt" 
                  label="Deleted By"
                  currentSortField={sortField}
                  currentSortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              {/* Actions */}
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {countries.map((country, index) => (
              <TrashTableRow
                key={country.id}
                country={country}
                index={index}
                userCache={userCache}
                getCategoryNames={getCategoryNames}
                formatTimestamp={formatTimestamp}
                onView={onView}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
