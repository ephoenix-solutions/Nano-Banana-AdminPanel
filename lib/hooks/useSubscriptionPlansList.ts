import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';
import {
  getAllSubscriptionPlans,
  deleteSubscriptionPlan,
  togglePlanActive,
} from '@/lib/services/subscription-plan.service';
import { getUserById } from '@/lib/services/user.service';

interface UseSubscriptionPlansListReturn {
  // Data
  plans: SubscriptionPlan[];
  userNames: Record<string, string>;
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  handleAddPlan: () => void;
  handleView: (plan: SubscriptionPlan) => void;
  handleEdit: (plan: SubscriptionPlan) => void;
  handleDeleteClick: (plan: SubscriptionPlan) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleToggleActive: (planId: string, isActive: boolean) => Promise<void>;
  
  // Delete modal
  deleteModal: {
    isOpen: boolean;
    plan: SubscriptionPlan | null;
  };
  setDeleteModal: (modal: { isOpen: boolean; plan: SubscriptionPlan | null }) => void;
  
  // Utilities
  fetchUserName: (userId: string) => Promise<string>;
  formatTimestamp: (timestamp: any) => string | null;
}

export function useSubscriptionPlansList(): UseSubscriptionPlansListReturn {
  const router = useRouter();
  
  // Data states
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    plan: SubscriptionPlan | null;
  }>({
    isOpen: false,
    plan: null,
  });

  // Fetch initial data
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllSubscriptionPlans();
      setPlans(data);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserName = async (userId: string): Promise<string> => {
    if (!userId) {
      return 'Unknown';
    }

    // Check cache first
    if (userNames[userId]) {
      return userNames[userId];
    }

    try {
      const user = await getUserById(userId);
      const name = user?.name || 'Unknown Admin';
      
      // Update cache
      setUserNames(prev => ({ ...prev, [userId]: name }));
      
      return name;
    } catch (error) {
      console.error('Error fetching user:', error);
      return 'Unknown Admin';
    }
  };

  const formatTimestamp = (timestamp: any): string | null => {
    if (!timestamp) return null;
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
      return null;
    }
  };

  // Navigation handlers
  const handleAddPlan = () => {
    router.push('/subscription-plan/add');
  };

  const handleView = (plan: SubscriptionPlan) => {
    router.push(`/subscription-plan/view/${plan.id}`);
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    router.push(`/subscription-plan/edit/${plan.id}`);
  };

  const handleDeleteClick = (plan: SubscriptionPlan) => {
    setDeleteModal({
      isOpen: true,
      plan,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.plan) return;

    try {
      await deleteSubscriptionPlan(deleteModal.plan.id);
      setDeleteModal({ isOpen: false, plan: null });
      await fetchPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError('Failed to delete subscription plan');
    }
  };

  const handleToggleActive = async (planId: string, isActive: boolean) => {
    try {
      await togglePlanActive(planId, !isActive);
      await fetchPlans();
    } catch (err) {
      console.error('Error toggling active status:', err);
      setError('Failed to update plan status');
    }
  };

  return {
    // Data
    plans,
    userNames,
    
    // Loading states
    loading,
    error,
    
    // CRUD operations
    handleAddPlan,
    handleView,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleToggleActive,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    fetchUserName,
    formatTimestamp,
  };
}
