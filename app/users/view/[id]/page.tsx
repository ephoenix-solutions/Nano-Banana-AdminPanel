'use client';

import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useUserDetails } from '@/lib/hooks/useUserDetails';
import UserHeader from '@/components/users/view/UserHeader';
import UserInfoGrid from '@/components/users/view/UserInfoGrid';
import UserPhotoSection from '@/components/users/view/UserPhotoSection';

export default function ViewUserPage() {
  const params = useParams();
  const userId = params.id as string;

  const {
    loading,
    error,
    user,
    creatorUser,
    handleBack,
    handleEdit,
    handleLoginHistory,
    formatTimestamp,
  } = useUserDetails(userId);

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
      <div className="w-full space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Users', href: '/users' },
            { label: 'View User' }
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
              <span className="font-body text-sm">Back to Users</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              User Details
            </h1>
            <p className="text-secondary mt-2 font-body">
              View user information
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoginHistory}
              className="flex items-center gap-2 px-6 py-3 border text-secondary rounded-lg font-semibold transition-all cursor-pointer border-secondary"
            >
              <Icons.clock size={20} />
              <span>Login History</span>
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all cursor-pointer"
            >
              <Icons.edit size={20} />
              <span>Edit User</span>
            </button>
          </div>
        </div>

        {/* User Details Card */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Profile Header Section */}
          <UserHeader user={user} onEdit={handleEdit} />

          {/* Detailed Information Section */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Account Information
            </h3>
            
            <UserInfoGrid user={user} creatorUser={creatorUser} formatTimestamp={formatTimestamp} />

            {/* Photo URL Section */}
            <UserPhotoSection photoURL={user.photoURL} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
