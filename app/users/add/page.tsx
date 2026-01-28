'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useAddUserForm } from '@/lib/hooks/useAddUserForm';
import FormInput from '@/components/users/utils/FormInput';
import FormSelect from '@/components/users/utils/FormSelect';
import ErrorMessage from '@/components/users/utils/ErrorMessage';
import FormActions from '@/components/users/utils/FormActions';
import ImageUpload from '@/components/shared/ImageUpload';

export default function AddUserPage() {
  const {
    loading,
    error,
    formData,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useAddUserForm();

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
  ];

  const providerOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'google', label: 'Google' },
    { value: 'apple', label: 'Apple' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'hi', label: 'Hindi' },
  ];

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Users', href: '/users' },
            { label: 'Add User' }
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
            Add New User
          </h1>
          <p className="text-secondary mt-2 font-body">
            Create a new user account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-primary/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <FormInput
                id="name"
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />

              {/* Email Field */}
              <FormInput
                id="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                type="email"
                required
                placeholder="user@example.com"
              />

              {/* Role Field */}
              <FormSelect
                id="role"
                name="role"
                label="Role"
                value={formData.role || 'user'}
                onChange={handleChange}
                options={roleOptions}
                required
              />

              {/* Provider Field */}
              <FormSelect
                id="provider"
                name="provider"
                label="Provider"
                value={formData.provider}
                onChange={handleChange}
                options={providerOptions}
                required
              />

              {/* Language Field */}
              <FormSelect
                id="language"
                name="language"
                label="Language"
                value={formData.language}
                onChange={handleChange}
                options={languageOptions}
                required
              />
            </div>

            {/* Photo Upload Field - Full Width */}
            <ImageUpload
              value={formData.photoURL}
              onChange={(url) => handleChange({ target: { name: 'photoURL', value: url } } as any)}
              folder="users"
              label="User Photo"
              optional={true}
              enableCrop={true}
              aspectRatio={1}
              circularCrop={true}
              showAspectRatioButtons={false}
            />

            {/* Password Fields - Show only when role is admin */}
            {formData.role === 'admin' && (
              <>
                <div className="border-t border-primary/10 pt-6">
                  <h3 className="text-lg font-semibold text-primary mb-4 font-heading">
                    Admin Password
                  </h3>
                  <p className="text-sm text-secondary mb-4 font-body">
                    Password is required for admin users to access the admin panel.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      id="password"
                      name="password"
                      label="Password"
                      value={formData.password || ''}
                      onChange={handleChange}
                      type="password"
                      required
                      placeholder="Enter password (min 8 characters)"
                    />

                    <FormInput
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirm Password"
                      value={formData.confirmPassword || ''}
                      onChange={handleChange}
                      type="password"
                      required
                      placeholder="Confirm password"
                    />
                  </div>
                  {formData.password && (
                    <div className="mt-2 text-sm">
                      <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-orange-600'}>
                        {formData.password.length >= 8 ? 'Password strength: Good' : 'Password too short (minimum 8 characters)'}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Error Message */}
            <ErrorMessage message={error} />

            {/* Form Actions */}
            <FormActions
              loading={loading}
              onCancel={handleCancel}
              submitText="Create User"
              loadingText="Creating..."
              submitIcon="check"
            />
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
