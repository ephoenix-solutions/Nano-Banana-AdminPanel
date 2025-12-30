import { useState, useEffect } from 'react';
import { Feedback } from '@/lib/types/feedback.types';
import { User } from '@/lib/types/user.types';
import { getFeedbackById } from '@/lib/services/feedback.service';
import { getUserById } from '@/lib/services/user.service';

interface UseFeedbackDetailsReturn {
  loading: boolean;
  error: string | null;
  feedback: Feedback | null;
  user: User | null;
}

/**
 * Custom hook to fetch feedback details
 */
export function useFeedbackDetails(feedbackId: string): UseFeedbackDetailsReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, [feedbackId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const feedbackData = await getFeedbackById(feedbackId);

      if (feedbackData) {
        setFeedback(feedbackData);
        
        // Fetch user data
        try {
          const userData = await getUserById(feedbackData.userId);
          if (userData) {
            setUser(userData);
          }
        } catch (err) {
          console.error('Error fetching user:', err);
        }
      } else {
        setError('Feedback not found');
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    feedback,
    user,
  };
}
