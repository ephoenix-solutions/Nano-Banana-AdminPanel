'use client';

import { useState } from 'react';
import { Icons } from '@/config/icons';

interface PageHeaderProps {
  isEditing: boolean;
  saving: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onExport: (format: 'csv' | 'json') => void;
}

export default function PageHeader({
  isEditing,
  saving,
  hasChanges,
  onEdit,
  onCancel,
  onSave,
  onExport,
}: PageHeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format: 'csv' | 'json') => {
    onExport(format);
    setShowExportMenu(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold text-primary font-heading">
          App Settings
        </h1>
        <p className="text-secondary mt-2 font-body">
          Configure application settings and preferences
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isEditing ? (
          <>
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icons.close size={20} />
              <span>Cancel</span>
            </button>
            <button
              onClick={onSave}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icons.save size={20} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </>
        ) : (
          <>
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

              {showExportMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowExportMenu(false)}
                  />
                  
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
                        Export current settings
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
            >
              <Icons.edit size={20} />
              <span>Edit Settings</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
