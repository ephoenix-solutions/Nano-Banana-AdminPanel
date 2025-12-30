import { Icons } from '@/config/icons';
import { Country } from '@/lib/types/country.types';
import { SortField, SortOrder } from '@/lib/hooks/useCountriesList';
import SortableHeader from './SortableHeader';
import TableRow from './TableRow';

interface CountriesTableProps {
  countries: Country[];
  sortField: SortField;
  sortOrder: SortOrder;
  getCategoryNames: (categoryIds: string[]) => string;
  fetchUserName: (userId: string) => Promise<string>;
  formatTimestamp: (timestamp: any) => string | null;
  onSort: (field: SortField) => void;
  onView: (country: Country) => void;
  onEdit: (country: Country) => void;
  onDelete: (country: Country) => void;
}

export default function CountriesTable({
  countries,
  sortField,
  sortOrder,
  getCategoryNames,
  fetchUserName,
  formatTimestamp,
  onSort,
  onView,
  onEdit,
  onDelete,
}: CountriesTableProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="name" 
                  label="Country Name"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="isoCode" 
                  label="ISO Code"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="categories" 
                  label="Assigned Categories"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="createdAt" 
                  label="Created At"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="updatedAt" 
                  label="Updated By"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {countries.map((country, index) => (
              <TableRow
                key={country.id}
                country={country}
                index={index}
                getCategoryNames={getCategoryNames}
                fetchUserName={fetchUserName}
                formatTimestamp={formatTimestamp}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
