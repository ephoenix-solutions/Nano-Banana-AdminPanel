import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';
import { getSubscriptionPlanById } from '@/lib/services/subscription-plan.service';
import { getUserById } from '@/lib/services/user.service';

interface UseSubscriptionPlanDetailsReturn {
  loading: boolean;
  error: string | null;
  plan: SubscriptionPlan | null;
  creatorName: string;
  creatorPhoto: string;
  updaterName: string;
  updaterPhoto: string;
  handleBack: () => void;
  handleEdit: () => void;
  formatTimestamp: (timestamp: any) => string;
}

export function useSubscriptionPlanDetails(planId: string): UseSubscriptionPlanDetailsReturn {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [creatorName, setCreatorName] = useState<string>('Loading...');
  const [creatorPhoto, setCreatorPhoto] = useState<string>('');
  const [updaterName, setUpdaterName] = useState<string>('Loading...');
  const [updaterPhoto, setUpdaterPhoto] = useState<string>('');

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const planData = await getSubscriptionPlanById(planId);
      if (planData) {
        setPlan(planData);
        
        // Fetch creator information
        if (planData.createdBy) {
          try {
            const creator = await getUserById(planData.createdBy);
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
        if (planData.updatedBy) {
          try {
            const updater = await getUserById(planData.updatedBy);
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
        setError('Subscription plan not found');
      }
    } catch (err) {
      console.error('Error fetching plan:', err);
      setError('Failed to load subscription plan');
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
    router.push('/subscription-plan');
  };

  const handleEdit = () => {
    router.push(`/subscription-plan/edit/${planId}`);
  };

  return {
    loading,
    error,
    plan,
    creatorName,
    creatorPhoto,
    updaterName,
    updaterPhoto,
    handleBack,
    handleEdit,
    formatTimestamp,
  };
}
