import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Country } from '@/lib/types/country.types';
import { Category } from '@/lib/types/category.types';
import { getCountryById } from '@/lib/services/country.service';
import { getAllCategories } from '@/lib/services/category.service';
import { getUserById } from '@/lib/services/user.service';

interface UseCountryDetailsReturn {
  loading: boolean;
  error: string | null;
  country: Country | null;
  categories: Category[];
  creatorName: string;
  creatorPhoto: string;
  updaterName: string;
  updaterPhoto: string;
  handleBack: () => void;
  handleEdit: () => void;
  getCategoryNames: (categoryIds: string[]) => string[];
  formatTimestamp: (timestamp: any) => string;
}

export function useCountryDetails(countryId: string): UseCountryDetailsReturn {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creatorName, setCreatorName] = useState<string>('Loading...');
  const [creatorPhoto, setCreatorPhoto] = useState<string>('');
  const [updaterName, setUpdaterName] = useState<string>('Loading...');
  const [updaterPhoto, setUpdaterPhoto] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [countryId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [countryData, categoriesData] = await Promise.all([
        getCountryById(countryId),
        getAllCategories(),
      ]);

      setCategories(categoriesData);

      if (countryData) {
        setCountry(countryData);
        
        // Fetch creator information
        if (countryData.createdBy) {
          try {
            const creator = await getUserById(countryData.createdBy);
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
        if (countryData.updatedBy) {
          try {
            const updater = await getUserById(countryData.updatedBy);
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
        setError('Country not found');
      }
    } catch (err) {
      console.error('Error fetching country:', err);
      setError('Failed to load country');
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

  const getCategoryNames = (categoryIds: string[]) => {
    if (!categoryIds || categoryIds.length === 0) return [];
    
    return categoryIds
      .map((id) => {
        const category = categories.find((c) => c.id === id);
        return category?.name;
      })
      .filter(Boolean) as string[];
  };

  const handleBack = () => {
    router.push('/countries');
  };

  const handleEdit = () => {
    router.push(`/countries/edit/${countryId}`);
  };

  return {
    loading,
    error,
    country,
    categories,
    creatorName,
    creatorPhoto,
    updaterName,
    updaterPhoto,
    handleBack,
    handleEdit,
    getCategoryNames,
    formatTimestamp,
  };
}
