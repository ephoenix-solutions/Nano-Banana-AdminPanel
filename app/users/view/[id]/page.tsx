'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { getUserById } from '@/lib/services/user.service';
import { User } from '@/lib/types/user.types';
import { Timestamp } from 'firebase/firestore';

export default function ViewUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(userId);
      if (userData) {
        setUser(userData);
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

  const handleBack = () => {
    router.push('/users');
  };

  const handleEdit = () => {
    router.push(`/users/edit/${userId}`);
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
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

  if (error || !user) {
    return (
      <AdminLayout>
        <div className="w-full">
          <Breadcrumbs 
            items={[
              { label: 'Users', href: '/users' },
              { label: 'View User' }
            ]} 
          />
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error || 'User not found'}</p>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
          >
            <Icons.arrowLeft size={20} />
            <span>Back to Users</span>
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
            { label: 'Users', href: '/users' },
            { label: 'View User' }
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
              <span className="font-body text-sm">Back to Users</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              User Details
            </h1>
            <p className="text-secondary mt-2 font-body">
              View user information
            </p>
          </div>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.edit size={20} />
            <span>Edit User</span>
          </button>
        </div>

        {/* User Details Card */}
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
                      className="w-32 h-32 rounded-full bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <span className="text-5xl font-bold text-accent">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Hover overlay to view full image */}
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Icons.images size={32} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center">
                    <span className="text-5xl font-bold text-accent">
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-primary capitalize">
                    <Icons.globe size={16} className="mr-2" />
                    {user.provider}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-primary uppercase">
                    <Icons.globe size={16} className="mr-2" />
                    {user.language}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Section */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Account Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User ID */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.users size={20} className="text-accent" />
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
                    <Icons.feedback size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Email Address</p>
                    <p className="text-base font-semibold text-primary font-body break-all">
                      {user.email}
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

            {/* Photo URL Section */}
            {user.photoURL && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-primary font-heading mb-4">
                  Profile Photo
                </h3>
                <div className="bg-background rounded-lg p-4 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icons.images size={20} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary font-body mb-2">Photo URL</p>
                      <p className="text-sm text-primary font-body break-all mb-3">
                        {user.photoURL}
                      </p>
                      <a
                        href={user.photoURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 font-medium transition-colors"
                      >
                        <Icons.globe size={16} />
                        Open in new tab
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
