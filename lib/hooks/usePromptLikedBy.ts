import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { Prompt } from '@/lib/types/prompt.types';
import { User } from '@/lib/types/user.types';
import { getPromptById, getPromptLikedByUsers } from '@/lib/services/prompt.service';
import { getUserById } from '@/lib/services/user.service';

interface UsePromptLikedByReturn {
  loading: boolean;
  error: string | null;
  prompt: Prompt | null;
  likedByUsers: Array<{ user: User; likedAt: Timestamp }>;
  loadingLikes: boolean;
  handleBack: () => void;
}

/**
 * Custom hook to fetch prompt and users who liked it
 */
export function usePromptLikedBy(promptId: string): UsePromptLikedByReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [likedByUsers, setLikedByUsers] = useState<Array<{ user: User; likedAt: Timestamp }>>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  useEffect(() => {
    fetchData();
  }, [promptId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const promptData = await getPromptById(promptId);

      if (promptData) {
        setPrompt(promptData);
        
        // Fetch users who liked this prompt
        fetchLikedByUsers(promptId);
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
          // Include deleted users by passing true
          const user = await getUserById(like.userId, true);
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

  const handleBack = () => {
    router.push(`/prompts/view/${promptId}`);
  };

  return {
    loading,
    error,
    prompt,
    likedByUsers,
    loadingLikes,
    handleBack,
  };
}
