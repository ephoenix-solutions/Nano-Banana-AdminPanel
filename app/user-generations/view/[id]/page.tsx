'use client';

import { useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useUserGenerationDetails } from '@/lib/hooks/useUserGenerationDetails';
import GenerationHeader from '@/components/user-generations/view/GenerationHeader';
import GenerationInfoGrid from '@/components/user-generations/view/GenerationInfoGrid';
import PromptTextSection from '@/components/user-generations/view/PromptTextSection';
import GeneratedImageSection from '@/components/user-generations/view/GeneratedImageSection';
import ErrorMessageSection from '@/components/user-generations/view/ErrorMessageSection';
import MetadataSection from '@/components/user-generations/view/MetadataSection';

export default function ViewUserGenerationPage() {
  const params = useParams();
  const generationId = params.id as string;

  const {
    loading,
    error,
    generation,
    user,
    plan,
    formatTimestamp,
    handleBack,
  } = useUserGenerationDetails(generationId);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !generation) {
    return (
      <AdminLayout>
        <div className="w-full">
          <Breadcrumbs 
            items={[
              { label: 'User Generations', href: '/user-generations' },
              { label: 'View Generation' }
            ]} 
          />
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error || 'Generation not found'}</p>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
          >
            <Icons.arrowLeft size={20} />
            <span>Back to User Generations</span>
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
            { label: 'User Generations', href: '/user-generations' },
            { label: 'View Generation' }
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
              <span className="font-body text-sm">Back to User Generations</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Generation Details
            </h1>
            <p className="text-secondary mt-2 font-body">
              View generation information
            </p>
          </div>
        </div>

        {/* Generation Details Card */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Header Section */}
          <GenerationHeader generation={generation} />

          {/* Detailed Information Section */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Generation Information
            </h3>
            
            <GenerationInfoGrid 
              generation={generation} 
              user={user} 
              plan={plan} 
              formatTimestamp={formatTimestamp} 
            />

            {/* Prompt Text Section */}
            <PromptTextSection promptText={generation.promptText} />

            {/* Generated Image Section */}
            {generation.imageUrl && generation.generationStatus === 'success' && (
              <GeneratedImageSection 
                imageUrl={generation.imageUrl} 
                promptText={generation.promptText}
              />
            )}

            {/* Error Message Section */}
            {generation.errorMessage && (
              <ErrorMessageSection errorMessage={generation.errorMessage} />
            )}

            {/* Metadata Section */}
            {generation.metadata && (
              <MetadataSection metadata={generation.metadata} />
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
