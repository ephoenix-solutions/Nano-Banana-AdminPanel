'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';
import {
  getAllSubscriptionPlans,
  deleteSubscriptionPlan,
  togglePlanActive,
} from '@/lib/services/subscription-plan.service';
import { getUserById } from '@/lib/services/user.service';
import { Timestamp } from 'firebase/firestore';

// Helper function to format timestamp
const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return null;
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
    return null;
  }
};

// Helper component to display creator name
function CreatedByCell({ 
  userId, 
  fetchUserName 
}: { 
  userId: string; 
  fetchUserName: (id: string) => Promise<string>;
}) {
  const [name, setName] = useState<string>('Loading...');
  const [photoURL, setPhotoURL] = useState<string>('');

  useEffect(() => {
    if (userId) {
      fetchUserName(userId).then(setName);
      // Fetch user photo
      getUserById(userId).then(user => {
        if (user?.photoURL) {
          setPhotoURL(user.photoURL);
        }
      }).catch(() => {
        setPhotoURL('');
      });
    } else {
      setName('Unknown');
    }
  }, [userId, fetchUserName]);

  return (
    <div className="flex items-center gap-2">
      {photoURL ? (
        <img
          src={photoURL}
          alt={name}
          className="w-6 h-6 rounded-full object-cover border border-accent/20"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
            if (placeholder) placeholder.style.display = 'flex';
          }}
        />
      ) : null}
      <div 
        className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center"
        style={{ display: photoURL ? 'none' : 'flex' }}
      >
        <Icons.users size={12} className="text-accent" />
      </div>
      <span className="text-sm">{name}</span>
    </div>
  );
}

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    plan: SubscriptionPlan | null;
  }>({
    isOpen: false,
    plan: null,
  });

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
        <Breadcrumbs items={[{ label: 'Subscription Plans' }]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Subscription Plans
            </h1>
            <p className="text-secondary mt-2 font-body">
              Manage subscription plans and pricing
            </p>
          </div>
          <button
            onClick={handleAddPlan}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.plus size={20} />
            <span>Add Plan</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">Total Plans</p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {plans.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.subscriptionPlan size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">Active Plans</p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {plans.filter((p) => p.isActive).length}
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
                <p className="text-sm text-secondary font-body">
                  Inactive Plans
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {plans.filter((p) => !p.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.close size={24} className="text-accent" />
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

        {/* Plans Table */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Generation Limit
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Features
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Created By
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                    Updated By
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">
                          {plan.name}
                        </span>
                        <span className="text-xs text-secondary">
                          (Order: {plan.order})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary font-semibold">
                      {plan.currency} {plan.price}
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      {plan.durationDays} days
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      {plan.generationLimit} generations
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {plan.features.slice(0, 2).map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent/20 text-primary"
                          >
                            {feature}
                          </span>
                        ))}
                        {plan.features.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary/20 text-primary">
                            +{plan.features.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(plan.id, plan.isActive)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                          plan.isActive
                            ? 'bg-accent text-primary'
                            : 'bg-background text-secondary border border-primary/10'
                        }`}
                      >
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      <div className="flex flex-col gap-1">
                        <CreatedByCell userId={plan.createdBy} fetchUserName={fetchUserName} />
                        {plan.createdAt && (
                          <span className="text-xs text-secondary">
                            {formatTimestamp(plan.createdAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      {plan.updatedBy ? (
                        <div className="flex flex-col gap-1">
                          <CreatedByCell userId={plan.updatedBy} fetchUserName={fetchUserName} />
                          {plan.updatedAt && (
                            <span className="text-xs text-secondary">
                              {formatTimestamp(plan.updatedAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-secondary text-xs">Not updated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(plan)}
                          className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                          title="View"
                        >
                          <Icons.eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(plan)}
                          className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer"
                          title="Edit"
                        >
                          <Icons.edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(plan)}
                          className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Icons.trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, plan: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Subscription Plan"
          message={`Are you sure you want to delete "${deleteModal.plan?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
