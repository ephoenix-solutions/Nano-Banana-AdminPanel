import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCategoryById,
  updateCategory,
} from '@/lib/services/category.service';
import { UpdateCategoryInput } from '@/lib/types/category.types';
import { useAuth } from '@/lib/hooks/useAuth';

interface FormData {
  name: string;
  iconImage: string;
  order: number;
  searchCount: string | number;
}

interface UseEditCategoryFormReturn {
  loading: boolean;
  saving: boolean;
  error: string | null;
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useEditCategoryForm(categoryId: string): UseEditCategoryFormReturn {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    iconImage: '',
    order: 0,
    searchCount: '0',
  });

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const category = await getCategoryById(categoryId);
      if (category) {
        setFormData({
          name: category.name,
          iconImage: category.iconImage,
          order: category.order,
          searchCount: category.searchCount,
        });
      } else {
        setError('Category not found');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.name?.trim()) {
        throw new Error('Category name is required');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const updateData: UpdateCategoryInput = {
        name: formData.name,
        iconImage: formData.iconImage,
        order: formData.order,
        searchCount: formData.searchCount,
        updatedBy: user.id,
      };

      await updateCategory(categoryId, updateData);
      router.push('/categories');
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/categories');
  };

  return {
    loading,
    saving,
    error,
    formData,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
