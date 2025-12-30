import { Icons } from '@/config/icons';

interface EmptyStateProps {
  type: 'no-data' | 'no-results';
  onAddUser?: () => void;
  onClearFilters?: () => void;
}

export default function EmptyState({ type, onAddUser, onClearFilters }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
        <Icons.search size={48} className="text-secondary/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-primary mb-2">No users found</h3>
        <p className="text-secondary mb-4">
          No users match your current filters. Try adjusting your search or filters.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
      <Icons.users size={48} className="text-secondary/30 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-primary mb-2">No users yet</h3>
      <p className="text-secondary mb-4">
        There are no users in the system. Add your first user to get started.
      </p>
      {onAddUser && (
        <button
          onClick={onAddUser}
          className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all inline-flex items-center gap-2"
        >
          <Icons.plus size={20} />
          <span>Add User</span>
        </button>
      )}
    </div>
  );
}
