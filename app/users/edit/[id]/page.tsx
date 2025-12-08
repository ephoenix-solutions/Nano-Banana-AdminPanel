'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { getUserById, updateUser } from '@/lib/services/user.service';
import { UpdateUserInput } from '@/lib/types/user.types';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

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
            { label: 'Users', href: '/users' },
            { label: 'Edit User' }
          ]} 
        />

        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
          >
            <Icons.arrowLeft size={20} />
            <span className="font-body text-sm">Back to Users</span>
          </button>
          <h1 className="text-4xl font-bold text-primary font-heading">
            Edit User
          </h1>
          <p className="text-secondary mt-2 font-body">
            Update user information
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
                  Full Name <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="Enter full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Email Address <span className="text-secondary">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="user@example.com"
                />
              </div>

              {/* Provider Field */}
              <div>
                <label
                  htmlFor="provider"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Provider <span className="text-secondary">*</span>
                </label>
                <select
                  id="provider"
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="google">Google</option>
                  <option value="apple">Apple</option>
                </select>
              </div>

              {/* Language Field */}
              <div>
                <label
                  htmlFor="language"
                  className="block text-sm font-semibold text-primary mb-2 font-body"
                >
                  Language <span className="text-secondary">*</span>
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>

            {/* Photo URL Field - Full Width */}
            <div>
              <label
                htmlFor="photoURL"
                className="block text-sm font-semibold text-primary mb-2 font-body"
              >
                Photo URL <span className="text-secondary/50">(Optional)</span>
              </label>
              <input
                type="url"
                id="photoURL"
                name="photoURL"
                value={formData.photoURL}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                placeholder="https://example.com/photo.jpg"
              />
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
