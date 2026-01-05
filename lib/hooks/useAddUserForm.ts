import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
      // Client-side validation
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password ONLY if role is admin
      // Regular users don't need passwords (they use Google/Apple sign-in)
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

      // Prepare request data
      const requestData: any = {
        name: formData.name,
        email: formData.email,
        language: formData.language,
        provider: formData.provider,
        photoURL: formData.photoURL,
        role: formData.role,
      };

      // Add password ONLY for admin users
      if (formData.role === 'admin' && formData.password) {
        requestData.password = formData.password;
      }

      // Send to API route (password will be hashed on server)
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create user');
      }

      // Success! Redirect to users list
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
