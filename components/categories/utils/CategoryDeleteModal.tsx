import { Icons } from '@/config/icons';
import { Country } from '@/lib/types/country.types';
import { useEffect, useRef, useState } from 'react';

interface CategoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
  promptsCount: number;
  countries: Country[];
  loadingUsage: boolean;
}

export default function CategoryDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  promptsCount,
  countries,
  loadingUsage,
}: CategoryDeleteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [confirmText, setConfirmText] = useState('');
  const isConfirmValid = confirmText === categoryName;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setConfirmText(''); // Reset confirmation text when modal opens
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (isConfirmValid) {
      onConfirm();
      setConfirmText(''); // Reset after confirm
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10">
          <h2 className="text-xl font-bold text-primary font-heading">
            Delete Category
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors"
          >
            <Icons.close size={20} className="text-primary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loadingUsage ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-primary font-body">
                Are you sure you want to delete "<strong>{categoryName}</strong>"?
              </p>

              <div className="space-y-3">
                <p className="text-sm text-secondary">
                  This category is currently being used in:
                </p>

                <ul className="space-y-2 text-sm text-primary">
                  <li className="flex items-center gap-2">
                    <Icons.feedback size={16} className="text-accent" />
                    <span><strong>{promptsCount}</strong> prompt{promptsCount !== 1 ? 's' : ''}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icons.globe size={16} className="text-accent" />
                    <span><strong>{countries.length}</strong> countr{countries.length !== 1 ? 'ies' : 'y'}</span>
                  </li>
                </ul>

                {/* Countries List */}
                {countries.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-secondary mb-2">Countries:</p>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-background rounded-lg">
                      {countries.map((country) => (
                        <span
                          key={country.id}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white border border-primary/10 text-primary"
                        >
                          {country.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-secondary">
                  This will also delete all subcategories. This action cannot be undone.
                </p>
              </div>

              {/* Confirmation Input */}
              <div className="mt-3">
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type category name here"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all font-normal ${confirmText && !isConfirmValid
                    ? 'border-secondary focus:ring-secondary/50 focus:border-secondary'
                    : confirmText && isConfirmValid
                      ? 'border-accent focus:ring-accent/50 focus:border-accent'
                      : 'border-primary/20 focus:ring-accent focus:border-transparent'
                    }`}
                  autoComplete="off"
                />
                {!confirmText && (
                  <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                    <Icons.alert size={12} />
                    Please enter the category name to confirm deletion.
                  </p>
                )}
                {confirmText && !isConfirmValid && (
                  <p className="text-xs text-secondary mt-2 flex items-center gap-1">
                    <Icons.alert size={12} />
                    Category name does not match
                  </p>
                )}
                {confirmText && isConfirmValid && (
                  <p className="text-xs text-accent mt-2 flex items-center gap-1">
                    <Icons.check size={12} />
                    Verified
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-primary/10 bg-background/50">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10 hover:cursor-pointer"
              disabled={loadingUsage}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isConfirmValid || loadingUsage}
              className="px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary/90 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              Delete Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
