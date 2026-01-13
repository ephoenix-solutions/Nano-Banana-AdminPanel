import { Icons } from '@/config/icons';

interface ImportedPrompt {
  title?: string;
  Title?: string;
  prompt?: string;
  Prompt?: string;
  category?: string;
  Category?: string;
  subcategory?: string;
  Subcategory?: string;
  imageRequirement?: number | string;
  'Image Requirement'?: number | string;
  isTrending?: string;
  'Is Trending'?: string;
  tags?: string;
  Tags?: string;
  [key: string]: any;
}

interface PreviewTableProps {
  importedData: ImportedPrompt[];
  onEdit: (index: number) => void;
  formatImageRequirement: (value: number | string) => string;
  validateRowData: (prompt: ImportedPrompt) => string[];
}

export default function PreviewTable({
  importedData,
  onEdit,
  formatImageRequirement,
  validateRowData,
}: PreviewTableProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="p-6 border-b border-primary/10">
        <h3 className="text-xl font-bold text-primary font-heading">
          Preview Imported Data
        </h3>
        <p className="text-sm text-secondary mt-1">
          {importedData.length} prompt{importedData.length !== 1 ? 's' : ''} found
        </p>
        <div className="mt-3 bg-accent/10 border border-accent/20 rounded-lg p-3">
          <p className="text-xs text-primary">
            <strong>Note:</strong> The following fields will be automatically added during import:
            ID, Created By (current user), Created At (current time), Updated By, Updated At
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Prompt</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Category</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Subcategory</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Image Req</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Trending</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Likes</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Saves</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Searches</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">Tags</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {importedData.map((prompt, index) => {
              const warnings = validateRowData(prompt);
              const hasWarnings = warnings.length > 0;
              
              return (
              <tr
                key={index}
                className={`transition-colors ${
                  index % 2 === 0
                    ? 'bg-white hover:bg-background/50'
                    : 'bg-background hover:bg-background-200'
                }`}
              >
                <td className="px-6 py-4 text-sm text-primary">
                  <div className="max-w-xs truncate" title={prompt.title || prompt.Title}>
                    {prompt.title || prompt.Title}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-primary">
                  <div className="max-w-xs truncate" title={prompt.prompt || prompt.Prompt}>
                    {(prompt.prompt || prompt.Prompt || '').length > 50 
                      ? `${(prompt.prompt || prompt.Prompt || '').substring(0, 50)}...` 
                      : (prompt.prompt || prompt.Prompt)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-primary">
                  <div className="flex items-center gap-2">
                    <span>{prompt.category || prompt.Category}</span>
                    {warnings.includes('category') && (
                      <div className="relative group">
                        <Icons.alert size={16} className="text-red-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Category not found in database
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-primary">
                  <div className="flex items-center gap-2">
                    <span>{prompt.subcategory || prompt.Subcategory}</span>
                    {warnings.includes('subcategory') && (
                      <div className="relative group">
                        <Icons.alert size={16} className="text-red-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Subcategory not found
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-primary">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
                      {formatImageRequirement(prompt.imageRequirement || prompt['Image Requirement'] || 0)}
                    </span>
                    {warnings.includes('imageRequirement') && (
                      <div className="relative group">
                        <Icons.alert size={16} className="text-red-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Invalid value (must be -1 to 4)
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-primary">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      (prompt.isTrending || prompt['Is Trending']) === 'Yes'
                        ? 'bg-accent/20 text-accent'
                        : 'bg-secondary/20 text-secondary'
                    }`}>
                      {prompt.isTrending || prompt['Is Trending']}
                    </span>
                    {warnings.includes('trending') && (
                      <div className="relative group">
                        <Icons.alert size={16} className="text-red-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Must be "Yes" or "No"
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-primary">
                  <div className="flex items-center gap-2">
                    <span>{prompt.likesCount || prompt['Likes Count'] || 0}</span>
                    {warnings.includes('likesCount') && (
                      <div className="relative group">
                        <Icons.alert size={16} className="text-red-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Cannot be negative
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-primary">
                  <div className="flex items-center gap-2">
                    <span>{prompt.savesCount || prompt['Saves Count'] || 0}</span>
                    {warnings.includes('savesCount') && (
                      <div className="relative group">
                        <Icons.alert size={16} className="text-red-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Cannot be negative
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-primary">
                  <div className="flex items-center gap-2">
                    <span>{prompt.searchCount || prompt['Search Count'] || 0}</span>
                    {warnings.includes('searchCount') && (
                      <div className="relative group">
                        <Icons.alert size={16} className="text-red-500 cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          Cannot be negative
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-primary">
                  <div className="max-w-xs truncate" title={prompt.tags || prompt.Tags}>
                    {prompt.tags || prompt.Tags}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {hasWarnings && (
                      <div className="relative group">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/20">
                          <Icons.alert size={16} className="text-red-500 cursor-help" />
                          <span className="text-xs font-medium text-secondary">{warnings.length}</span>
                        </div>
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {warnings.length} issue{warnings.length > 1 ? 's' : ''} found
                          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-primary"></div>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => onEdit(index)}
                      className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer"
                      title="Edit"
                    >
                      <Icons.edit size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
