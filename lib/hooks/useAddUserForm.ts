import { useState } from 'react';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';
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
    role: 'user',
    password: '',
    confirmPassword: '',
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

      // Validate password if role is admin
      if (formData.role === 'admin') {
        if (!formData.password) {
          throw new Error('Password is required for admin users');
        }
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
      }

      // Prepare user data
      const userData: CreateUserInput = {
        name: formData.name,
        email: formData.email,
        language: formData.language,
        provider: formData.provider,
        photoURL: formData.photoURL,
        role: formData.role,
      };

      // Hash password if role is admin
      if (formData.role === 'admin' && formData.password) {
        const hashedPassword = await bcrypt.hash(formData.password, 10);
        userData.password = hashedPassword;
      }

      // Remove confirmPassword before saving (not needed in database)
      delete userData.confirmPassword;

      await createUser(userData);
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
