import { Icons } from '@/config/icons';
import { useState } from 'react';

interface PageHeaderProps {
  onAddPlan: () => void;
  onExport: (format: 'csv' | 'json') => void;
  totalPlans: number;
}

export default function PageHeader({ onAddPlan, onExport, totalPlans }: PageHeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format: 'csv' | 'json') => {
    onExport(format);
    setShowExportMenu(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-primary font-heading">
          Subscription Plans
        </h1>
        <p className="text-secondary mt-2 font-body">
          Manage subscription plans and pricing
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-primary/10 z-20">
                <div className="py-2">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background transition-colors flex items-center gap-2"
                  >
                    <Icons.fileText size={16} />
                    <span>Export as CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-background transition-colors flex items-center gap-2"
                  >
                    <Icons.code size={16} />
                    <span>Export as JSON</span>
                  </button>
                </div>
                <div className="border-t border-primary/10 px-4 py-2">
                  <p className="text-xs text-secondary">
                    {totalPlans} plan{totalPlans !== 1 ? 's' : ''} will be exported
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Add Plan Button */}
        <button
          onClick={onAddPlan}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
        >
          <Icons.plus size={20} />
          <span>Add Plan</span>
        </button>
      </div>
    </div>
  );
}
