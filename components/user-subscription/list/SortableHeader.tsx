import { Icons } from '@/config/icons';
import { SortField, SortOrder } from '@/lib/hooks/useUserSubscriptionsList';

interface SortableHeaderProps {
  field: SortField;
  label: string;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export default function SortableHeader({
  field,
  label,
  sortField,
  sortOrder,
  onSort,
}: SortableHeaderProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onSort(field);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onPointerDown={handlePointerDown}
      className="flex items-center gap-2 transition-all cursor-pointer group"
      style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
      tabIndex={-1}
    >
      <span>{label}</span>
      <div className="flex flex-col">
        <Icons.chevronUp
          size={16}
          className={`-mb-1 transition-all group-hover:scale-110 ${
            sortField === field && sortOrder === 'asc'
              ? 'text-accent'
              : 'text-secondary/30'
          }`}
        />
        <Icons.chevronDown
          size={16}
          className={`-mt-1 transition-all group-hover:scale-110 ${
            sortField === field && sortOrder === 'desc'
              ? 'text-accent'
              : 'text-secondary/30'
          }`}
        />
      </div>
    </button>
  );
}
