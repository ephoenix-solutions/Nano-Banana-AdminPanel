import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Prompt } from '@/lib/types/prompt.types';
import { Category } from '@/lib/types/category.types';
import { getPromptById } from '@/lib/services/prompt.service';
import { getAllCategories } from '@/lib/services/category.service';
import { getUserInfo } from '@/lib/services/user.service';

interface UsePromptDetailsReturn {
  loading: boolean;
  error: string | null;
  prompt: Prompt | null;
  categories: Category[];
  creatorName: string;
  creatorPhoto: string;
  updaterName: string;
  updaterPhoto: string;
  handleLikedBy: () => void;
  handleSavedBy: () => void;
}

/**
 * Custom hook to fetch prompt details (without likes and saves)
 */
export function usePromptDetails(promptId: string, router: any): UsePromptDetailsReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creatorName, setCreatorName] = useState<string>('Loading...');
  const [creatorPhoto, setCreatorPhoto] = useState<string>('');
  const [updaterName, setUpdaterName] = useState<string>('Loading...');
  const [updaterPhoto, setUpdaterPhoto] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [promptId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promptData, categoriesData] = await Promise.all([
        getPromptById(promptId),
        getAllCategories(),
      ]);

      setCategories(categoriesData);

      if (promptData) {
        setPrompt(promptData);
        
        // Fetch creator information
        if (promptData.createdBy) {
          const creatorInfo = await getUserInfo(promptData.createdBy);
          if (creatorInfo) {
            setCreatorName(creatorInfo.name || 'Unknown Admin');
            setCreatorPhoto(creatorInfo.photoURL);
          } else {
            setCreatorName('Unknown Admin');
          }
        } else {
          setCreatorName('Unknown');
        }
        
        // Fetch updater information
        if (promptData.updatedBy) {
          const updaterInfo = await getUserInfo(promptData.updatedBy);
          if (updaterInfo) {
            setUpdaterName(updaterInfo.name || 'Unknown Admin');
            setUpdaterPhoto(updaterInfo.photoURL);
          } else {
            setUpdaterName('Unknown Admin');
          }
        }
      } else {
        setError('Prompt not found');
      }
    } catch (err) {
      console.error('Error fetching prompt:', err);
      setError('Failed to load prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleLikedBy = () => {
    router.push(`/prompts/view/${promptId}/liked-by`);
  };

  const handleSavedBy = () => {
    router.push(`/prompts/view/${promptId}/saved-by`);
  };

  return {
    loading,
    error,
    prompt,
    categories,
    creatorName,
    creatorPhoto,
    updaterName,
    updaterPhoto,
    handleLikedBy,
    handleSavedBy,
  };
}
