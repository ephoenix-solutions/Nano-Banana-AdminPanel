'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
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

type SortField = 'user' | 'plan' | 'startDate' | 'endDate' | 'paymentMethod';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'active' | 'inactive' | 'expired';
type PaymentMethodFilter = 'all' | 'google' | 'apple';

export default function UserSubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    subscription: UserSubscription | null;
  }>({
    isOpen: false,
    subscription: null,
  });

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethodFilter>('all');

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

  const handleAddSubscription = () => {
    router.push('/user-subscription/add');
  };


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
      await fetchData();
    } catch (err) {
      console.error('Error deleting subscription:', err);
      setError('Failed to delete subscription');
    }
  };

  const handleToggleActive = async (
    subscriptionId: string,
    isActive: boolean
  ) => {
    try {
      await toggleSubscriptionActive(subscriptionId, !isActive);
      await fetchData();
    } catch (err) {
      console.error('Error toggling active status:', err);
      setError('Failed to update subscription status');
    }
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const isExpired = (endDate: Timestamp) => {
    return endDate.toDate() < new Date();
  };

  // Handle sorting
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

  // Sortable header component
  const SortableHeader = ({ field, label }: { field: SortField; label: string }) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.blur();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      handleSort(field);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onPointerDown={handlePointerDown}
        className="flex items-center gap-2 transition-all cursor-pointer group"
        style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
        tabIndex={-1}
      >
        <span>{label}</span>
        <div className="flex flex-col">
          <Icons.chevronUp
            size={16}
            className={`-mb-1 transition-all group-hover:scale-110 ${
              sortField === field && sortOrder === 'asc'
                ? 'text-accent'
                : 'text-secondary/30'
            }`}
          />
          <Icons.chevronDown
            size={16}
            className={`-mt-1 transition-all group-hover:scale-110 ${
              sortField === field && sortOrder === 'desc'
                ? 'text-accent'
                : 'text-secondary/30'
            }`}
          />
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'User Subscriptions' }]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              User Subscriptions
            </h1>
            <p className="text-secondary mt-2 font-body">
              Manage user subscription records
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg border border-primary/10 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.search size={20} className="text-secondary" />
                </div>
                <input
                  type="text"
                  placeholder="Search by user name or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary placeholder-secondary/50"
                />
              </div>
            </div>

            {/* Plan Filter */}
            <div className="w-full md:w-48">
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
              >
                <option value="all">All Plans</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="w-full md:w-48">
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value as PaymentMethodFilter)}
                className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
              >
                <option value="all">All Methods</option>
                <option value="google">Google Pay</option>
                <option value="apple">Apple Pay</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-secondary/20 text-secondary rounded-lg font-semibold hover:bg-secondary/10 transition-all whitespace-nowrap"
              >
                <Icons.close size={20} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-primary/10">
            <p className="text-sm text-secondary font-body">
              Showing <span className="font-semibold text-primary">{filteredAndSortedSubscriptions.length}</span> of{' '}
              <span className="font-semibold text-primary">{subscriptions.length}</span> subscriptions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Subscriptions
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {subscriptions.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.userSubscription size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">Active</p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {subscriptions.filter((s) => s.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.check size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">Expired</p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {
                    subscriptions.filter((s) => isExpired(s.endDate)).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.clock size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">Google Pay</p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {
                    subscriptions.filter((s) => s.paymentMethod === 'google')
                      .length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.subscriptionPlan size={24} className="text-secondary" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error}</p>
            </div>
          </div>
        )}

        {/* Subscriptions Table - Only show if there are results OR if loading */}
        {(loading || filteredAndSortedSubscriptions.length > 0) && (
          <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-primary/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="user" label="User" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="plan" label="Plan" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="startDate" label="Start Date" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="endDate" label="End Date" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      <SortableHeader field="paymentMethod" label="Payment Method" />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedSubscriptions.map((subscription, index) => {
                  const expired = isExpired(subscription.endDate);
                  return (
                    <tr
                      key={subscription.id}
                      className={`transition-colors ${
                        index % 2 === 0
                          ? 'bg-white hover:bg-background/50'
                          : 'bg-background hover:bg-background-200'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-primary">
                            {getUserName(subscription.userId)}
                          </p>
                          <p className="text-xs text-secondary font-mono">
                            {subscription.userId}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary font-medium">
                        {getPlanName(subscription.planId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-primary">
                        {formatTimestamp(subscription.startDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-primary">
                            {formatTimestamp(subscription.endDate)}
                          </span>
                          {expired && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/20 text-secondary">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary capitalize">
                          {subscription.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleToggleActive(
                              subscription.id,
                              subscription.isActive
                            )
                          }
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            subscription.isActive
                              ? 'bg-accent text-primary'
                              : 'bg-background text-secondary border border-primary/10'
                          }`}
                        >
                          {subscription.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeleteClick(subscription)}
                            className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Icons.trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {!loading && filteredAndSortedSubscriptions.length === 0 && subscriptions.length > 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.search size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No subscriptions found</h3>
            <p className="text-secondary mb-4">
              No subscriptions match your current filters. Try adjusting your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* No Data Message - Show when database is truly empty */}
        {!loading && subscriptions.length === 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.userSubscription size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No subscriptions yet</h3>
            <p className="text-secondary mb-4">
              There are no user subscriptions in the system yet.
            </p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() =>
            setDeleteModal({ isOpen: false, subscription: null })
          }
          onConfirm={handleDeleteConfirm}
          title="Delete Subscription"
          message="Are you sure you want to delete this subscription? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
