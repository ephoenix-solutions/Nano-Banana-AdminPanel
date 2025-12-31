import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { getUserById, updateUser } from '@/lib/services/user.service';
import { UpdateUserInput } from '@/lib/types/user.types';

interface UseEditUserFormReturn {
  loading: boolean;
  saving: boolean;
  error: string | null;
  formData: UpdateUserInput;
  originalRole: string; // Track original role for comparison
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleCancel: () => void;
}

export function useEditUserForm(userId: string): UseEditUserFormReturn {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalRole, setOriginalRole] = useState<string>('user'); // Track original role
  const [formData, setFormData] = useState<UpdateUserInput>({
    name: '',
    email: '',
    language: 'en',
    provider: 'google',
    photoURL: '',
    role: 'user',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const user = await getUserById(userId);
      if (user) {
        setOriginalRole(user.role || 'user'); // Store original role
        setFormData({
          name: user.name,
          email: user.email,
          language: user.language,
          provider: user.provider,
          photoURL: user.photoURL,
          role: user.role || 'user',
          password: '',
          confirmPassword: '',
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

      // Check if role is changing to admin
      const isChangingToAdmin = originalRole !== 'admin' && formData.role === 'admin';
      const isStayingAdmin = originalRole === 'admin' && formData.role === 'admin';

      // Validate password based on role changes
      if (isChangingToAdmin) {
        // Changing to admin requires password
        if (!formData.password) {
          throw new Error('Password is required when changing role to admin');
        }
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
      } else if (isStayingAdmin && formData.password) {
        // Already admin, password is optional but if provided must be valid
        if (formData.password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
      }

      // Prepare update data
      const updateData: UpdateUserInput = {
        name: formData.name,
        email: formData.email,
        language: formData.language,
        provider: formData.provider,
        photoURL: formData.photoURL,
        role: formData.role,
      };

      // Hash password if provided and role is admin
      if (formData.role === 'admin' && formData.password) {
        const hashedPassword = await bcrypt.hash(formData.password, 10);
        updateData.password = hashedPassword;
      }

      // Remove confirmPassword before saving (not needed in database)
      delete updateData.confirmPassword;

      await updateUser(userId, updateData);
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
    originalRole,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
