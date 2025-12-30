import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserById, updateUser } from '@/lib/services/user.service';
import { UpdateUserInput } from '@/lib/types/user.types';

interface UseEditUserFormReturn {
  loading: boolean;
  saving: boolean;
  error: string | null;
  formData: UpdateUserInput;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useEditUserForm(userId: string): UseEditUserFormReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateUserInput>({
    name: '',
    email: '',
    language: 'en',
    provider: 'google',
    photoURL: '',
  });

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const user = await getUserById(userId);
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          language: user.language,
          provider: user.provider,
          photoURL: user.photoURL,
        });
      } else {
        setError('User not found');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.name?.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.email?.trim()) {
        throw new Error('Email is required');
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Invalid email format');
      }

      await updateUser(userId, formData);
      router.push('/users');
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/users');
  };

  return {
    loading,
    saving,
    error,
    formData,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
