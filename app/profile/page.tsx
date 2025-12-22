'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { updateUser } from '@/lib/services/user.service';
import { UpdateUserInput } from '@/lib/types/user.types';
import { Timestamp } from 'firebase/firestore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    language: 'en',
    photoURL: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        language: user.language || 'en',
        photoURL: user.photoURL || '',
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear messages when user starts typing
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate inputs
      if (!formData.name?.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.email?.trim()) {
        throw new Error('Email is required');
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Invalid email format');
      }

      // Update user in Firestore
      const updateData: UpdateUserInput = {
        name: formData.name,
        email: formData.email,
        language: formData.language,
        photoURL: formData.photoURL,
      };

      await updateUser(user.id, updateData);

      // Update Redux state with new user data
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
        language: formData.language,
        photoURL: formData.photoURL,
      });

      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        language: user.language || 'en',
        photoURL: user.photoURL || '',
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '-';
    
    try {
      let date: Date;
      
      // Handle Firestore Timestamp
      if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      }
      // Handle timestamp object with seconds
      else if (timestamp && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      }
      // Handle regular Date object or string
      else {
        date = new Date(timestamp);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '-';
    }
  };

  if (!user) {
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
        <Breadcrumbs items={[{ label: 'Profile' }]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              My Profile
            </h1>
            <p className="text-secondary mt-2 font-body">
              Manage your account information
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
            >
              <Icons.edit size={20} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-accent/10 border border-accent rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icons.check size={20} className="text-accent" />
              <p className="text-accent font-body font-semibold">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Profile Header Section */}
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
            <div className="flex items-center gap-6">
              {/* Profile Image */}
              <div className="relative">
                {user.photoURL ? (
                  <div className="relative group">
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-32 h-32 rounded-full bg-secondary border-4 border-white shadow-lg flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <span className="text-5xl font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-secondary border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-5xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* User Basic Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-primary font-heading mb-2">
                  {user.name}
                </h2>
                <p className="text-lg text-secondary font-body mb-3">
                  {user.email}
                </p>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    user.role === 'admin' 
                      ? 'bg-secondary-100 text-secondary-700' 
                      : 'bg-accent-100 text-accent-700'
                  }`}>
                    <Icons.users size={16} className="mr-2" />
                    {user.role || 'user'}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    user.provider.toLowerCase() === 'google' 
                      ? 'bg-accent-100 text-accent-700'
                      : user.provider.toLowerCase() === 'apple' || user.provider.toLowerCase() === 'ios'
                      ? 'bg-primary-100 text-primary-700'
                      : user.provider.toLowerCase() === 'manual'
                      ? 'bg-secondary-100 text-secondary-700'
                      : 'bg-accent/20 text-primary'
                  }`}>
                    <Icons.globe size={16} className="mr-2" />
                    {user.provider}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700 uppercase">
                    <Icons.globe size={16} className="mr-2" />
                    {user.language}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form/Details Section */}
          <div className="p-8">
            {isEditing ? (
              // Edit Mode
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-bold text-primary font-heading mb-6">
                  Edit Profile Information
                </h3>
                
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
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled
                      className="w-full px-4 py-3 border border-primary/10 rounded-lg text-sm font-body text-primary bg-background/50 transition-all duration-200 cursor-not-allowed opacity-60"
                      placeholder="user@example.com"
                    />
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

                  {/* Photo URL Field */}
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
                </div>

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
            ) : (
              // View Mode
              <>
                <h3 className="text-xl font-bold text-primary font-heading mb-6">
                  Account Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User ID */}
                  <div className="bg-background rounded-lg p-4 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icons.user size={20} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary font-body mb-1">User ID</p>
                        <p className="text-base font-semibold text-primary font-body break-all">
                          {user.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="bg-background rounded-lg p-4 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icons.mail size={20} className="text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary font-body mb-1">Email Address</p>
                        <p className="text-base font-semibold text-primary font-body break-all">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="bg-background rounded-lg p-4 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        user.role === 'admin' ? 'bg-secondary/20' : 'bg-accent/20'
                      }`}>
                        <Icons.users size={20} className={user.role === 'admin' ? 'text-secondary' : 'text-accent'} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-secondary font-body mb-1">User Role</p>
                        <p className="text-base font-semibold text-primary font-body capitalize">
                          {user.role || 'user'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Provider */}
                  <div className="bg-background rounded-lg p-4 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icons.globe size={20} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-secondary font-body mb-1">Authentication Provider</p>
                        <p className="text-base font-semibold text-primary font-body capitalize">
                          {user.provider}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="bg-background rounded-lg p-4 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icons.globe size={20} className="text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-secondary font-body mb-1">Preferred Language</p>
                        <p className="text-base font-semibold text-primary font-body uppercase">
                          {user.language}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Created At */}
                  <div className="bg-background rounded-lg p-4 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icons.clock size={20} className="text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-secondary font-body mb-1">Account Created</p>
                        <p className="text-base font-semibold text-primary font-body">
                          {formatTimestamp(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Last Login */}
                  <div className="bg-background rounded-lg p-4 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icons.check size={20} className="text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-secondary font-body mb-1">Last Login</p>
                        <p className="text-base font-semibold text-primary font-body">
                          {formatTimestamp(user.lastLogin)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
