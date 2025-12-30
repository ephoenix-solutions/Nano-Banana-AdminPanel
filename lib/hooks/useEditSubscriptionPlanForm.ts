import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSubscriptionPlanById,
  updateSubscriptionPlan,
} from '@/lib/services/subscription-plan.service';
import { UpdateSubscriptionPlanInput } from '@/lib/types/subscription-plan.types';
import { useAuth } from '@/lib/hooks/useAuth';

interface FormData {
  name: string;
  price: string;
  currency: string;
  durationDays: number;
  generationLimit: number;
  features: string[];
  isActive: boolean;
  order: number;
}

interface UseEditSubscriptionPlanFormReturn {
  loading: boolean;
  saving: boolean;
  error: string | null;
  formData: FormData;
  newFeature: string;
  setNewFeature: (value: string) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddFeature: () => void;
  handleRemoveFeature: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useEditSubscriptionPlanForm(planId: string): UseEditSubscriptionPlanFormReturn {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState<FormData>({
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
          price: String(plan.price),
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await updateSubscriptionPlan(planId, {
        ...formData,
        updatedBy: user.id,
      });
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

  return {
    loading,
    saving,
    error,
    formData,
    newFeature,
    setNewFeature,
    handleChange,
    handleAddFeature,
    handleRemoveFeature,
    handleSubmit,
    handleCancel,
  };
}
