'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { getAllUsers, getUserById } from '@/lib/services/user.service';
import { getAllCategories } from '@/lib/services/category.service';
import { getAllPrompts } from '@/lib/services/prompt.service';
import { getAllSubscriptionPlans } from '@/lib/services/subscription-plan.service';
import { getAllUserSubscriptions } from '@/lib/services/user-subscription.service';
import { getAllFeedback, getAverageRating } from '@/lib/services/feedback.service';
import { getAppSettings } from '@/lib/services/app-settings.service';
import { getAllCountries } from '@/lib/services/country.service';
import { getAllUserGenerations } from '@/lib/services/user-generation.service';
import UserLoginActivityChart from '@/components/dashboard/UserLoginActivityChart';
import CategorySearchChart from '@/components/dashboard/CategorySearchChart';
import PromptsAnalyticsChart from '@/components/dashboard/PromptsAnalyticsChart';
import GenerationStatsChart from '@/components/dashboard/GenerationStatsChart';
import { processUserLoginData, processCategorySearchData, processPromptsAnalyticsData, processGenerationData } from '@/lib/utils/dashboardChartUtils';

interface DashboardStats {
  users: {
    total: number;
    google: number;
    apple: number;
    activeToday: number;
  };
  categories: {
    total: number;
    subcategories: number;
    totalSearches: number;
  };
  prompts: {
    total: number;
    trending: number;
    totalLikes: number;
    totalSearches: number;
  };
  subscriptionPlans: {
    total: number;
    active: number;
  };
  userSubscriptions: {
    total: number;
    active: number;
    expired: number;
  };
  feedback: {
    total: number;
    averageRating: number;
    fiveStars: number;
    oneStar: number;
  };
  countries: {
    total: number;
    withCategories: number;
  };
  appSettings: {
    minimumVersion: string;
    liveVersion: string;
    languagesCount: number;
  };
}

interface RecentItem {
  id: string;
  name: string;
  email?: string;
  imageUrl?: string;
  createdAt: Date;
  additionalInfo?: string;
  rating?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, google: 0, apple: 0, activeToday: 0 },
    categories: { total: 0, subcategories: 0, totalSearches: 0 },
    prompts: { total: 0, trending: 0, totalLikes: 0, totalSearches: 0 },
    subscriptionPlans: { total: 0, active: 0 },
    userSubscriptions: { total: 0, active: 0, expired: 0 },
    feedback: { total: 0, averageRating: 0, fiveStars: 0, oneStar: 0 },
    countries: { total: 0, withCategories: 0 },
    appSettings: { minimumVersion: '', liveVersion: '', languagesCount: 0 },
  });

  const [recentUsers, setRecentUsers] = useState<RecentItem[]>([]);
  const [recentCategories, setRecentCategories] = useState<RecentItem[]>([]);
  const [recentPrompts, setRecentPrompts] = useState<RecentItem[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<RecentItem[]>([]);

  // Chart data states
  const [userLoginData, setUserLoginData] = useState<any>(null);
  const [categorySearchData, setCategorySearchData] = useState<any[]>([]);
  const [promptsAnalyticsData, setPromptsAnalyticsData] = useState<any>(null);
  const [generationData, setGenerationData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper function to safely fetch user name with validation
  const fetchUserName = async (userId: string | undefined | null): Promise<string> => {
    // Validate userId before calling getUserById
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return 'Unknown';
    }
    
    try {
      const user = await getUserById(userId);
      return user?.name || user?.email || 'Unknown';
    } catch (err) {
      console.error('Error fetching user:', err);
      return 'Unknown';
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        users,
        categories,
        prompts,
        plans,
        subscriptions,
        feedback,
        settings,
        countries,
        generations,
      ] = await Promise.all([
        getAllUsers(),
        getAllCategories(),
        getAllPrompts(),
        getAllSubscriptionPlans(),
        getAllUserSubscriptions(),
        getAllFeedback(),
        getAppSettings(),
        getAllCountries(),
        getAllUserGenerations(),
      ]);

      // Calculate average rating
      const avgRating = await getAverageRating();

      // Users stats
      const today = new Date();
      const usersStats = {
        total: users.length,
        google: users.filter((u) => u.provider === 'google').length,
        apple: users.filter((u) => u.provider === 'apple' || u.provider === 'ios').length,
        activeToday: users.filter((u) => {
          const lastLogin = u.lastLogin.toDate();
          return lastLogin.toDateString() === today.toDateString();
        }).length,
      };

      // Categories stats
      const subcategoriesCount = categories.reduce(
        (sum, cat) => sum + (cat.subcategories?.length || 0),
        0
      );
      const categoriesSearches = categories.reduce(
        (sum, cat) => sum + parseInt(String(cat.searchCount) || '0'),
        0
      );

      // Prompts stats
      const promptsStats = {
        total: prompts.length,
        trending: prompts.filter((p) => p.isTrending).length,
        totalLikes: prompts.reduce((sum, p) => sum + (p.likesCount || 0), 0),
        totalSearches: prompts.reduce((sum, p) => sum + p.searchCount, 0),
      };

      // Subscription plans stats
      const plansStats = {
        total: plans.length,
        active: plans.filter((p) => p.isActive).length,
      };

      // User subscriptions stats
      const now = new Date();
      const subscriptionsStats = {
        total: subscriptions.length,
        active: subscriptions.filter((s) => s.isActive).length,
        expired: subscriptions.filter((s) => {
          const endDate = s.endDate.toDate();
          return endDate < now;
        }).length,
      };

      // Feedback stats
      const feedbackStats = {
        total: feedback.length,
        averageRating: avgRating,
        fiveStars: feedback.filter((f) => f.rating === 5).length,
        oneStar: feedback.filter((f) => f.rating === 1).length,
      };

      // Countries stats
      const countriesStats = {
        total: countries.length,
        withCategories: countries.filter((c) => c.categories && c.categories.length > 0).length,
      };

      // App settings stats
      const settingsStats = {
        minimumVersion: settings?.minimumVersion || 'N/A',
        liveVersion: settings?.liveVersion || 'N/A',
        languagesCount: settings?.languagesSupported?.length || 0,
      };

      setStats({
        users: usersStats,
        categories: {
          total: categories.length,
          subcategories: subcategoriesCount,
          totalSearches: categoriesSearches,
        },
        prompts: promptsStats,
        subscriptionPlans: plansStats,
        userSubscriptions: subscriptionsStats,
        feedback: feedbackStats,
        countries: countriesStats,
        appSettings: settingsStats,
      });

      // Get recent items (last 5 of each)
      // Recent Users
      const sortedUsers = [...users]
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        })
        .slice(0, 5)
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          imageUrl: user.photoURL || '',
          createdAt: user.createdAt?.toDate ? user.createdAt.toDate() : new Date(),
          additionalInfo: user.provider,
        }));
      setRecentUsers(sortedUsers);

      // Recent Categories
      const sortedCategories = [...categories]
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        })
        .slice(0, 5);

      const categoriesWithCreator = await Promise.all(
        sortedCategories.map(async (cat) => {
          const creatorName = await fetchUserName(cat.createdBy);
          return {
            id: cat.id,
            name: cat.name,
            imageUrl: cat.iconImage || '',
            createdAt: cat.createdAt?.toDate ? cat.createdAt.toDate() : new Date(),
            additionalInfo: `By ${creatorName} • ${cat.subcategories?.length || 0} subcategories`,
          };
        })
      );
      setRecentCategories(categoriesWithCreator);

      // Recent Prompts
      const sortedPrompts = [...prompts]
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        })
        .slice(0, 5);

      const promptsWithCreator = await Promise.all(
        sortedPrompts.map(async (prompt) => {
          const creatorName = await fetchUserName(prompt.createdBy);
          return {
            id: prompt.id,
            name: prompt.title,
            imageUrl: prompt.url || '',
            createdAt: prompt.createdAt?.toDate ? prompt.createdAt.toDate() : new Date(),
            additionalInfo: `By ${creatorName} • ${prompt.likesCount || 0} likes`,
          };
        })
      );
      setRecentPrompts(promptsWithCreator);

      // Recent Feedback
      const sortedFeedback = [...feedback]
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        })
        .slice(0, 5);

      const feedbackWithUser = await Promise.all(
        sortedFeedback.map(async (fb) => {
          const userName = await fetchUserName(fb.userId);
          return {
            id: fb.id,
            name: fb.message.substring(0, 50) + (fb.message.length > 50 ? '...' : ''),
            createdAt: fb.createdAt?.toDate ? fb.createdAt.toDate() : new Date(),
            additionalInfo: `By ${userName} • ${fb.rating}`,
            rating: fb.rating,
          };
        })
      );
      setRecentFeedback(feedbackWithUser);

      // Process chart data
      const loginData = await processUserLoginData(users);
      setUserLoginData(loginData);

      const categoryData = processCategorySearchData(categories);
      setCategorySearchData(categoryData);

      const promptsData = processPromptsAnalyticsData(prompts);
      setPromptsAnalyticsData(promptsData);

      const genData = processGenerationData(generations);
      setGenerationData(genData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />

        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary font-heading">
            Nano Banana Admin Panel
          </h1>
          <p className="text-sm md:text-base text-secondary mt-2 font-body">
            Here's an overview of your application statistics
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error}</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-primary font-heading mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-background hover:bg-accent/10 transition-all border border-primary/10 hover:border-accent cursor-pointer"
            >
              <Icons.user size={20} className="md:w-6 md:h-6 text-accent" />
              <span className="text-xs md:text-sm font-medium text-primary font-body text-center">Profile</span>
            </button>
            <button
              onClick={() => router.push('/users/add')}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-background hover:bg-accent/10 transition-all border border-primary/10 hover:border-accent cursor-pointer"
            >
              <Icons.users size={20} className="md:w-6 md:h-6 text-accent" />
              <span className="text-xs md:text-sm font-medium text-primary font-body text-center">Add User</span>
            </button>
            <button
              onClick={() => router.push('/categories/add')}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-background hover:bg-accent/10 transition-all border border-primary/10 hover:border-accent cursor-pointer"
            >
              <Icons.categories size={20} className="md:w-6 md:h-6 text-accent" />
              <span className="text-xs md:text-sm font-medium text-primary font-body text-center">Add Category</span>
            </button>
            <button
              onClick={() => router.push('/prompts/add')}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-background hover:bg-accent/10 transition-all border border-primary/10 hover:border-accent cursor-pointer"
            >
              <Icons.images size={20} className="md:w-6 md:h-6 text-accent" />
              <span className="text-xs md:text-sm font-medium text-primary font-body text-center">Add Prompt</span>
            </button>
            <button
              onClick={() => router.push('/countries/add')}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-background hover:bg-accent/10 transition-all border border-primary/10 hover:border-accent cursor-pointer"
            >
              <Icons.globe size={20} className="md:w-6 md:h-6 text-accent" />
              <span className="text-xs md:text-sm font-medium text-primary font-body text-center">Add Country</span>
            </button>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="space-y-6">
          {/* User Login Activity Chart */}
          {userLoginData && (
            <UserLoginActivityChart data={userLoginData} />
          )}
          
          {/* Image Generation Analytics Chart */}
          {generationData && (
            <GenerationStatsChart data={generationData} />
          )}

          {/* Category Search and Prompts Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Search Chart */}
            {categorySearchData.length > 0 && (
              <CategorySearchChart data={categorySearchData} />
            )}

            {/* Prompts Analytics Chart */}
            {promptsAnalyticsData && (
              <PromptsAnalyticsChart data={promptsAnalyticsData} />
            )}
          </div>
        </div>

        {/* Combined Statistics and Recent Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Users Card with Recent Users */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Icons.users size={20} className="md:w-6 md:h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Recent Users</h2>
                  <p className="text-xs text-secondary">Total: {stats.users.total} • Active Today: {stats.users.activeToday}</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/users')}
                className="px-3 py-1.5 text-sm text-white bg-secondary hover:bg-secondary/90 rounded-lg font-medium transition-all cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="space-y-0 border border-primary/10 rounded-lg overflow-hidden">
              {recentUsers.length === 0 ? (
                <p className="text-secondary text-sm text-center py-4">No users yet</p>
              ) : (
                recentUsers.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-4 py-3 transition-colors ${
                      index % 2 === 0
                        ? 'bg-white hover:bg-background/50'
                        : 'bg-background hover:bg-background/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {item.imageUrl && item.imageUrl.trim() !== '' ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-full h-full bg-secondary flex items-center justify-center text-white font-semibold text-sm">${item.name.charAt(0).toUpperCase()}</div>`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center text-white font-semibold text-sm">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary truncate font-body">{item.name}</p>
                        <p className="text-xs text-secondary truncate font-body">{item.email}</p>
                        <p className="text-xs text-secondary/70 font-body mt-0.5">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/users/view/${item.id}`)}
                      className="ml-2 p-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all flex-shrink-0 cursor-pointer"
                      title="View User"
                    >
                      <Icons.eye size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Categories Card with Recent Categories */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Icons.categories size={20} className="md:w-6 md:h-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Recent Categories</h2>
                  <p className="text-xs text-secondary">Total: {stats.categories.total} • Subcategories: {stats.categories.subcategories}</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/categories')}
                className="px-3 py-1.5 text-sm text-white bg-secondary hover:bg-secondary/90 rounded-lg font-medium transition-all cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="space-y-0 border border-primary/10 rounded-lg overflow-hidden">
              {recentCategories.length === 0 ? (
                <p className="text-secondary text-sm text-center py-4">No categories yet</p>
              ) : (
                recentCategories.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-4 py-3 transition-colors ${
                      index % 2 === 0
                        ? 'bg-white hover:bg-background/50'
                        : 'bg-background hover:bg-background/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-accent/20 flex items-center justify-center flex-shrink-0">
                        {item.imageUrl && item.imageUrl.trim() !== '' ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '';
                                parent.className = 'relative w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0';
                                const icon = document.createElement('div');
                                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"></path></svg>';
                                parent.appendChild(icon.firstChild!);
                              }
                            }}
                          />
                        ) : (
                          <Icons.categories size={20} className="text-accent" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary truncate font-body">{item.name}</p>
                        <p className="text-xs text-secondary truncate font-body">{item.additionalInfo}</p>
                        <p className="text-xs text-secondary/70 font-body mt-0.5">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/categories/view/${item.id}`)}
                      className="ml-2 p-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all flex-shrink-0 cursor-pointer"
                      title="View Category"
                    >
                      <Icons.eye size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Prompts Card with Recent Prompts */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Icons.images size={20} className="md:w-6 md:h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Recent Prompts</h2>
                  <p className="text-xs text-secondary">Total: {stats.prompts.total} • Trending: {stats.prompts.trending}</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/prompts')}
                className="px-3 py-1.5 text-sm text-white bg-secondary hover:bg-secondary/90 rounded-lg font-medium transition-all cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="space-y-0 border border-primary/10 rounded-lg overflow-hidden">
              {recentPrompts.length === 0 ? (
                <p className="text-secondary text-sm text-center py-4">No prompts yet</p>
              ) : (
                recentPrompts.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-4 py-3 transition-colors ${
                      index % 2 === 0
                        ? 'bg-white hover:bg-background/50'
                        : 'bg-background hover:bg-background/70'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        {item.imageUrl && item.imageUrl.trim() !== '' ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '';
                                parent.className = 'relative w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0';
                                const icon = document.createElement('div');
                                icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>';
                                parent.appendChild(icon.firstChild!);
                              }
                            }}
                          />
                        ) : (
                          <Icons.images size={20} className="text-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary truncate font-body">{item.name}</p>
                        <p className="text-xs text-secondary truncate font-body">{item.additionalInfo}</p>
                        <p className="text-xs text-secondary/70 font-body mt-0.5">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/prompts/view/${item.id}`)}
                      className="ml-2 p-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all flex-shrink-0 cursor-pointer"
                      title="View Prompt"
                    >
                      <Icons.eye size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Feedback Card with Recent Feedback */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Icons.feedback size={20} className="md:w-6 md:h-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Recent Feedback</h2>
                  <p className="text-xs text-secondary flex items-center gap-1">Total: {stats.feedback.total} • Avg: {stats.feedback.averageRating.toFixed(1)} <Icons.star size={12} className="text-yellow-500 fill-yellow-500" /></p>
                </div>
              </div>
              <button
                onClick={() => router.push('/feedback')}
                className="px-3 py-1.5 text-sm text-white bg-secondary hover:bg-secondary/90 rounded-lg font-medium transition-all cursor-pointer"
              >
                View All
              </button>
            </div>
            <div className="space-y-0 border border-primary/10 rounded-lg overflow-hidden">
              {recentFeedback.length === 0 ? (
                <p className="text-secondary text-sm text-center py-4">No feedback yet</p>
              ) : (
                recentFeedback.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-4 py-3 transition-colors ${
                      index % 2 === 0
                        ? 'bg-white hover:bg-background/50'
                        : 'bg-background hover:bg-background/70'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary truncate font-body">{item.name}</p>
                      <p className="text-xs text-secondary truncate font-body flex items-center gap-1">
                        {item.additionalInfo}
                        {item.rating && (
                          <span className="inline-flex items-center">
                            <Icons.star size={12} className="text-yellow-500 fill-yellow-500" />
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-secondary/70 font-body mt-0.5">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/feedback/view/${item.id}`)}
                      className="ml-2 p-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all flex-shrink-0 cursor-pointer"
                      title="View Feedback"
                    >
                      <Icons.eye size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subscriptions Card */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Icons.subscriptionPlan size={20} className="md:w-6 md:h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Subscriptions</h2>
                  <p className="text-xs text-secondary">Plans: {stats.subscriptionPlans.total} • Active: {stats.subscriptionPlans.active}</p>
                </div>
              </div>
            </div>
            <div className="space-y-0 border border-primary/10 rounded-lg overflow-hidden">
              <div className="bg-white hover:bg-background/50 px-4 py-3 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary font-body">Total Plans</p>
                  <p className="text-lg font-bold text-primary font-body">{stats.subscriptionPlans.total}</p>
                </div>
              </div>
              <div className="bg-background hover:bg-background/70 px-4 py-3 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary font-body">Active Plans</p>
                  <p className="text-lg font-bold text-primary font-body">{stats.subscriptionPlans.active}</p>
                </div>
              </div>
              <div className="bg-white hover:bg-background/50 px-4 py-3 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary font-body">User Subscriptions</p>
                  <p className="text-lg font-bold text-primary font-body">{stats.userSubscriptions.total}</p>
                </div>
              </div>
              <div className="bg-background hover:bg-background/70 px-4 py-3 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary font-body">Active / Expired</p>
                  <p className="text-lg font-bold text-primary font-body">
                    {stats.userSubscriptions.active} / {stats.userSubscriptions.expired}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Countries & App Info Card */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Icons.globe size={20} className="md:w-6 md:h-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Countries & App Info</h2>
                  <p className="text-xs text-secondary">Countries: {stats.countries.total} • Languages: {stats.appSettings.languagesCount}</p>
                </div>
              </div>
            </div>
            <div className="space-y-0 border border-primary/10 rounded-lg overflow-hidden">
              <div className="bg-white hover:bg-background/50 px-4 py-3 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary font-body">Total Countries</p>
                  <p className="text-lg font-bold text-primary font-body">{stats.countries.total}</p>
                </div>
              </div>
              <div className="bg-background hover:bg-background/70 px-4 py-3 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary font-body">With Categories</p>
                  <p className="text-lg font-bold text-primary font-body">{stats.countries.withCategories}</p>
                </div>
              </div>
              <div className="bg-white hover:bg-background/50 px-4 py-3 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary font-body">Minimum Version</p>
                  <p className="text-lg font-bold text-primary font-body">{stats.appSettings.minimumVersion}</p>
                </div>
              </div>
              <div className="bg-background hover:bg-background/70 px-4 py-3 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary font-body">Live Version</p>
                  <p className="text-lg font-bold text-primary font-body">{stats.appSettings.liveVersion}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
