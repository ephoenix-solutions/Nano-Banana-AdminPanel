import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UpdatePromptInput } from '@/lib/types/prompt.types';
import { Category, Subcategory } from '@/lib/types/category.types';
import { getPromptById, updatePrompt } from '@/lib/services/prompt.service';
import { getAllCategories } from '@/lib/services/category.service';
import { useAuth } from '@/lib/hooks/useAuth';

interface FormData {
  title: string;
  categoryId: string;
  subCategoryId: string;
  prompt: string;
  url: string;
  imageRequirement: number;
  tags: string[];
  isTrending: boolean;
  likesCount: number;
  savesCount: number;
  searchCount: number;
}

interface UseEditPromptFormReturn {
  loading: boolean;
  saving: boolean;
  error: string | null;
  categories: Category[];
  subcategories: Subcategory[];
  formData: FormData;
  tagInput: string;
  setTagInput: (value: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleAddTag: () => void;
  handleRemoveTag: (tag: string) => void;
  handleTagInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useEditPromptForm(promptId: string): UseEditPromptFormReturn {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    categoryId: '',
    subCategoryId: '',
    prompt: '',
    url: '',
    imageRequirement: 0,
    tags: [],
    isTrending: false,
    likesCount: 0,
    savesCount: 0,
    searchCount: 0,
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchData();
  }, [promptId]);

  useEffect(() => {
    if (formData.categoryId) {
      const category = categories.find((c) => c.id === formData.categoryId);
      setSubcategories(category?.subcategories || []);
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId, categories]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prompt, categoriesData] = await Promise.all([
        getPromptById(promptId),
        getAllCategories(),
      ]);

      setCategories(categoriesData);

      if (prompt) {
        setFormData({
          title: prompt.title || '',
          categoryId: prompt.categoryId,
          subCategoryId: prompt.subCategoryId,
          prompt: prompt.prompt,
          url: prompt.url || '',
          imageRequirement: prompt.imageRequirement ?? 0,
          tags: prompt.tags || [],
          isTrending: prompt.isTrending,
          likesCount: prompt.likesCount,
          savesCount: prompt.savesCount,
          searchCount: prompt.searchCount,
        });
      } else {
        setError('Prompt not found');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'likesCount' || name === 'searchCount') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else if (name === 'imageRequirement') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.prompt.trim()) {
        throw new Error('Prompt text is required');
      }
      if (!formData.categoryId) {
        throw new Error('Category is required');
      }
      if (!formData.subCategoryId) {
        throw new Error('Subcategory is required');
      }
      if (!formData.url.trim()) {
        throw new Error('Image URL is required');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const userId = user.id; // Type narrowing

      // Handle file upload if a file was selected
      let finalUrl = formData.url;
      if (formData.url.startsWith('__FILE_SELECTED__')) {
        // Find the upload function in the DOM
        const uploadInput = document.querySelector('[data-folder="prompts"][data-upload-function="true"]') as any;
        if (uploadInput && uploadInput.uploadFile) {
          try {
            finalUrl = await uploadInput.uploadFile();
          } catch (uploadError) {
            throw new Error('Failed to upload image. Please try again.');
          }
        } else {
          throw new Error('Please select an image file');
        }
      }

      // Prepare data for API
      const promptData: UpdatePromptInput = {
        title: formData.title,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        prompt: formData.prompt,
        url: finalUrl,
        imageRequirement: formData.imageRequirement,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        isTrending: formData.isTrending,
        likesCount: formData.likesCount,
        savesCount: formData.savesCount,
        searchCount: formData.searchCount,
        updatedBy: userId,
      };

      await updatePrompt(promptId, promptData);
      router.push('/prompts');
    } catch (err: any) {
      console.error('Error updating prompt:', err);
      setError(err.message || 'Failed to update prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/prompts');
  };

  return {
    loading,
    saving,
    error,
    categories,
    subcategories,
    formData,
    tagInput,
    setTagInput,
    handleChange,
    handleAddTag,
    handleRemoveTag,
    handleTagInputKeyDown,
    handleSubmit,
    handleCancel,
  };
}
