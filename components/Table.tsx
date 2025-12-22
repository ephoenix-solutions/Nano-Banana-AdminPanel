'use client';

import { ReactNode } from 'react';
import { Icons } from '@/config/icons';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
  getRowClassName?: (item: T) => string;
  isEditDisabled?: (item: T) => boolean;
  isDeleteDisabled?: (item: T) => boolean;
}

export default function Table<T extends { id: string }>({
  data,
  columns,
  onView,
  onEdit,
  onDelete,
  loading = false,
  getRowClassName,
  isEditDisabled,
  isDeleteDisabled,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-primary/10 p-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-primary/10 p-12">
        <p className="text-center text-secondary font-body">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm font-semibold text-primary font-body"
                >
                  {column.header}
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {data.map((item, index) => {
              const rowClassName = getRowClassName ? getRowClassName(item) : '';
              const editDisabled = isEditDisabled ? isEditDisabled(item) : false;
              const deleteDisabled = isDeleteDisabled ? isDeleteDisabled(item) : false;
              
              return (
              <tr
                key={item.id}
                className={`hover:bg-background/50 transition-colors ${rowClassName}`}
              >
                {columns.map((column) => (
                  <td
                    key={`${item.id}-${column.key}`}
                    className="px-6 py-4 text-sm text-primary font-body"
                  >
                    {column.render
                      ? column.render(item)
                      : String((item as any)[column.key] || '-')}
                  </td>
                ))}
                {(onView || onEdit || onDelete) && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                          title="View"
                        >
                          <Icons.eye size={18} />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => !editDisabled && onEdit(item)}
                          disabled={editDisabled}
                          className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-background"
                          title={editDisabled ? "Cannot edit admin users" : "Edit"}
                        >
                          <Icons.edit size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => !deleteDisabled && onDelete(item)}
                          disabled={deleteDisabled}
                          className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-secondary"
                          title={deleteDisabled ? "Cannot delete admin users" : "Delete"}
                        >
                          <Icons.trash size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
