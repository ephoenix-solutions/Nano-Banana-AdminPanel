import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory } from '@/lib/services/category.service';
import { CreateCategoryInput } from '@/lib/types/category.types';
import { useAuth } from '@/lib/hooks/useAuth';

interface FormData {
  name: string;
  iconImage: string;
  order: number;
  searchCount: string | number;
}

interface UseAddCategoryFormReturn {
  loading: boolean;
  error: string | null;
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useAddCategoryForm(): UseAddCategoryFormReturn {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    iconImage: '',
    order: 0,
    searchCount: '0',
  });

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
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('Category name is required');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const categoryData: CreateCategoryInput = {
        name: formData.name,
        iconImage: formData.iconImage,
        order: formData.order,
        searchCount: formData.searchCount,
        createdBy: user.id,
      };

      await createCategory(categoryData);
      router.push('/categories');
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/categories');
  };

  return {
    loading,
    error,
    formData,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
