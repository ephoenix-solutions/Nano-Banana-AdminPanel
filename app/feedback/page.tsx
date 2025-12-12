'use client';

import { useEffect, useState } from 'react';
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

        {/* Feedback Table */}
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
                {feedback.map((item) => (
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
                          className="px-3 py-1.5 text-sm font-medium text-primary bg-accent/20 hover:bg-accent/30 rounded-md transition-all"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
