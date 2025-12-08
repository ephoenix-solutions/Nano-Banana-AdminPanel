'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import {
  getSubscriptionPlanById,
  updateSubscriptionPlan,
} from '@/lib/services/subscription-plan.service';
import { UpdateSubscriptionPlanInput } from '@/lib/types/subscription-plan.types';

export default function EditSubscriptionPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState<UpdateSubscriptionPlanInput>({
    name: '',
    price: '',
    currency: 'INR',
    durationDays: 30,
    generationLimit: 0,
    features: [],
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const plan = await getSubscriptionPlanById(planId);
      if (plan) {
        setFormData({
          name: plan.name,
          price: String(plan.price), // Convert to string
          currency: plan.currency,
          durationDays: plan.durationDays,
          generationLimit: plan.generationLimit,
          features: plan.features,
          isActive: plan.isActive,
          order: plan.order,
        });
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === 'durationDays' || name === 'generationLimit' || name === 'order') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && formData.features) {
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.name || !formData.name.trim()) {
        throw new Error('Plan name is required');
      }
      if (!formData.price || !String(formData.price).trim()) {
        throw new Error('Price is required');
      }

      await updateSubscriptionPlan(planId, formData);
      router.push('/subscription-plan');
    } catch (err: any) {
      console.error('Error updating plan:', err);
      setError(err.message || 'Failed to update subscription plan');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/subscription-plan');
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
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Subscription Plans', href: '/subscription-plan' },
            { label: 'Edit Plan' }
          ]} 
        />

        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
          >
            <Icons.arrowLeft size={20} />
            <span className="font-body text-sm">Back to Subscription Plans</span>
          </button>
          <h1 className="text-4xl font-bold text-primary font-heading">
            Edit Subscription Plan
          </h1>
          <p className="text-secondary mt-2 font-body">
            Update subscription plan information
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-primary/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Plan Name <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="e.g., Basic, Pro, Premium"
                />
              </div>

              {/* Order Field */}
              <div>
                <label
                  htmlFor="order"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Display Order <span className="text-secondary">*</span>
                </label>
                <input
                  type="number"
                  id="order"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="0"
                />
              </div>

              {/* Price Field */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Price <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="199"
                />
              </div>

              {/* Currency Field */}
              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Currency <span className="text-secondary">*</span>
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              {/* Duration Days Field */}
              <div>
                <label
                  htmlFor="durationDays"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Duration (Days) <span className="text-secondary">*</span>
                </label>
                <input
                  type="number"
                  id="durationDays"
                  name="durationDays"
                  value={formData.durationDays}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="30"
                />
              </div>

              {/* Generation Limit Field */}
              <div>
                <label
                  htmlFor="generationLimit"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Generation Limit <span className="text-secondary">*</span>
                </label>
                <input
                  type="number"
                  id="generationLimit"
                  name="generationLimit"
                  value={formData.generationLimit}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="20"
                />
              </div>
            </div>

            {/* Features Section */}
            <div>
              <label className="block text-sm font-semibold text-primary mb-2 font-body">
                Features
              </label>
              <div className="space-y-3">
                {/* Add Feature Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="Enter a feature and press Add"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
                  >
                    <Icons.plus size={20} />
                  </button>
                </div>

                {/* Features List */}
                {formData.features && formData.features.length > 0 && (
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-4 py-2 bg-background rounded-lg border border-primary/10"
                      >
                        <span className="text-sm text-primary font-body">
                          {feature}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="text-secondary hover:text-primary transition-colors"
                        >
                          <Icons.close size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded border-primary/10 text-accent focus:ring-accent focus:ring-2"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-primary font-body cursor-pointer"
              >
                Active (visible to users)
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Icons.alert size={20} className="text-secondary" />
                  <p className="text-secondary font-body text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary/10">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-3 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Icons.save size={20} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
