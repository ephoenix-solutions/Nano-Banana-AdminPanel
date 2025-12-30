import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCountry } from '@/lib/services/country.service';
import { getAllCategories } from '@/lib/services/category.service';
import { CreateCountryInput } from '@/lib/types/country.types';
import { Category } from '@/lib/types/category.types';
import { useAuth } from '@/lib/hooks/useAuth';

interface FormData {
  name: string;
  isoCode: string;
  categories: string[];
}

interface UseAddCountryFormReturn {
  loading: boolean;
  loadingCategories: boolean;
  error: string | null;
  categories: Category[];
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCategoryToggle: (categoryId: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useAddCountryForm(): UseAddCountryFormReturn {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    isoCode: '',
    categories: [],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'isoCode' ? value.toUpperCase() : value,
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => {
      const currentCategories = prev.categories || [];
      const isSelected = currentCategories.includes(categoryId);
      
      return {
        ...prev,
        categories: isSelected
          ? currentCategories.filter((id) => id !== categoryId)
          : [...currentCategories, categoryId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('Country name is required');
      }
      if (!formData.isoCode.trim()) {
        throw new Error('ISO code is required');
      }
      if (formData.isoCode.length !== 2) {
        throw new Error('ISO code must be exactly 2 characters');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await createCountry({
        ...formData,
        createdBy: user.id,
      });
      router.push('/countries');
    } catch (err: any) {
      console.error('Error creating country:', err);
      setError(err.message || 'Failed to create country');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/countries');
  };

  return {
    loading,
    loadingCategories,
    error,
    categories,
    formData,
    handleChange,
    handleCategoryToggle,
    handleSubmit,
    handleCancel,
  };
}
