import { Icons } from '@/config/icons';

interface UploadAreaProps {
  file: File | null;
  isDragging: boolean;
  error: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export default function UploadArea({
  file,
  isDragging,
  error,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  onRemoveFile,
}: UploadAreaProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 p-8">
      <h3 className="text-xl font-bold text-primary font-heading mb-2">
        Upload CSV File
      </h3>
      <div className="mb-6 bg-background rounded-lg p-4 border border-primary/10">
        <p className="text-sm text-primary font-semibold mb-2">CSV Format Requirements:</p>
        <ul className="text-xs text-secondary space-y-1 list-disc list-inside">
          <li><strong>Image Requirement:</strong> Use numeric values: -1 (none), 0 (optional), 1-4 (required count)</li>
          <li><strong>Is Trending:</strong> Use "Yes" or "No"</li>
          <li><strong>Tags:</strong> Separate multiple tags with commas</li>
          <li><strong>Auto-generated fields:</strong> ID, Created By, Created At, Updated By, Updated At will be added automatically</li>
        </ul>
      </div>

      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-primary/20 hover:border-accent hover:bg-accent/5'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
              <Icons.upload size={32} className="text-accent" />
            </div>
            <div>
              <p className="text-lg font-semibold text-primary mb-2">
                Drag and drop your CSV file here
              </p>
              <p className="text-sm text-secondary mb-4">
                or click to browse
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={onFileSelect}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all">
                <Icons.file size={20} />
                Select CSV File
              </span>
            </label>
          </div>
        </div>
      ) : (
        <div className="border border-primary/10 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.file size={24} className="text-accent" />
              </div>
              <div>
                <p className="font-semibold text-primary">{file.name}</p>
                <p className="text-sm text-secondary">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={onRemoveFile}
              className="p-2 text-secondary hover:text-primary hover:bg-background rounded-lg transition-all"
            >
              <Icons.trash size={20} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-secondary/10 border border-secondary rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Icons.alert size={20} className="text-secondary" />
            <p className="text-secondary font-body">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
