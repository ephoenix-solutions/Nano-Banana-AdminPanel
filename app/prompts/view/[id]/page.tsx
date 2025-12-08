'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { getPromptById } from '@/lib/services/prompt.service';
import { getAllCategories } from '@/lib/services/category.service';
import { Prompt } from '@/lib/types/prompt.types';
import { Category } from '@/lib/types/category.types';
import { Timestamp } from 'firebase/firestore';

export default function ViewPromptPage() {
  const router = useRouter();
  const params = useParams();
  const promptId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchData();
  }, [promptId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promptData, categoriesData] = await Promise.all([
        getPromptById(promptId),
        getAllCategories(),
      ]);

      setCategories(categoriesData);

      if (promptData) {
        setPrompt(promptData);
      } else {
        setError('Prompt not found');
      }
    } catch (err) {
      console.error('Error fetching prompt:', err);
      setError('Failed to load prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/prompts');
  };

  const handleEdit = () => {
    router.push(`/prompts/edit/${promptId}`);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    const subcategory = category?.subcategories?.find(
      (s) => s.id === subcategoryId
    );
    return subcategory?.name || 'Unknown';
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
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
            <div className="flex items-start gap-6">
              {/* Prompt Image */}
              <div className="relative flex-shrink-0">
                {prompt.url ? (
                  <div className="relative group">
                    <img
                      src={prompt.url}
                      alt="Prompt preview"
                      className="w-64 h-64 rounded-lg object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-64 h-64 rounded-lg bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <Icons.images size={64} className="text-accent" />
                    </div>
                    {/* Hover overlay to view full image */}
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Icons.images size={48} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-64 h-64 rounded-lg bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center">
                    <Icons.images size={64} className="text-accent" />
                  </div>
                )}
              </div>

              {/* Prompt Basic Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-primary font-heading mb-4">
                  Prompt Text
                </h2>
                <p className="text-base text-primary font-body mb-6 leading-relaxed">
                  {prompt.prompt}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {prompt.isTrending && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent text-primary">
                      <Icons.chart size={16} className="mr-2" />
                      Trending
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-primary">
                    <Icons.check size={16} className="mr-2" />
                    {prompt.likes} likes
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-primary">
                    <Icons.search size={16} className="mr-2" />
                    {prompt.searchCount} searches
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Section */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-primary font-heading mb-6">
              Prompt Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prompt ID */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.file size={20} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Prompt ID</p>
                    <p className="text-base font-semibold text-primary font-body break-all">
                      {prompt.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.categories size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-secondary font-body mb-1">Category</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {getCategoryName(prompt.categoryId)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subcategory */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.file size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Subcategory</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {getSubcategoryName(prompt.categoryId, prompt.subCategoryId)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trending Status */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.chart size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Trending Status</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {prompt.isTrending ? 'Yes - Trending' : 'No - Not Trending'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Likes */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.check size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Total Likes</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {prompt.likes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Count */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.search size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Search Count</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {prompt.searchCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Created At */}
              <div className="bg-background rounded-lg p-4 border border-primary/10 md:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.clock size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Created At</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {formatTimestamp(prompt.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt Text Section */}
            <div className="mt-6">
              <h3 className="text-xl font-bold text-primary font-heading mb-4">
                Full Prompt Text
              </h3>
              <div className="bg-background rounded-lg p-6 border border-primary/10">
                <p className="text-base text-primary font-body leading-relaxed whitespace-pre-wrap">
                  {prompt.prompt}
                </p>
              </div>
            </div>

            {/* Image URL Section */}
            {prompt.url && (
              <div className="mt-6">
                <h3 className="text-xl font-bold text-primary font-heading mb-4">
                  Generated Image
                </h3>
                <div className="bg-background rounded-lg p-4 border border-primary/10">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icons.images size={20} className="text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary font-body mb-2">Image URL</p>
                      <p className="text-sm text-primary font-body break-all mb-3">
                        {prompt.url}
                      </p>
                      <a
                        href={prompt.url}
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={handleBack}
            className="px-6 py-3 text-sm font-medium text-primary bg-background hover:bg-primary/5 rounded-lg transition-all border border-primary/10"
          >
            Back to Prompts
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
          >
            <Icons.edit size={20} />
            <span>Edit Prompt</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
