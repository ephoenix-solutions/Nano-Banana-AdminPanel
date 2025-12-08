'use client';

import { useEffect, useState } from 'react';
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
                <Icons.clock size={24} className="text-acfcent" />
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

        {/* Subscriptions Table */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Start Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    End Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Payment Method
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {subscriptions.map((subscription) => {
                  const expired = isExpired(subscription.endDate);
                  return (
                    <tr
                      key={subscription.id}
                      className="hover:bg-background/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-primary">
                            {getUserName(subscription.userId)}
                          </p>
                          <p className="text-xs text-secondary font-mono">
                            {subscription.userId.substring(0, 8)}...
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
                            className="px-3 py-1.5 text-sm font-medium text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all"
                          >
                            Delete
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
