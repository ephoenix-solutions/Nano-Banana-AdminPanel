import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreatePromptInput } from '@/lib/types/prompt.types';
import { Category, Subcategory } from '@/lib/types/category.types';
import { createPrompt } from '@/lib/services/prompt.service';
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

interface UseAddPromptFormReturn {
  loading: boolean;
  loadingCategories: boolean;
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

export function useAddPromptForm(): UseAddPromptFormReturn {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
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
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      const category = categories.find((c) => c.id === formData.categoryId);
      setSubcategories(category?.subcategories || []);
      setFormData((prev) => ({ ...prev, subCategoryId: '' }));
    } else {
      setSubcategories([]);
    }
  }, [formData.categoryId, categories]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
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
    setLoading(true);
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

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const userId = user.id; // Type narrowing

      // Prepare data for API - convert empty strings to undefined for optional fields
      const promptData: CreatePromptInput = {
        title: formData.title,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        prompt: formData.prompt,
        url: formData.url || undefined,
        imageRequirement: formData.imageRequirement,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        isTrending: formData.isTrending,
        likesCount: formData.likesCount,
        savesCount: formData.savesCount,
        searchCount: formData.searchCount,
        createdBy: userId,
      };

      await createPrompt(promptData);
      router.push('/prompts');
    } catch (err: any) {
      console.error('Error creating prompt:', err);
      setError(err.message || 'Failed to create prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/prompts');
  };

  return {
    loading,
    loadingCategories,
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
