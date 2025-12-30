'use client';

import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useAddUserForm } from '@/lib/hooks/useAddUserForm';
import FormInput from '@/components/users/utils/FormInput';
import FormSelect from '@/components/users/utils/FormSelect';
import ErrorMessage from '@/components/users/utils/ErrorMessage';
import FormActions from '@/components/users/utils/FormActions';

export default function AddUserPage() {
  const {
    loading,
    error,
    formData,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useAddUserForm();

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

            {/* Photo URL Field - Full Width */}
            <FormInput
              id="photoURL"
              name="photoURL"
              label="Photo URL"
              value={formData.photoURL}
              onChange={handleChange}
              type="url"
              optional
              placeholder="https://example.com/photo.jpg"
            />

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
