'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { getSubscriptionPlanById } from '@/lib/services/subscription-plan.service';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';

export default function ViewSubscriptionPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const planData = await getSubscriptionPlanById(planId);
      if (planData) {
        setPlan(planData);
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

  const handleBack = () => {
    router.push('/subscription-plan');
  };

  const handleEdit = () => {
    router.push(`/subscription-plan/edit/${planId}`);
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

  if (error || !plan) {
    return (
      <AdminLayout>
        <div className="w-full">
          <Breadcrumbs 
            items={[
              { label: 'Subscription Plans', href: '/subscription-plan' },
              { label: 'View Plan' }
            ]} 
          />
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error || 'Subscription plan not found'}</p>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
          >
            <Icons.arrowLeft size={20} />
            <span>Back to Subscription Plans</span>
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Subscription Plans', href: '/subscription-plan' },
            { label: 'View Plan' }
          ]} 
        />

        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
            >
              <Icons.arrowLeft size={20} />
              <span className="font-body text-sm">Back to Subscription Plans</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Subscription Plan Details
            </h1>
            <p className="text-secondary mt-2 font-body">
              View subscription plan information and features
            </p>
          </div>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.edit size={20} />
            <span>Edit Plan</span>
          </button>
        </div>

        {/* Plan Details Card */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Plan Header Section */}
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
            <div className="flex items-center gap-6">
              {/* Plan Icon */}
              <div className="w-32 h-32 rounded-lg bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center">
                <Icons.subscriptionPlan size={64} className="text-accent" />
              </div>

              {/* Plan Basic Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-primary font-heading mb-2">
                  {plan.name}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-4xl font-bold text-accent font-body">
                    {plan.currency} {plan.price}
                  </span>
                  <span className="text-lg text-secondary font-body">
                    / {plan.durationDays} days
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    plan.isActive 
                      ? 'bg-accent text-primary' 
                      : 'bg-secondary/20 text-secondary'
                  }`}>
                    {plan.isActive ? (
                      <>
                        <Icons.check size={16} className="mr-2" />
                        Active
                      </>
                    ) : (
                      <>
                        <Icons.close size={16} className="mr-2" />
                        Inactive
                      </>
                    )}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-primary">
                    <Icons.file size={16} className="mr-2" />
                    Order: {plan.order}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-primary">
                    <Icons.check size={16} className="mr-2" />
                    {plan.generationLimit} generations
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Section */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Plan Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan ID */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.subscriptionPlan size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Plan ID</p>
                    <p className="text-base font-semibold text-primary font-body break-all">
                      {plan.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan Name */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.file size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Plan Name</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {plan.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.subscriptionPlan size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Price</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {plan.currency} {plan.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Currency */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.globe size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Currency</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {plan.currency}
                    </p>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.clock size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Duration</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {plan.durationDays} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Generation Limit */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.images size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Generation Limit</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {plan.generationLimit} generations
                    </p>
                  </div>
                </div>
              </div>

              {/* Display Order */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.file size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Display Order</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {plan.order}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.check size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Status</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {plan.isActive ? 'Active - Visible to users' : 'Inactive - Hidden from users'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-primary font-heading mb-4">
                Plan Features ({plan.features.length})
              </h3>
              {plan.features && plan.features.length > 0 ? (
                <div className="bg-background rounded-lg p-6 border border-primary/10">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icons.check size={14} className="text-accent" />
                        </div>
                        <span className="text-base text-primary font-body flex-1">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-background rounded-lg p-8 border border-primary/10 text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.file size={32} className="text-accent" />
                  </div>
                  <p className="text-secondary font-body">No features added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
