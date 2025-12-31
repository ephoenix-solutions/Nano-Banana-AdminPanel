import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCategoryById,
  updateCategory,
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '@/lib/services/category.service';
import { UpdateCategoryInput } from '@/lib/types/category.types';
import { useAuth } from '@/lib/hooks/useAuth';

interface SubcategoryFormData {
  id?: string; // Existing subcategories have IDs
  name: string;
  order: number;
  isNew?: boolean; // Flag to identify new subcategories
  isDeleted?: boolean; // Flag to identify deleted subcategories
}

interface FormData {
  name: string;
  iconImage: string;
  order: number;
  searchCount: string | number;
  subcategories: SubcategoryFormData[];
}

interface UseEditCategoryFormReturn {
  loading: boolean;
  saving: boolean;
  error: string | null;
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubcategoryChange: (index: number, field: string, value: string) => void;
  addSubcategory: () => void;
  removeSubcategory: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useEditCategoryForm(categoryId: string): UseEditCategoryFormReturn {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalSubcategories, setOriginalSubcategories] = useState<SubcategoryFormData[]>([]); // Store original subcategories
  const [originalCategoryData, setOriginalCategoryData] = useState<FormData | null>(null); // Store original category data
  const [formData, setFormData] = useState<FormData>({
    name: '',
    iconImage: '',
    order: 0,
    searchCount: '0',
    subcategories: [],
  });

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const category = await getCategoryById(categoryId);
      if (category) {
        // Fetch subcategories
        const subcategories = await getSubcategories(categoryId);
        
        const subcategoriesData = subcategories.map(sub => ({
          id: sub.id,
          name: sub.name,
          order: sub.order,
          isNew: false,
        }));
        
        // Store original subcategories for comparison
        setOriginalSubcategories(subcategoriesData);
        
        const categoryData = {
          name: category.name,
          iconImage: category.iconImage,
          order: category.order,
          searchCount: category.searchCount,
          subcategories: subcategoriesData,
        };
        
        // Store original category data for comparison
        setOriginalCategoryData(categoryData);
        setFormData(categoryData);
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
      subcategories: [
        ...prev.subcategories,
        { name: '', order: prev.subcategories.length, isNew: true },
      ],
    }));
  };

  const removeSubcategory = (index: number) => {
    setFormData((prev) => {
      const subcategory = prev.subcategories[index];
      
      // If it's a new subcategory (not saved yet), just remove it
      if (subcategory.isNew) {
        return {
          ...prev,
          subcategories: prev.subcategories.filter((_, i) => i !== index),
        };
      }
      
      // If it's an existing subcategory, mark it as deleted
      const newSubcategories = [...prev.subcategories];
      newSubcategories[index] = { ...subcategory, isDeleted: true };
      return { ...prev, subcategories: newSubcategories };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name?.trim()) {
        throw new Error('Category name is required');
      }

      if (!formData.iconImage?.trim()) {
        throw new Error('Icon Image URL is required');
      }

      // Validate subcategories - at least one non-deleted is required
      const activeSubcategories = formData.subcategories.filter(sub => !sub.isDeleted);
      if (activeSubcategories.length === 0) {
        throw new Error('At least one subcategory is required');
      }

      // Validate that all active subcategories have names
      const hasEmptySubcategory = activeSubcategories.some(sub => !sub.name.trim());
      if (hasEmptySubcategory) {
        throw new Error('All subcategories must have a name');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Check if category data changed
      const categoryChanged = originalCategoryData && (
        originalCategoryData.name !== formData.name ||
        originalCategoryData.iconImage !== formData.iconImage ||
        originalCategoryData.order !== formData.order ||
        originalCategoryData.searchCount !== formData.searchCount
      );

      // Update category only if it changed
      if (categoryChanged) {
        const updateData: UpdateCategoryInput = {
          name: formData.name,
          iconImage: formData.iconImage,
          order: formData.order,
          searchCount: formData.searchCount,
          updatedBy: user.id,
        };
        await updateCategory(categoryId, updateData);
      }

      // Handle subcategories - only process if there are changes
      const subcategoryPromises = formData.subcategories
        .map(async (sub) => {
          // Delete marked subcategories
          if (sub.isDeleted && sub.id) {
            return deleteSubcategory(categoryId, sub.id);
          }
          // Create new subcategories
          else if (sub.isNew) {
            return createSubcategory(categoryId, {
              name: sub.name,
              order: sub.order,
              searchCount: 0,
              createdBy: user.id,
            });
          }
          // Update existing subcategories only if they were modified
          else if (sub.id) {
            // Find original subcategory to check if it was modified
            const originalSub = originalSubcategories.find(s => s.id === sub.id);
            
            // Only update if name or order changed
            if (originalSub && (originalSub.name !== sub.name || originalSub.order !== sub.order)) {
              return updateSubcategory(categoryId, sub.id, {
                name: sub.name,
                order: sub.order,
                updatedBy: user.id,
              });
            }
          }
          return Promise.resolve();
        })
        .filter(promise => promise !== undefined);

      await Promise.all(subcategoryPromises);

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
    handleSubcategoryChange,
    addSubcategory,
    removeSubcategory,
    handleSubmit,
    handleCancel,
  };
}
