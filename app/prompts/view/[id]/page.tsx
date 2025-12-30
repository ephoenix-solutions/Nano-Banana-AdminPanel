'use client';

import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { usePromptDetails } from '@/lib/hooks/usePromptDetails';
import PromptHeader from '@/components/prompts/view/PromptHeader';
import PromptInfoGrid from '@/components/prompts/view/PromptInfoGrid';
import PromptTextSection from '@/components/prompts/view/PromptTextSection';
import PromptTagsSection from '@/components/prompts/view/PromptTagsSection';
import PromptImageSection from '@/components/prompts/view/PromptImageSection';
import UsersTable from '@/components/prompts/view/UsersTable';

export default function ViewPromptPage() {
  const router = useRouter();
  const params = useParams();
  const promptId = params.id as string;

  const {
    loading,
    error,
    prompt,
    categories,
    creatorName,
    creatorPhoto,
    updaterName,
    updaterPhoto,
    likedByUsers,
    savedByUsers,
    loadingLikes,
    loadingSaves,
  } = usePromptDetails(promptId);

  const handleBack = () => {
    router.push('/prompts');
  };

  const handleEdit = () => {
    router.push(`/prompts/edit/${promptId}`);
  };

  const handleViewUser = (userId: string) => {
    router.push(`/users/view/${userId}`);
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

  if (error || !prompt) {
    return (
      <AdminLayout>
        <div className="w-full">
          <Breadcrumbs 
            items={[
              { label: 'Prompts', href: '/prompts' },
              { label: 'View Prompt' }
            ]} 
          />
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error || 'Prompt not found'}</p>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
          >
            <Icons.arrowLeft size={20} />
            <span>Back to Prompts</span>
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
            { label: 'Prompts', href: '/prompts' },
            { label: 'View Prompt' }
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
              <span className="font-body text-sm">Back to Prompts</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Prompt Details
            </h1>
            <p className="text-secondary mt-2 font-body">
              View prompt information and generated image
            </p>
          </div>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.edit size={20} />
            <span>Edit Prompt</span>
          </button>
        </div>

        {/* Prompt Details Card */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Prompt Header Section */}
          <PromptHeader prompt={prompt} />

          {/* Detailed Information Section */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Prompt Information
            </h3>
            
            <PromptInfoGrid
              prompt={prompt}
              categories={categories}
              creatorName={creatorName}
              creatorPhoto={creatorPhoto}
              updaterName={updaterName}
              updaterPhoto={updaterPhoto}
            />

            <PromptTextSection prompt={prompt} />
            <PromptTagsSection prompt={prompt} />
            <PromptImageSection prompt={prompt} />

            {/* Users Who Liked and Saved - Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-4">
              {/* Users Who Liked This Prompt - Left Side */}
              <UsersTable
                users={likedByUsers.map(item => ({ user: item.user, timestamp: item.likedAt }))}
                loading={loadingLikes}
                title="Liked By"
                icon="check"
                emptyMessage="No users have liked this prompt yet."
                timestampLabel="Liked At"
                onViewUser={handleViewUser}
              />

              {/* Users Who Saved This Prompt - Right Side */}
              <UsersTable
                users={savedByUsers.map(item => ({ user: item.user, timestamp: item.savedAt }))}
                loading={loadingSaves}
                title="Saved By"
                icon="bookmark"
                emptyMessage="No users have saved this prompt yet."
                timestampLabel="Saved At"
                onViewUser={handleViewUser}
              />
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
