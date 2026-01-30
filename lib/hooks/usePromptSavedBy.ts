import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { Prompt } from '@/lib/types/prompt.types';
import { User } from '@/lib/types/user.types';
import { getPromptById, getPromptSavedByUsers } from '@/lib/services/prompt.service';
import { getUserById } from '@/lib/services/user.service';

interface UsePromptSavedByReturn {
  loading: boolean;
  error: string | null;
  prompt: Prompt | null;
  savedByUsers: Array<{ user: User; savedAt: Timestamp }>;
  loadingSaves: boolean;
  handleBack: () => void;
}

/**
 * Custom hook to fetch prompt and users who saved it
 */
export function usePromptSavedBy(promptId: string): UsePromptSavedByReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [savedByUsers, setSavedByUsers] = useState<Array<{ user: User; savedAt: Timestamp }>>([]);
  const [loadingSaves, setLoadingSaves] = useState(false);

  useEffect(() => {
    fetchData();
  }, [promptId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const promptData = await getPromptById(promptId);

      if (promptData) {
        setPrompt(promptData);
        
        // Fetch users who saved this prompt
        fetchSavedByUsers(promptId);
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

  const fetchSavedByUsers = async (promptId: string) => {
    try {
      setLoadingSaves(true);
      const saves = await getPromptSavedByUsers(promptId);
      
      const savesData = await Promise.all(
        saves.map(async (save) => {
          // Include deleted users by passing true
          const user = await getUserById(save.userId, true);
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

  const handleBack = () => {
    router.push(`/prompts/view/${promptId}`);
  };

  return {
    loading,
    error,
    prompt,
    savedByUsers,
    loadingSaves,
    handleBack,
  };
}
