import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/lib/types/category.types';
import { CreatePromptInput } from '@/lib/types/prompt.types';
import { getAllCategories } from '@/lib/services/category.service';
import { createPrompt } from '@/lib/services/prompt.service';
import { useAuth } from '@/lib/hooks/useAuth';

interface ImportedPrompt {
  title?: string;
  Title?: string;
  prompt?: string;
  Prompt?: string;
  category?: string;
  Category?: string;
  categoryId?: string;
  subcategory?: string;
  Subcategory?: string;
  subcategoryId?: string;
  imageRequirement?: number | string;
  'Image Requirement'?: number | string;
  isTrending?: string;
  'Is Trending'?: string;
  likesCount?: number | string;
  'Likes Count'?: number | string;
  savesCount?: number | string;
  'Saves Count'?: number | string;
  searchCount?: number | string;
  'Search Count'?: number | string;
  tags?: string;
  Tags?: string;
  imageUrl?: string;
  'Image URL'?: string;
  [key: string]: any;
}

export function useImportPrompts() {
  const router = useRouter();
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<ImportedPrompt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    index: number | null;
    data: ImportedPrompt | null;
  }>({
    isOpen: false,
    index: null,
    data: null,
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      console.log('✅ Categories loaded:', data.length, 'categories');
      setCategories(data);
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
    }
  };

  const handleBack = () => {
    router.push('/prompts');
  };

  const handleDownloadSample = () => {
    const sampleCSV = `Title,Prompt,Category,Subcategory,Image Requirement,Is Trending,Likes Count,Saves Count,Search Count,Tags,Image URL
Sample Prompt Title,This is a sample prompt text,Category Name,Subcategory Name,0,No,0,0,0,"tag1, tag2",https://example.com/image.jpg
Another Prompt,Another prompt text,Category Name,Subcategory Name,-1,Yes,10,5,15,"tag3, tag4",https://example.com/image2.jpg
Required Image Prompt,Prompt requiring 2 images,Category Name,Subcategory Name,2,No,5,3,8,"tag5",https://example.com/image3.jpg`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prompts_import_sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      parseCSV(droppedFile);
    } else {
      setError('Please upload a valid CSV file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      setError('Please upload a valid CSV file');
    }
  };

  const parseCSV = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const data: ImportedPrompt[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        
        if (values.length !== headers.length) {
          console.warn(`Skipping line ${i + 1}: column count mismatch`);
          continue;
        }

        const prompt: any = {};
        headers.forEach((header, index) => {
          prompt[header] = values[index];
        });

        data.push(prompt as ImportedPrompt);
      }

      setImportedData(data);
    } catch (err: any) {
      console.error('Error parsing CSV:', err);
      setError(err.message || 'Failed to parse CSV file');
    } finally {
      setLoading(false);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImportedData([]);
    setError(null);
  };

  const formatImageRequirement = (value: number | string): string => {
    const numValue = typeof value === 'string' ? parseInt(value) : value;
    
    if (numValue === -1) return 'None';
    if (numValue === 0) return 'Optional';
    if (numValue >= 1) return `${numValue} Req`;
    return 'Unknown';
  };

  const handleEditClick = (index: number) => {
    const data = { ...importedData[index] };
    
    // Validate and find matching category
    const categoryName = data.category || data.Category;
    const matchingCategory = categories.find(c => 
      c.name.toLowerCase() === categoryName?.toLowerCase() || c.id === categoryName
    );
    
    // If category found, set categoryId
    if (matchingCategory) {
      data.categoryId = matchingCategory.id;
      data.category = matchingCategory.name;
      
      // Validate and find matching subcategory
      const subcategoryName = data.subcategory || data.Subcategory;
      const matchingSubcategory = matchingCategory.subcategories?.find(s => 
        s.name.toLowerCase() === subcategoryName?.toLowerCase() || s.id === subcategoryName
      );
      
      if (matchingSubcategory) {
        data.subcategoryId = matchingSubcategory.id;
        data.subcategory = matchingSubcategory.name;
      }
    }
    
    setEditModal({
      isOpen: true,
      index,
      data,
    });
    setTagInput('');
    validateData(data);
  };

  const handleEditSave = () => {
    if (editModal.index !== null && editModal.data) {
      const isValid = validateData(editModal.data);
      if (!isValid) {
        return;
      }
      
      const updatedData = [...importedData];
      updatedData[editModal.index] = editModal.data;
      setImportedData(updatedData);
      setEditModal({ isOpen: false, index: null, data: null });
      setValidationErrors({});
    }
  };

  const handleEditCancel = () => {
    setEditModal({ isOpen: false, index: null, data: null });
    setTagInput('');
    setValidationErrors({});
  };

  const validateData = (data: ImportedPrompt) => {
    const errors: Record<string, string> = {};
    
    if (!data.title && !data.Title) {
      errors.title = 'Title is required';
    }
    
    if (!data.prompt && !data.Prompt) {
      errors.prompt = 'Prompt text is required';
    }
    
    // Validate category - only check if categoryId is set
    if (!data.categoryId) {
      errors.category = 'Category is required';
    }
    
    // Validate subcategory - only check if subcategoryId is set
    if (!data.subcategoryId) {
      errors.subcategory = 'Subcategory is required';
    }
    
    // Validate image URL
    const imageUrl = data.imageUrl || data['Image URL'];
    if (!imageUrl) {
      errors.imageUrl = 'Image URL is required';
    } else if (imageUrl && !isValidUrl(imageUrl)) {
      errors.imageUrl = 'Invalid URL format';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleEditChange = (field: string, value: any) => {
    if (editModal.data) {
      const updatedData = {
        ...editModal.data,
        [field]: value,
      };
      setEditModal({
        ...editModal,
        data: updatedData,
      });
      validateData(updatedData);
    }
  };

  const handleBatchEditChange = (updates: Record<string, any>) => {
    if (editModal.data) {
      console.log('📦 Batch updating fields:', Object.keys(updates));
      const updatedData = {
        ...editModal.data,
        ...updates,
      };
      setEditModal({
        ...editModal,
        data: updatedData,
      });
      validateData(updatedData);
    }
  };

  const validateRowData = (prompt: ImportedPrompt): string[] => {
    const warnings: string[] = [];
    
    // Check if category exists
    const categoryName = prompt.category || prompt.Category;
    if (categoryName) {
      const matchingCategory = categories.find(c => 
        c.name.toLowerCase() === categoryName.toLowerCase() || c.id === categoryName
      );
      if (!matchingCategory) {
        warnings.push('category');
      }
    }
    
    // Check if subcategory exists
    const subcategoryName = prompt.subcategory || prompt.Subcategory;
    if (subcategoryName && categoryName) {
      const category = categories.find(c => 
        c.name.toLowerCase() === categoryName.toLowerCase() || c.id === categoryName
      );
      const matchingSubcategory = category?.subcategories?.find(s => 
        s.name.toLowerCase() === subcategoryName.toLowerCase() || s.id === subcategoryName
      );
      if (!matchingSubcategory) {
        warnings.push('subcategory');
      }
    }
    
    // Check trending value
    const trending = prompt.isTrending || prompt['Is Trending'];
    if (!trending || (trending !== 'Yes' && trending !== 'No')) {
      warnings.push('trending');
    }
    
    // Check image requirement
    const imageReq = prompt.imageRequirement || prompt['Image Requirement'];
    const imageReqNum = typeof imageReq === 'string' ? parseInt(imageReq) : imageReq;
    if (imageReqNum !== undefined && (imageReqNum < -1 || imageReqNum > 4)) {
      warnings.push('imageRequirement');
    }
    
    // Check counts (should not be negative)
    const likesCount = prompt.likesCount || prompt['Likes Count'] || 0;
    const savesCount = prompt.savesCount || prompt['Saves Count'] || 0;
    const searchCount = prompt.searchCount || prompt['Search Count'] || 0;
    
    if (Number(likesCount) < 0) warnings.push('likesCount');
    if (Number(savesCount) < 0) warnings.push('savesCount');
    if (Number(searchCount) < 0) warnings.push('searchCount');
    
    return warnings;
  };

  const getSubcategories = () => {
    if (!editModal.data) return [];
    const categoryId = editModal.data.categoryId;
    const category = categories.find(c => c.id === categoryId);
    return category?.subcategories || [];
  };

  const handleAddTag = () => {
    if (!tagInput.trim() || !editModal.data) return;
    
    const currentTags = editModal.data.tags || editModal.data.Tags || '';
    const tagsArray = currentTags ? currentTags.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    if (!tagsArray.includes(tagInput.trim())) {
      tagsArray.push(tagInput.trim());
      handleEditChange('tags', tagsArray.join(', '));
      handleEditChange('Tags', tagsArray.join(', '));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!editModal.data) return;
    
    const currentTags = editModal.data.tags || editModal.data.Tags || '';
    const tagsArray = currentTags.split(',').map(t => t.trim()).filter(Boolean);
    const updatedTags = tagsArray.filter(tag => tag !== tagToRemove);
    
    handleEditChange('tags', updatedTags.join(', '));
    handleEditChange('Tags', updatedTags.join(', '));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Check if all data is valid for import
  const canImport = () => {
    if (importedData.length === 0) return false;
    
    // Check if any row has warnings
    for (const prompt of importedData) {
      const warnings = validateRowData(prompt);
      if (warnings.length > 0) return false;
    }
    
    return true;
  };

  const handleConfirmImport = async () => {
    if (!canImport()) return;
    if (!user?.id) {
      setError('You must be logged in to import prompts');
      return;
    }
    
    setIsImporting(true);
    setError(null);
    
    try {
      console.log('🚀 Starting import of', importedData.length, 'prompts');
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      // Import each prompt
      for (let i = 0; i < importedData.length; i++) {
        const prompt = importedData[i];
        
        try {
          // Transform imported data to CreatePromptInput
          const promptInput: CreatePromptInput = {
            title: prompt.title || prompt.Title || '',
            categoryId: prompt.categoryId || '',
            subCategoryId: prompt.subcategoryId || '',
            prompt: prompt.prompt || prompt.Prompt || '',
            url: prompt.imageUrl || prompt['Image URL'] || '',
            imageRequirement: (() => {
                    const rawValue = prompt.imageRequirement ?? prompt['Image Requirement'];
                    if (rawValue === undefined || rawValue === null || rawValue === '') return 0;
                    const parsed = typeof rawValue === 'number' ? rawValue : parseInt(String(rawValue));
                    return isNaN(parsed) ? 0 : parsed;
                  })(),
              tags: (prompt.tags || prompt.Tags || '')
              .split(',')
              .map(t => t.trim())
              .filter(Boolean),
            isTrending: (prompt.isTrending || prompt['Is Trending']) === 'Yes',
            likesCount: parseInt(String(prompt.likesCount || prompt['Likes Count'] || 0)),
            savesCount: parseInt(String(prompt.savesCount || prompt['Saves Count'] || 0)),
            searchCount: parseInt(String(prompt.searchCount || prompt['Search Count'] || 0)),
            createdBy: user.id,
          };
          
          // Create prompt in Firestore
          const promptId = await createPrompt(promptInput);
          console.log(`✅ Imported prompt ${i + 1}/${importedData.length}:`, promptId);
          successCount++;
        } catch (err: any) {
          console.error(`❌ Error importing prompt ${i + 1}:`, err);
          errorCount++;
          errors.push(`Row ${i + 1}: ${err.message}`);
        }
      }
      
      console.log(`✅ Import complete: ${successCount} success, ${errorCount} errors`);
      
      if (errorCount > 0) {
        setError(`Imported ${successCount} prompts with ${errorCount} errors: ${errors.join(', ')}`);
      }
      
      // Navigate back to prompts page after successful import
      if (successCount > 0) {
        // Keep loading state active until navigation completes
        setTimeout(() => {
          router.push('/prompts');
          // Loading state will remain active until component unmounts
        }, 2000);
      } else {
        // No successful imports, stop loading
        setIsImporting(false);
      }
    } catch (err: any) {
      console.error('❌ Error during import:', err);
      setError(err.message || 'Failed to import prompts');
      setIsImporting(false);
    }
  };

  return {
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
  };
}
