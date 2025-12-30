import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Prompt } from '@/lib/types/prompt.types';
import { Category } from '@/lib/types/category.types';
import { User } from '@/lib/types/user.types';
import { getPromptById, getPromptLikedByUsers, getPromptSavedByUsers } from '@/lib/services/prompt.service';
import { getAllCategories } from '@/lib/services/category.service';
import { getUserById, getUserInfo } from '@/lib/services/user.service';

interface UsePromptDetailsReturn {
  loading: boolean;
  error: string | null;
  prompt: Prompt | null;
  categories: Category[];
  creatorName: string;
  creatorPhoto: string;
  updaterName: string;
  updaterPhoto: string;
  likedByUsers: Array<{ user: User; likedAt: Timestamp }>;
  savedByUsers: Array<{ user: User; savedAt: Timestamp }>;
  loadingLikes: boolean;
  loadingSaves: boolean;
}

/**
 * Custom hook to fetch prompt details including likes and saves
 */
export function usePromptDetails(promptId: string): UsePromptDetailsReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creatorName, setCreatorName] = useState<string>('Loading...');
  const [creatorPhoto, setCreatorPhoto] = useState<string>('');
  const [updaterName, setUpdaterName] = useState<string>('Loading...');
  const [updaterPhoto, setUpdaterPhoto] = useState<string>('');
  const [likedByUsers, setLikedByUsers] = useState<Array<{ user: User; likedAt: Timestamp }>>([]);
  const [savedByUsers, setSavedByUsers] = useState<Array<{ user: User; savedAt: Timestamp }>>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [loadingSaves, setLoadingSaves] = useState(false);

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
        
        // Fetch likes and saves
        fetchLikedByUsers(promptId);
        fetchSavedByUsers(promptId);
        
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

  const fetchLikedByUsers = async (promptId: string) => {
    try {
      setLoadingLikes(true);
      const likes = await getPromptLikedByUsers(promptId);
      
      const likesData = await Promise.all(
        likes.map(async (like) => {
          const user = await getUserById(like.userId);
          if (user) {
            return {
              user,
              likedAt: like.likedAt,
            };
          }
          return null;
        })
      );
      
      setLikedByUsers(likesData.filter((item): item is { user: User; likedAt: Timestamp } => item !== null));
    } catch (err) {
      console.error('Error fetching likes:', err);
      setLikedByUsers([]);
    } finally {
      setLoadingLikes(false);
    }
  };

  const fetchSavedByUsers = async (promptId: string) => {
    try {
      setLoadingSaves(true);
      const saves = await getPromptSavedByUsers(promptId);
      
      const savesData = await Promise.all(
        saves.map(async (save) => {
          const user = await getUserById(save.userId);
          if (user) {
            return {
              user,
              savedAt: save.savedAt,
            };
          }
          return null;
        })
      );
      
      setSavedByUsers(savesData.filter((item): item is { user: User; savedAt: Timestamp } => item !== null));
    } catch (err) {
      console.error('Error fetching saves:', err);
      setSavedByUsers([]);
    } finally {
      setLoadingSaves(false);
    }
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
    likedByUsers,
    savedByUsers,
    loadingLikes,
    loadingSaves,
  };
}
