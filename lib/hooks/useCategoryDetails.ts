import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import { getCategoryById } from '@/lib/services/category.service';
import { getUserById } from '@/lib/services/user.service';

interface UseCategoryDetailsReturn {
  loading: boolean;
  error: string | null;
  category: Category | null;
  creatorName: string;
  creatorPhoto: string;
  updaterName: string;
  updaterPhoto: string;
  handleBack: () => void;
  handleEdit: () => void;
  handleAddSubcategory: () => void;
  handleEditSubcategory: (subcategoryId: string) => void;
  formatTimestamp: (timestamp: any) => string;
}

export function useCategoryDetails(categoryId: string): UseCategoryDetailsReturn {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [creatorName, setCreatorName] = useState<string>('Loading...');
  const [creatorPhoto, setCreatorPhoto] = useState<string>('');
  const [updaterName, setUpdaterName] = useState<string>('Loading...');
  const [updaterPhoto, setUpdaterPhoto] = useState<string>('');

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const categoryData = await getCategoryById(categoryId);
      if (categoryData) {
        setCategory(categoryData);
        
        // Fetch creator information
        if (categoryData.createdBy) {
          try {
            const creator = await getUserById(categoryData.createdBy);
            if (creator) {
              setCreatorName(creator.name || 'Unknown Admin');
              setCreatorPhoto(creator.photoURL || '');
            } else {
              setCreatorName('Unknown Admin');
            }
          } catch (err) {
            console.error('Error fetching creator:', err);
            setCreatorName('Unknown Admin');
          }
        } else {
          setCreatorName('Unknown');
        }
        
        // Fetch updater information
        if (categoryData.updatedBy) {
          try {
            const updater = await getUserById(categoryData.updatedBy);
            if (updater) {
              setUpdaterName(updater.name || 'Unknown Admin');
              setUpdaterPhoto(updater.photoURL || '');
            } else {
              setUpdaterName('Unknown Admin');
            }
          } catch (err) {
            console.error('Error fetching updater:', err);
            setUpdaterName('Unknown Admin');
          }
        }
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

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      return 'N/A';
    }
  };

  const handleBack = () => {
    router.push('/categories');
  };

  const handleEdit = () => {
    router.push(`/categories/edit/${categoryId}`);
  };

  const handleAddSubcategory = () => {
    router.push(`/categories/${categoryId}/subcategories/add`);
  };

  const handleEditSubcategory = (subcategoryId: string) => {
    router.push(`/categories/${categoryId}/subcategories/edit/${subcategoryId}`);
  };

  return {
    loading,
    error,
    category,
    creatorName,
    creatorPhoto,
    updaterName,
    updaterPhoto,
    handleBack,
    handleEdit,
    handleAddSubcategory,
    handleEditSubcategory,
    formatTimestamp,
  };
}
