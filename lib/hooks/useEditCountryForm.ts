import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCountryById,
  updateCountry,
} from '@/lib/services/country.service';
import { getAllCategories } from '@/lib/services/category.service';
import { UpdateCountryInput } from '@/lib/types/country.types';
import { Category } from '@/lib/types/category.types';
import { useAuth } from '@/lib/hooks/useAuth';

interface FormData {
  name: string;
  isoCode: string;
  categories: string[];
}

interface UseEditCountryFormReturn {
  loading: boolean;
  saving: boolean;
  error: string | null;
  categories: Category[];
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCategoryToggle: (categoryId: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useEditCountryForm(countryId: string): UseEditCountryFormReturn {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    isoCode: '',
    categories: [],
  });

  useEffect(() => {
    fetchData();
  }, [countryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [country, categoriesData] = await Promise.all([
        getCountryById(countryId),
        getAllCategories(),
      ]);
      
      setCategories(categoriesData);
      
      if (country) {
        setFormData({
          name: country.name,
          isoCode: country.isoCode,
          categories: country.categories || [],
        });
      } else {
        setError('Country not found');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
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
    setSaving(true);
    setError(null);

    try {
      if (!formData.name || !formData.name.trim()) {
        throw new Error('Country name is required');
      }
      if (!formData.isoCode || !formData.isoCode.trim()) {
        throw new Error('ISO code is required');
      }
      if (formData.isoCode.length !== 2) {
        throw new Error('ISO code must be exactly 2 characters');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await updateCountry(countryId, {
        ...formData,
        updatedBy: user.id,
      });
      router.push('/countries');
    } catch (err: any) {
      console.error('Error updating country:', err);
      setError(err.message || 'Failed to update country');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/countries');
  };

  return {
    loading,
    saving,
    error,
    categories,
    formData,
    handleChange,
    handleCategoryToggle,
    handleSubmit,
    handleCancel,
  };
}
