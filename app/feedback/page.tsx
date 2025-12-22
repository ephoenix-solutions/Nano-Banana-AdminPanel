'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import ConfirmModal from '@/components/ConfirmModal';
import { Icons } from '@/config/icons';
import { Feedback } from '@/lib/types/feedback.types';
import { getAllFeedback, deleteFeedback } from '@/lib/services/feedback.service';
import { getUserById } from '@/lib/services/user.service';
import { User } from '@/lib/types/user.types';
import { Timestamp } from 'firebase/firestore';

type SortField = 'createdAt' | 'rating';
type SortOrder = 'asc' | 'desc';
type RatingFilter = 'all' | '1' | '2' | '3' | '4' | '5';

export default function FeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    feedback: Feedback | null;
  }>({
    isOpen: false,
    feedback: null,
  });

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllFeedback();
      setFeedback(data);
      
      // Fetch user data for each unique userId
      const uniqueUserIds = [...new Set(data.map(f => f.userId))];
      const userDataMap: Record<string, User> = {};
      
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const user = await getUserById(userId);
            if (user) {
              userDataMap[userId] = user;
            }
          } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
          }
        })
      );
      
      setUsers(userDataMap);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (item: Feedback) => {
    setDeleteModal({
      isOpen: true,
      feedback: item,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.feedback) return;

    try {
      await deleteFeedback(deleteModal.feedback.id);
      await fetchFeedback();
    } catch (err) {
      console.error('Error deleting feedback:', err);
      setError('Failed to delete feedback');
    }
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderStars = (rating: number) => {
    const emojis = ["😡", "😕", "😐", "🙂", "🥰"];
    const emoji = emojis[rating - 1] || "😐";
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <span className="text-sm font-semibold text-primary">
          {rating}/5
        </span>
      </div>
    );
  };

  const getAverageRating = () => {
    if (feedback.length === 0) return 0;
    const total = feedback.reduce((sum, f) => sum + f.rating, 0);
    return (total / feedback.length).toFixed(1);
  };

  const getRatingCount = (rating: number) => {
    return feedback.filter((f) => f.rating === rating).length;
  };

  // Filter and Sort Feedback
  const filteredAndSortedFeedback = useMemo(() => {
    let filtered = [...feedback];

    // Search filter (user name, email, or message)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        // Check message
        if (item.message.toLowerCase().includes(query)) return true;
        // Check user name and email
        const user = users[item.userId];
        if (user) {
          if (user.name.toLowerCase().includes(query)) return true;
          if (user.email.toLowerCase().includes(query)) return true;
        }
        return false;
      });
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const targetRating = parseInt(ratingFilter);
      filtered = filtered.filter((item) => item.rating === targetRating);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'createdAt') {
        aValue = a.createdAt.toDate().getTime();
        bValue = b.createdAt.toDate().getTime();
      } else {
        aValue = a.rating;
        bValue = b.rating;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [feedback, searchQuery, sortField, sortOrder, ratingFilter, users]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSortField('createdAt');
    setSortOrder('desc');
    setRatingFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      sortField !== 'createdAt' ||
      sortOrder !== 'desc' ||
      ratingFilter !== 'all'
    );
  }, [searchQuery, sortField, sortOrder, ratingFilter]);

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
        <Breadcrumbs items={[{ label: 'Feedback' }]} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Feedback
            </h1>
            <p className="text-secondary mt-2 font-body">
              User feedback and ratings
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg border border-primary/10 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.search size={20} className="text-secondary" />
                </div>
                <input
                  type="text"
                  placeholder="Search by user name, email, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary placeholder-secondary/50"
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg font-semibold transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-accent/20 border-accent text-primary'
                  : 'border-primary/20 text-secondary hover:bg-accent/10'
              }`}
            >
              <Icons.filter size={20} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-accent text-primary text-xs rounded-full font-bold">
                  {[
                    searchQuery.trim() !== '',
                    ratingFilter !== 'all',
                    sortField !== 'createdAt' || sortOrder !== 'desc',
                  ].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 border border-secondary/20 text-secondary rounded-lg font-semibold hover:bg-secondary/10 transition-all"
              >
                <Icons.close size={20} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-primary/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-primary font-body mb-2">
                  Sort By
                </label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
                >
                  <option value="createdAt">Date</option>
                  <option value="rating">Rating</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-semibold text-primary font-body mb-2">
                  Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-semibold text-primary font-body mb-2">
                  Rating
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value as RatingFilter)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars (🥰)</option>
                  <option value="4">4 Stars (🙂)</option>
                  <option value="3">3 Stars (😐)</option>
                  <option value="2">2 Stars (😕)</option>
                  <option value="1">1 Star (😡)</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-primary/10">
            <p className="text-sm text-secondary font-body">
              Showing <span className="font-semibold text-primary">{filteredAndSortedFeedback.length}</span> of{' '}
              <span className="font-semibold text-primary">{feedback.length}</span> feedback
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Total Feedback
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {feedback.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.feedback size={24} className="text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">
                  Average Rating
                </p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {getAverageRating()}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.check size={24} className="text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">5 Star</p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {getRatingCount(5)}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Icons.check size={24} className="text-accent fill-accent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-primary/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body">1-2 Star</p>
                <p className="text-3xl font-bold text-primary font-heading mt-1">
                  {getRatingCount(1) + getRatingCount(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icons.alert size={24} className="text-secondary" />
              </div>
            </div>
          </div>
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

        {/* Feedback Table - Only show if there are results OR if loading */}
        {(loading || filteredAndSortedFeedback.length > 0) && (
          <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-primary/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Message
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      OS & Version
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Model
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {filteredAndSortedFeedback.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-background/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {users[item.userId] ? (
                          <>
                            <span className="text-sm font-medium text-primary">
                              {users[item.userId].name}
                            </span>
                            <span className="text-xs text-secondary">
                              {users[item.userId].email}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-secondary font-mono">
                            {item.userId.substring(0, 8)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm text-primary line-clamp-2">
                          {item.message}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{renderStars(item.rating)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {item.deviceInfo?.os ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
                            {item.deviceInfo.os}
                          </span>
                        ) : null}
                        {item.deviceInfo?.appVersion ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
                            {item.deviceInfo.appVersion}
                          </span>
                        ) : null}
                        {!item.deviceInfo?.os && !item.deviceInfo?.appVersion && (
                          <span className="text-sm text-secondary">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {item.deviceInfo?.model ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary">
                            {item.deviceInfo.model}
                          </span>
                        ) : (
                          <span className="text-sm text-secondary">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-primary">
                      {formatTimestamp(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/feedback/view/${item.id}`)}
                          className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
                          title="View"
                        >
                          <Icons.eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Icons.trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results Message - Show when filters are active but no matches */}
        {!loading && filteredAndSortedFeedback.length === 0 && feedback.length > 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.search size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No feedback found</h3>
            <p className="text-secondary mb-4">
              No feedback matches your current filters. Try adjusting your search or filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* No Data Message - Show when database is truly empty */}
        {!loading && feedback.length === 0 && (
          <div className="bg-white rounded-lg border border-primary/10 p-12 text-center">
            <Icons.feedback size={48} className="text-secondary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No feedback yet</h3>
            <p className="text-secondary mb-4">
              There is no user feedback in the system yet.
            </p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, feedback: null })}
          onConfirm={handleDeleteConfirm}
          title="Delete Feedback"
          message="Are you sure you want to delete this feedback? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </AdminLayout>
  );
}
