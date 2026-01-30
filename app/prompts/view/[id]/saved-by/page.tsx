'use client';

import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { usePromptSavedBy } from '@/lib/hooks/usePromptSavedBy';
import UsersTable from '@/components/prompts/view/UsersTable';

export default function PromptSavedByPage() {
  const router = useRouter();
  const params = useParams();
  const promptId = params.id as string;

  const {
    loading,
    error,
    prompt,
    savedByUsers,
    loadingSaves,
    handleBack,
  } = usePromptSavedBy(promptId);

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
              { label: 'View Prompt', href: `/prompts/view/${promptId}` },
              { label: 'Saved By' }
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
            <span>Back to Prompt Details</span>
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
            { label: 'Prompts', href: '/prompts' },
            { label: 'View Prompt', href: `/prompts/view/${promptId}` },
            { label: 'Saved By' }
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
              <span className="font-body text-sm">Back to Prompt Details</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Users Who Saved This Prompt
            </h1>
            <p className="text-secondary mt-2 font-body">
              {prompt.title}
            </p>
          </div>
        </div>

        {/* Prompt Info Card - Minimal */}
        <div className="bg-white rounded-lg border border-primary/10 p-6">
          <div className="flex items-center gap-4">
            {/* Prompt Image */}
            {prompt.url && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary/20 flex-shrink-0">
                <img
                  src={prompt.url}
                  alt={prompt.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '';
                      parent.className = 'relative w-20 h-20 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0';
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>';
                      parent.appendChild(icon.firstChild!);
                    }
                  }}
                />
              </div>
            )}

            {/* Prompt Info */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-primary font-heading">
                {prompt.title}
              </h2>
              <p className="text-sm text-secondary font-body line-clamp-2 mt-1">
                {prompt.prompt}
              </p>
            </div>

            {/* Stats - Only Saves */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-2 text-secondary">
                  <Icons.bookmark size={20} className="fill-secondary" />
                  <span className="text-2xl font-bold">{prompt.savesCount || 0}</span>
                </div>
                <p className="text-xs text-secondary mt-1">Saves</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Who Saved Table */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          <UsersTable
            users={savedByUsers.map(item => ({ user: item.user, timestamp: item.savedAt }))}
            loading={loadingSaves}
            title="Users Who Saved This Prompt"
            icon="bookmark"
            emptyMessage="No users have saved this prompt yet."
            timestampLabel="Saved At"
            onViewUser={handleViewUser}
            fullWidth={true}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
