import { Icons } from '@/config/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const pageSizeOptions = [10, 25, 50, 100];

  // Don't render if no items
  if (totalItems === 0 || totalPages === 0) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="bg-white rounded-lg border border-primary/10 p-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Items info */}
        <div className="text-sm text-secondary font-body">
          Showing <span className="font-semibold text-primary">{startItem}</span> to{' '}
          <span className="font-semibold text-primary">{endItem}</span> of{' '}
          <span className="font-semibold text-primary">{totalItems}</span> results
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-primary/10 hover:bg-background transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
            title="Previous page"
          >
            <Icons.chevronLeft size={18} />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`min-w-[40px] h-10 px-3 rounded-lg font-medium text-sm transition-all ${
                  page === currentPage
                    ? 'bg-accent text-primary'
                    : page === '...'
                    ? 'cursor-default text-secondary'
                    : 'border border-primary/10 hover:bg-background text-primary'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-primary/10 hover:bg-background transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
            title="Next page"
          >
            <Icons.chevronRight size={18} />
          </button>
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary font-body whitespace-nowrap">Items per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
