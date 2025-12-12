'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { getAllUsers } from '@/lib/services/user.service';
import { getAllCategories } from '@/lib/services/category.service';
import { getAllPrompts } from '@/lib/services/prompt.service';
import { getAllSubscriptionPlans } from '@/lib/services/subscription-plan.service';
import { getAllUserSubscriptions } from '@/lib/services/user-subscription.service';
import { getAllFeedback, getAverageRating } from '@/lib/services/feedback.service';
import { getAppSettings } from '@/lib/services/app-settings.service';
import { getAllCountries } from '@/lib/services/country.service';

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      ] = await Promise.all([
        getAllUsers(),
        getAllCategories(),
        getAllPrompts(),
        getAllSubscriptionPlans(),
        getAllUserSubscriptions(),
        getAllFeedback(),
        getAppSettings(),
        getAllCountries(),
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
        totalLikes: prompts.reduce((sum, p) => sum + p.likes, 0),
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <button
              onClick={() => router.push('/users/add')}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-background hover:bg-accent/10 transition-all border border-primary/10 hover:border-accent"
            >
              <Icons.users size={20} className="md:w-6 md:h-6 text-accent" />
              <span className="text-xs md:text-sm font-medium text-primary font-body text-center">Add User</span>
            </button>
            <button
              onClick={() => router.push('/categories/add')}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-background hover:bg-accent/10 transition-all border border-primary/10 hover:border-accent"
            >
              <Icons.categories size={20} className="md:w-6 md:h-6 text-accent" />
              <span className="text-xs md:text-sm font-medium text-primary font-body text-center">Add Category</span>
            </button>
            <button
              onClick={() => router.push('/prompts/add')}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-background hover:bg-accent/10 transition-all border border-primary/10 hover:border-accent"
            >
              <Icons.images size={20} className="md:w-6 md:h-6 text-accent" />
              <span className="text-xs md:text-sm font-medium text-primary font-body text-center">Add Prompt</span>
            </button>
            <button
              onClick={() => router.push('/countries/add')}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-background hover:bg-accent/10 transition-all border border-primary/10 hover:border-accent"
            >
              <Icons.globe size={20} className="md:w-6 md:h-6 text-accent" />
              <span className="text-xs md:text-sm font-medium text-primary font-body text-center">Add Country</span>
            </button>
          </div>
        </div>

        {/* Combined Statistics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Users Card */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-primary/10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.users size={20} className="md:w-6 md:h-6 text-accent" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Users</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Total Users</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.users.total}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Active Today</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.users.activeToday}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Google Users</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.users.google}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Apple Users</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.users.apple}</p>
              </div>
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-primary/10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.categories size={20} className="md:w-6 md:h-6 text-secondary" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Categories</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Total Categories</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.categories.total}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Subcategories</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.categories.subcategories}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs md:text-sm text-secondary font-body">Total Searches</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.categories.totalSearches}</p>
              </div>
            </div>
          </div>

          {/* Prompts Card */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-primary/10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.images size={20} className="md:w-6 md:h-6 text-accent" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Prompts</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Total Prompts</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.prompts.total}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Trending</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.prompts.trending}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Total Likes</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.prompts.totalLikes}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Total Searches</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.prompts.totalSearches}</p>
              </div>
            </div>
          </div>

          {/* Subscriptions Card (Plans + User Subscriptions) */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-primary/10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.subscriptionPlan size={20} className="md:w-6 md:h-6 text-secondary" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Subscriptions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Total Plans</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.subscriptionPlans.total}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Active Plans</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.subscriptionPlans.active}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">User Subscriptions</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.userSubscriptions.total}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Active / Expired</p>
                <p className="text-lg md:text-2xl font-bold text-primary font-body mt-1">
                  {stats.userSubscriptions.active} / {stats.userSubscriptions.expired}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-primary/10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.feedback size={20} className="md:w-6 md:h-6 text-accent" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Feedback</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Total Feedback</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.feedback.total}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Average Rating</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.feedback.averageRating.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">5-Star Ratings</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.feedback.fiveStars}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">1-Star Ratings</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.feedback.oneStar}</p>
              </div>
            </div>
          </div>

          {/* Countries & App Info Card */}
          <div className="bg-white rounded-lg border border-primary/10 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-primary/10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.globe size={20} className="md:w-6 md:h-6 text-secondary" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-primary font-heading">Countries & App Info</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Total Countries</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.countries.total}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">With Categories</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.countries.withCategories}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Minimum Version</p>
                <p className="text-lg md:text-xl font-bold text-primary font-body mt-1">{stats.appSettings.minimumVersion}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Live Version</p>
                <p className="text-lg md:text-xl font-bold text-primary font-body mt-1">{stats.appSettings.liveVersion}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-secondary font-body">Languages</p>
                <p className="text-xl md:text-2xl font-bold text-primary font-body mt-1">{stats.appSettings.languagesCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}