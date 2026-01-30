import { Icons } from '@/config/icons';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TrashPageHeaderProps {
  totalCategories: number;
  totalSubcategories: number;
  onExport: (format: 'csv' | 'json', type: 'categories' | 'subcategories') => void;
}

export default function TrashPageHeader({ totalCategories, totalSubcategories, onExport }: TrashPageHeaderProps) {
  const router = useRouter();
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format: 'csv' | 'json', type: 'categories' | 'subcategories') => {
    onExport(format, type);
    setShowExportMenu(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-primary font-heading">
          Deleted Categories
        </h1>
        <p className="text-secondary mt-2 font-body">
          Restore or permanently delete categories
        </p>
      </div>
      <div className="flex items-center gap-3">
        {/* Export Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
          >
            <Icons.download size={20} />
            <span>Export</span>
            <Icons.chevronDown size={16} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Export Dropdown Menu */}
          {showExportMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowExportMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-primary/10 z-20">
                <div className="py-2">
                  <button
                    onClick={() => handleExport('csv', 'categories')}
                    className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background transition-colors flex items-center gap-2"
                  >
                    <Icons.fileText size={16} />
                    <span>Export Categories as CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('json', 'categories')}
                    className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background transition-colors flex items-center gap-2"
                  >
                    <Icons.code size={16} />
                    <span>Export Categories as JSON</span>
                  </button>
                  <div className="border-t border-primary/10 my-1"></div>
                  <button
                    onClick={() => handleExport('csv', 'subcategories')}
                    className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background transition-colors flex items-center gap-2"
                  >
                    <Icons.file size={16} />
                    <span>Export Subcategories as CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('json', 'subcategories')}
                    className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background transition-colors flex items-center gap-2"
                  >
                    <Icons.file size={16} />
                    <span>Export Subcategories as JSON</span>
                  </button>
                </div>
                <div className="border-t border-primary/10 px-4 py-2">
                  <p className="text-xs text-secondary">
                    {totalCategories} categor{totalCategories !== 1 ? 'ies' : 'y'}, {totalSubcategories} subcategor{totalSubcategories !== 1 ? 'ies' : 'y'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Back to Categories Button */}
        <button
          onClick={() => router.push('/categories')}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
        >
          <Icons.arrowLeft size={20} />
          <span>Back to Categories</span>
        </button>
      </div>
    </div>
  );
}
