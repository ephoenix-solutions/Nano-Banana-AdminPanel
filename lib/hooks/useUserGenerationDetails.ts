import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserGeneration } from '@/lib/types/user-generation.types';
import { User } from '@/lib/types/user.types';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';
import { getUserGenerationById } from '@/lib/services/user-generation.service';
import { getUserById } from '@/lib/services/user.service';
import { getSubscriptionPlanById } from '@/lib/services/subscription-plan.service';

export function useUserGenerationDetails(generationId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generation, setGeneration] = useState<UserGeneration | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    fetchGenerationDetails();
  }, [generationId]);

  const fetchGenerationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch generation
      const generationData = await getUserGenerationById(generationId);
      if (!generationData) {
        setError('Generation not found');
        setLoading(false);
        return;
      }
      setGeneration(generationData);

      // Fetch user
      const userData = await getUserById(generationData.userId);
      setUser(userData);

      // Fetch plan if exists
      if (generationData.planId) {
        const planData = await getSubscriptionPlanById(generationData.planId);
        setPlan(planData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching generation details:', err);
      setError('Failed to load generation details');
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
      }).format(date).replace(/,/g, '');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleBack = () => {
    router.push('/user-generations');
  };

  return {
    loading,
    error,
    generation,
    user,
    plan,
    formatTimestamp,
    handleBack,
  };
}
