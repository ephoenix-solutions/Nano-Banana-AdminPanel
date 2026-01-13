import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserSubscription } from '@/lib/types/user-subscription.types';
import { User } from '@/lib/types/user.types';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';
import {
  getAllUserSubscriptions,
  deleteUserSubscription,
  toggleSubscriptionActive,
} from '@/lib/services/user-subscription.service';
import { getAllUsers } from '@/lib/services/user.service';
import { getAllSubscriptionPlans } from '@/lib/services/subscription-plan.service';
import { Timestamp } from 'firebase/firestore';

export type SortField = 'user' | 'plan' | 'startDate' | 'endDate' | 'paymentMethod';
export type SortOrder = 'asc' | 'desc';
export type StatusFilter = 'all' | 'active' | 'inactive' | 'expired';
export type PaymentMethodFilter = 'all' | 'google' | 'apple';

interface UseUserSubscriptionsListReturn {
  // Data
  subscriptions: UserSubscription[];
  users: User[];
  plans: SubscriptionPlan[];
  filteredAndSortedSubscriptions: UserSubscription[];
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Filter states
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  planFilter: string;
  statusFilter: StatusFilter;
  paymentMethodFilter: PaymentMethodFilter;
  hasActiveFilters: boolean;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setPlanFilter: (filter: string) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setPaymentMethodFilter: (filter: PaymentMethodFilter) => void;
  handleSort: (field: SortField) => void;
  clearFilters: () => void;
  
  // CRUD operations
  handleDeleteClick: (subscription: UserSubscription) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleToggleActive: (subscriptionId: string, isActive: boolean) => Promise<void>;
  
  // Delete modal
  deleteModal: {
    isOpen: boolean;
    subscription: UserSubscription | null;
  };
  setDeleteModal: (modal: { isOpen: boolean; subscription: UserSubscription | null }) => void;
  
  // Utilities
  getUserName: (userId: string) => string;
  getPlanName: (planId: string) => string;
  formatTimestamp: (timestamp: Timestamp) => string;
  isExpired: (endDate: Timestamp) => boolean;
}

export function useUserSubscriptionsList(): UseUserSubscriptionsListReturn {
  const router = useRouter();
  
  // Data states
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethodFilter>('all');
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    subscription: UserSubscription | null;
  }>({
    isOpen: false,
    subscription: null,
  });

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subscriptionsData, usersData, plansData] = await Promise.all([
        getAllUserSubscriptions(),
        getAllUsers(),
        getAllSubscriptionPlans(),
      ]);
      setSubscriptions(subscriptionsData);
      setUsers(usersData);
      setPlans(plansData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    return plan?.name || 'Unknown Plan';
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date).replace(/,/g, '');
  };

  const isExpired = (endDate: Timestamp) => {
    return endDate.toDate() < new Date();
  };

  // CRUD handlers
  const handleDeleteClick = (subscription: UserSubscription) => {
    setDeleteModal({
      isOpen: true,
      subscription,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.subscription) return;

    try {
      await deleteUserSubscription(deleteModal.subscription.id);
      setDeleteModal({ isOpen: false, subscription: null });
      await fetchData();
    } catch (err) {
      console.error('Error deleting subscription:', err);
      setError('Failed to delete subscription');
    }
  };

  const handleToggleActive = async (subscriptionId: string, isActive: boolean) => {
    try {
      await toggleSubscriptionActive(subscriptionId, !isActive);
      await fetchData();
    } catch (err) {
      console.error('Error toggling active status:', err);
      setError('Failed to update subscription status');
    }
  };

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and Sort Subscriptions
  const filteredAndSortedSubscriptions = useMemo(() => {
    let filtered = [...subscriptions];

    // Search filter (user name or transaction ID)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((subscription) => {
        const userName = getUserName(subscription.userId).toLowerCase();
        const transactionId = subscription.transactionId.toLowerCase();
        return userName.includes(query) || transactionId.includes(query);
      });
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter((subscription) => subscription.planId === planFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((subscription) => subscription.isActive && !isExpired(subscription.endDate));
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((subscription) => !subscription.isActive);
    } else if (statusFilter === 'expired') {
      filtered = filtered.filter((subscription) => isExpired(subscription.endDate));
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter((subscription) => subscription.paymentMethod === paymentMethodFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'user':
          aValue = getUserName(a.userId).toLowerCase();
          bValue = getUserName(b.userId).toLowerCase();
          break;
        case 'plan':
          aValue = getPlanName(a.planId).toLowerCase();
          bValue = getPlanName(b.planId).toLowerCase();
          break;
        case 'startDate':
          aValue = a.startDate.toDate().getTime();
          bValue = b.startDate.toDate().getTime();
          break;
        case 'endDate':
          aValue = a.endDate.toDate().getTime();
          bValue = b.endDate.toDate().getTime();
          break;
        case 'paymentMethod':
          aValue = (a.paymentMethod || '').toLowerCase();
          bValue = (b.paymentMethod || '').toLowerCase();
          break;
        default:
          aValue = a.startDate.toDate().getTime();
          bValue = b.startDate.toDate().getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [subscriptions, searchQuery, sortField, sortOrder, planFilter, statusFilter, paymentMethodFilter, users, plans]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('startDate');
    setSortOrder('desc');
    setPlanFilter('all');
    setStatusFilter('all');
    setPaymentMethodFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      planFilter !== 'all' ||
      statusFilter !== 'all' ||
      paymentMethodFilter !== 'all'
    );
  }, [searchQuery, planFilter, statusFilter, paymentMethodFilter]);

  return {
    // Data
    subscriptions,
    users,
    plans,
    filteredAndSortedSubscriptions,
    
    // Loading states
    loading,
    error,
    
    // Filter states
    searchQuery,
    sortField,
    sortOrder,
    planFilter,
    statusFilter,
    paymentMethodFilter,
    hasActiveFilters,
    
    // Actions
    setSearchQuery,
    setSortField,
    setSortOrder,
    setPlanFilter,
    setStatusFilter,
    setPaymentMethodFilter,
    handleSort,
    clearFilters,
    
    // CRUD operations
    handleDeleteClick,
    handleDeleteConfirm,
    handleToggleActive,
    
    // Delete modal
    deleteModal,
    setDeleteModal,
    
    // Utilities
    getUserName,
    getPlanName,
    formatTimestamp,
    isExpired,
  };
}
