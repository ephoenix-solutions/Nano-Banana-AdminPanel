'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { usePromptDetails } from '@/lib/hooks/usePromptDetails';
import PromptHeader from '@/components/prompts/view/PromptHeader';
import PromptInfoGrid from '@/components/prompts/view/PromptInfoGrid';
import PromptTextSection from '@/components/prompts/view/PromptTextSection';
import PromptTagsSection from '@/components/prompts/view/PromptTagsSection';
import PromptImageSection from '@/components/prompts/view/PromptImageSection';

export default function ViewPromptPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const promptId = params.id as string;
  const fromTrash = searchParams.get('from') === 'trash';

  const {
    loading,
    error,
    prompt,
    categories,
    creatorName,
    creatorPhoto,
    updaterName,
    updaterPhoto,
    handleLikedBy,
    handleSavedBy,
  } = usePromptDetails(promptId, router);

  const handleBack = () => {
    router.push('/prompts');
  };

  const handleEdit = () => {
    router.push(`/prompts/edit/${promptId}`);
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
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-primary font-heading">
                Prompt Details
              </h1>
              {(fromTrash || prompt.isDeleted) && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-secondary/20 text-secondary border border-secondary/30">
                  <Icons.trash size={16} className="mr-1.5" />
                  Deleted
                </span>
              )}
            </div>
            <p className="text-secondary mt-2 font-body">
              View prompt information and generated image
            </p>
          </div>
          {!fromTrash && !prompt.isDeleted && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleLikedBy}
                className="flex items-center gap-2 px-6 py-3 bg-accent/10 text-accent rounded-lg font-semibold hover:bg-accent/20 transition-all border border-accent/20"
              >
                <Icons.heart size={20} />
                <span>Liked By</span>
              </button>
              <button
                onClick={handleSavedBy}
                className="flex items-center gap-2 px-6 py-3 bg-secondary/10 text-secondary rounded-lg font-semibold hover:bg-secondary/20 transition-all border border-secondary/20"
              >
                <Icons.bookmark size={20} />
                <span>Saved By</span>
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
              >
                <Icons.edit size={20} />
                <span>Edit Prompt</span>
              </button>
            </div>
          )}
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
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
