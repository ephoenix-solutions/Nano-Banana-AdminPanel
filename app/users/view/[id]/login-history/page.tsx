'use client';

import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useUserLoginHistory } from '@/lib/hooks/useUserLoginHistory';
import LoginHistoryTable from '@/components/users/view/LoginHistoryTable';

export default function UserLoginHistoryPage() {
  const params = useParams();
  const userId = params.id as string;

  const {
    loading,
    error,
    user,
    loginHistory,
    loginHistoryLoading,
    handleBack,
    formatTimestamp,
  } = useUserLoginHistory(userId);

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
              { label: 'View User', href: `/users/view/${userId}` },
              { label: 'Login History' }
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
            <span>Back to User Details</span>
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Users', href: '/users' },
            { label: 'View User', href: `/users/view/${userId}` },
            { label: 'Login History' }
          ]} 
        />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
            >
              <Icons.arrowLeft size={20} />
              <span className="font-body text-sm">Back to User Details</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Login History
            </h1>
            <p className="text-secondary mt-2 font-body">
              Login activity for {user.name}
            </p>
          </div>
        </div>

        {/* User Info Card - Minimal */}
        <div className="bg-white rounded-lg border border-primary/10 p-6">
          <div className="flex items-center gap-4">
            {/* Profile Image */}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-accent/20"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-16 h-16 rounded-full bg-accent/20 border-2 border-accent/20 flex items-center justify-center ${
                user.photoURL ? 'hidden' : 'flex'
              }`}
            >
              <span className="text-2xl font-bold text-accent">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-primary font-heading">
                {user.name}
              </h2>
              <p className="text-sm text-secondary font-body">
                {user.email}
              </p>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                user.role === 'admin' 
                  ? 'bg-secondary/20 text-secondary' 
                  : 'bg-accent/20 text-primary'
              }`}>
                <Icons.users size={16} className="mr-2" />
                {user.role || 'user'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-primary uppercase">
                <Icons.globe size={16} className="mr-2" />
                {user.language}
              </span>
            </div>
          </div>
        </div>

        {/* Login History Table */}
        {loginHistoryLoading ? (
          <div className="bg-white rounded-lg border border-primary/10 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="ml-3 text-secondary font-body">Loading login history...</span>
            </div>
          </div>
        ) : (
          <LoginHistoryTable 
            loginHistory={loginHistory} 
            formatTimestamp={formatTimestamp}
          />
        )}
      </div>
    </AdminLayout>
  );
}
