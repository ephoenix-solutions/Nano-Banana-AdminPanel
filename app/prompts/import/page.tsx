'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useImportPrompts } from '@/lib/hooks/useImportPrompts';
import UploadArea from '@/components/prompts/import/UploadArea';
import PreviewTable from '@/components/prompts/import/PreviewTable';
import EditModal from '@/components/prompts/import/EditModal';

export default function ImportPromptsPage() {
  const {
    // State
    isDragging,
    file,
    importedData,
    error,
    loading,
    isImporting,
    categories,
    tagInput,
    validationErrors,
    editModal,
    
    // Handlers
    handleBack,
    handleDownloadSample,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleRemoveFile,
    handleEditClick,
    handleEditSave,
    handleEditCancel,
    handleEditChange,
    handleBatchEditChange,
    handleAddTag,
    handleRemoveTag,
    handleTagInputKeyDown,
    handleConfirmImport,
    setTagInput,
    
    // Utilities
    formatImageRequirement,
    getSubcategories,
    validateRowData,
    canImport,
  } = useImportPrompts();

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Prompts', href: '/prompts' },
            { label: 'Import' }
          ]} 
        />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={handleBack}
              disabled={isImporting}
              className={`flex items-center gap-2 mb-4 transition-colors ${
                isImporting 
                  ? 'text-secondary/50 cursor-not-allowed' 
                  : 'text-secondary hover:text-primary cursor-pointer'
              }`}
            >
              <Icons.arrowLeft size={20} />
              <span className="font-body text-sm">Back to Prompts</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Import Prompts
            </h1>
            <p className="text-secondary mt-2 font-body">
              Upload a CSV file to import prompts
            </p>
          </div>
          <button
            onClick={handleDownloadSample}
            disabled={isImporting}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all border border-primary/10 ${
              isImporting
                ? 'bg-background/50 text-primary/50 cursor-not-allowed'
                : 'bg-background text-primary hover:bg-primary/5 cursor-pointer'
            }`}
          >
            <Icons.download size={20} />
            <span>Download Sample</span>
          </button>
        </div>

        {/* Upload Area */}
        <UploadArea
          file={file}
          isDragging={isDragging}
          error={error}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
        />

        {/* Preview Table */}
        {importedData.length > 0 && (
          <>
            <PreviewTable
              importedData={importedData}
              onEdit={handleEditClick}
              formatImageRequirement={formatImageRequirement}
              validateRowData={validateRowData}
            />

            {/* Confirm Import Button */}
            <div className="bg-white rounded-lg border border-primary/10 p-6">
              {error && (
                <div className="mb-4 bg-secondary/10 border border-secondary rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Icons.alert size={20} className="text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-secondary">{error}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-primary font-heading">
                    Ready to Import?
                  </h3>
                  <p className="text-sm text-secondary mt-1">
                    {canImport() 
                      ? `${importedData.length} prompt${importedData.length !== 1 ? 's' : ''} ready to be imported`
                      : 'Please fix all validation errors before importing'
                    }
                  </p>
                </div>
                <button
                  onClick={handleConfirmImport}
                  disabled={!canImport() || isImporting}
                  className={`flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all ${
                    canImport() && !isImporting
                      ? 'bg-accent text-white hover:bg-accent/90 cursor-pointer'
                      : 'bg-accent/50 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Icons.check size={20} />
                      <span>Confirm Import</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        )}

        {/* Edit Modal */}
        <EditModal
          isOpen={editModal.isOpen}
          data={editModal.data}
          categories={categories}
          tagInput={tagInput}
          validationErrors={validationErrors}
          onClose={handleEditCancel}
          onSave={handleEditSave}
          onChange={handleEditChange}
          onBatchChange={handleBatchEditChange}
          onTagInputChange={setTagInput}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onTagKeyDown={handleTagInputKeyDown}
          getSubcategories={getSubcategories}
          validateRowData={validateRowData}
        />
      </div>
    </AdminLayout>
  );
}
