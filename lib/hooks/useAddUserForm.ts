import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '@/lib/services/user.service';
import { CreateUserInput } from '@/lib/types/user.types';

interface UseAddUserFormReturn {
  loading: boolean;
  error: string | null;
  formData: CreateUserInput;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useAddUserForm(): UseAddUserFormReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserInput>({
    name: '',
    email: '',
    language: 'en',
    provider: 'manual',
    photoURL: '',
  });

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
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Invalid email format');
      }

      await createUser(formData);
      router.push('/users');
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/users');
  };

  return {
    loading,
    error,
    formData,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
