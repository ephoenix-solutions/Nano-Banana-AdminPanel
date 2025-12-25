'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { getUserById } from '@/lib/services/user.service';
import { getUserSaves } from '@/lib/services/save.service';
import { getPromptById } from '@/lib/services/prompt.service';
import { User } from '@/lib/types/user.types';
import { Prompt } from '@/lib/types/prompt.types';
import { Timestamp } from 'firebase/firestore';

export default function ViewUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([]);
  const [loadingSavedPrompts, setLoadingSavedPrompts] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(userId);
      if (userData) {
        setUser(userData);
        // Fetch saved prompts
        await fetchSavedPrompts(userId);
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

  const fetchSavedPrompts = async (userId: string) => {
    try {
      setLoadingSavedPrompts(true);
      console.log('Fetching saves for userId:', userId);
      const saves = await getUserSaves(userId);
      console.log('Saves data:', saves);
      
      if (saves && saves.promptIds && saves.promptIds.length > 0) {
        console.log('Found', saves.promptIds.length, 'saved prompt IDs:', saves.promptIds);
        // Fetch all saved prompts
        const promptsData = await Promise.all(
          saves.promptIds.map(async (promptId) => {
            try {
              console.log('Fetching prompt:', promptId);
              const prompt = await getPromptById(promptId);
              console.log('Prompt data:', prompt);
              return prompt;
            } catch (err) {
              console.error(`Error fetching prompt ${promptId}:`, err);
              return null;
            }
          })
        );
        
        // Filter out null values (prompts that failed to load or were deleted)
        const validPrompts = promptsData.filter((p): p is Prompt => p !== null);
        console.log('Valid prompts:', validPrompts.length, validPrompts);
        setSavedPrompts(validPrompts);
      } else {
        console.log('No saved prompts found for user');
        setSavedPrompts([]);
      }
    } catch (err) {
      console.error('Error fetching saved prompts:', err);
      setSavedPrompts([]);
    } finally {
      setLoadingSavedPrompts(false);
    }
  };

  const handleBack = () => {
    router.push('/users');
  };

  const handleEdit = () => {
    router.push(`/users/edit/${userId}`);
  };

  const handleViewPrompt = (promptId: string) => {
    router.push(`/prompts/view/${promptId}`);
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
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    user.role === 'admin' 
                      ? 'bg-secondary/20 text-secondary' 
                      : 'bg-accent/20 text-primary'
                  }`}>
                    <Icons.users size={16} className="mr-2" />
                    {user.role || 'user'}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    user.provider.toLowerCase() === 'google' 
                      ? 'bg-accent-100 text-accent-700'
                      : user.provider.toLowerCase() === 'apple' || user.provider.toLowerCase() === 'ios'
                      ? 'bg-primary-100 text-primary-700'
                      : user.provider.toLowerCase() === 'manual'
                      ? 'bg-secondary-100 text-secondary-700'
                      : 'bg-accent/20 text-primary'
                  }`}>
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

              {/* Role */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    user.role === 'admin' ? 'bg-secondary/20' : 'bg-accent/20'
                  }`}>
                    <Icons.users size={20} className={user.role === 'admin' ? 'text-secondary' : 'text-accent'} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">User Role</p>
                    <p className="text-base font-semibold text-primary font-body capitalize">
                      {user.role || 'user'}
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

              {/* Saved Prompts Count */}
              <div className="bg-background rounded-lg p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icons.bookmark size={20} className="text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-secondary font-body mb-1">Saved Prompts</p>
                    <p className="text-base font-semibold text-primary font-body">
                      {savedPrompts.length} {savedPrompts.length === 1 ? 'prompt' : 'prompts'}
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

        {/* Saved Prompts Section */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          <div className="p-6 border-b border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-primary font-heading flex items-center gap-2">
                  <Icons.bookmark size={24} className="text-accent" />
                  Saved Prompts
                </h3>
                <p className="text-sm text-secondary mt-1">
                  {savedPrompts.length} {savedPrompts.length === 1 ? 'prompt' : 'prompts'} saved by this user
                </p>
              </div>
            </div>
          </div>

          <div className="">
            {loadingSavedPrompts ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              </div>
            ) : savedPrompts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-background border-b border-primary/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                        Image
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                        Tags
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                        Trending
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                        Likes
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                        Searches
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedPrompts.map((prompt, index) => (
                      <tr
                        key={prompt.id}
                        className={`transition-colors ${
                          index % 2 === 0
                            ? 'bg-white hover:bg-background-200'
                            : 'bg-background hover:bg-background-300'
                        }`}
                      >
                        {/* Image Column */}
                        <td className="px-6 py-4 ">
                          {prompt.url ? (
                            <img
                              src={prompt.url}
                              alt="Prompt preview"
                              className="w-24 h-16 rounded-lg object-cover border border-primary/10"
                              onError={(e) => {
                                e.currentTarget.src = '';
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-24 h-16 rounded-lg bg-background border border-primary/10 flex items-center justify-center">
                              <Icons.images size={24} className="text-secondary/50" />
                            </div>
                          )}
                        </td>

                        {/* Title Column */}
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-primary font-semibold">
                              {prompt.title || 'Untitled'}
                            </p>
                          </div>
                        </td>

                        {/* Tags Column */}
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {prompt.tags && prompt.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {prompt.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-primary"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {prompt.tags.length > 2 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/20 text-primary">
                                    +{prompt.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-secondary/50">No tags</span>
                            )}
                          </div>
                        </td>

                        {/* Trending Column */}
                        <td className="px-6 py-4">
                          {prompt.isTrending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-accent text-primary">
                              <Icons.chart size={12} />
                              Trending
                            </span>
                          ) : (
                            <span className="text-sm text-secondary/50">-</span>
                          )}
                        </td>

                        {/* Likes Column */}
                        <td className="px-6 py-4 text-sm text-primary">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
                            {prompt.likes}
                          </span>
                        </td>

                        {/* Searches Column */}
                        <td className="px-6 py-4 text-sm text-primary">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-secondary/20 text-primary">
                            {prompt.searchCount || 0}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewPrompt(prompt.id)}
                              className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                              title="View Prompt"
                            >
                              <Icons.eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Icons.bookmark size={48} className="text-secondary/30 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-primary mb-2">No Saved Prompts</h4>
                <p className="text-secondary text-sm">
                  This user hasn't saved any prompts yet.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
