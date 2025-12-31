import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, createSubcategory } from '@/lib/services/category.service';
import { CreateCategoryInput, CreateSubcategoryInput } from '@/lib/types/category.types';
import { useAuth } from '@/lib/hooks/useAuth';

interface SubcategoryFormData {
  name: string;
  order: number;
}

interface FormData {
  name: string;
  iconImage: string;
  order: number;
  searchCount: string | number;
  subcategories: SubcategoryFormData[];
}

interface UseAddCategoryFormReturn {
  loading: boolean;
  error: string | null;
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubcategoryChange: (index: number, field: string, value: string) => void;
  addSubcategory: () => void;
  removeSubcategory: (index: number) => void;
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
    subcategories: [{ name: '', order: 0 }], // Start with one empty subcategory
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

  const handleSubcategoryChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newSubcategories = [...prev.subcategories];
      newSubcategories[index] = {
        ...newSubcategories[index],
        [field]: field === 'order' ? parseInt(value) || 0 : value,
      };
      return { ...prev, subcategories: newSubcategories };
    });
  };

  const addSubcategory = () => {
    setFormData((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, { name: '', order: prev.subcategories.length }],
    }));
  };

  const removeSubcategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Category name is required');
      }

      if (!formData.iconImage.trim()) {
        throw new Error('Icon Image URL is required');
      }

      // Validate subcategories - at least one is required
      if (formData.subcategories.length === 0) {
        throw new Error('At least one subcategory is required');
      }

      // Validate that all subcategories have names
      const hasEmptySubcategory = formData.subcategories.some(sub => !sub.name.trim());
      if (hasEmptySubcategory) {
        throw new Error('All subcategories must have a name');
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

      // Create category first
      const categoryId = await createCategory(categoryData);

      // Then create all subcategories
      await Promise.all(
        formData.subcategories.map((sub) =>
          createSubcategory(categoryId, {
            name: sub.name,
            order: sub.order,
            searchCount: 0,
            createdBy: user.id,
          })
        )
      );

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
    handleSubcategoryChange,
    addSubcategory,
    removeSubcategory,
    handleSubmit,
    handleCancel,
  };
}
