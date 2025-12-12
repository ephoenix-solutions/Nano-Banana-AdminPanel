'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { getFeedbackById } from '@/lib/services/feedback.service';
import { getUserById } from '@/lib/services/user.service';
import { Feedback } from '@/lib/types/feedback.types';
import { User } from '@/lib/types/user.types';
import { Timestamp } from 'firebase/firestore';

export default function ViewFeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, [feedbackId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const feedbackData = await getFeedbackById(feedbackId);
      if (feedbackData) {
        setFeedback(feedbackData);
        
        // Fetch user data
        try {
          const userData = await getUserById(feedbackData.userId);
          if (userData) {
            setUser(userData);
          }
        } catch (err) {
          console.error('Error fetching user:', err);
        }
      } else {
        setError('Feedback not found');
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/feedback');
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

  const renderRatingEmoji = (rating: number) => {
    const emojis = ["😡", "😕", "😐", "🙂", "🥰"];
    return emojis[rating - 1] || "😐";
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

  if (error || !feedback) {
    return (
      <AdminLayout>
        <div className="w-full">
          <Breadcrumbs 
            items={[
              { label: 'Feedback', href: '/feedback' },
              { label: 'View Feedback' }
            ]} 
          />
          <div className="bg-secondary/10 border border-secondary rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <Icons.alert size={20} className="text-secondary" />
              <p className="text-secondary font-body">{error || 'Feedback not found'}</p>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-background text-primary rounded-lg font-semibold hover:bg-primary/5 transition-all border border-primary/10"
          >
            <Icons.arrowLeft size={20} />
            <span>Back to Feedback</span>
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
            { label: 'Feedback', href: '/feedback' },
            { label: 'View Feedback' }
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
              <span className="font-body text-sm">Back to Feedback</span>
            </button>
            <h1 className="text-4xl font-bold text-primary font-heading">
              Feedback Details
            </h1>
            <p className="text-secondary mt-2 font-body">
              View feedback information
            </p>
          </div>
        </div>

        {/* Feedback Details Card */}
        <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
          {/* Rating Header Section */}
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
            <div className="flex items-center gap-6">
              {/* Rating Display */}
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-6xl">
                  {renderRatingEmoji(feedback.rating)}
                </span>
              </div>

              {/* Feedback Basic Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-primary font-heading mb-2">
                  Rating: {feedback.rating}/5
                </h2>
                <p className="text-lg text-secondary font-body mb-3">
                  Submitted on {formatTimestamp(feedback.createdAt)}
                </p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-primary">
                    <Icons.feedback size={16} className="mr-2" />
                    Feedback ID: {feedback.id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Section */}
          <div className="p-8">
            {/* User Information */}
            {user && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-primary font-heading mb-6">
                  User Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Name */}
                  <div className="bg-background rounded-lg p-4 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icons.users size={20} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary font-body mb-1">User Name</p>
                        <p className="text-base font-semibold text-primary font-body">
                          {user.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Email */}
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
                </div>
              </div>
            )}

            {/* Feedback Message */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-primary font-heading mb-4">
                Feedback Message
              </h3>
              <div className="bg-background rounded-lg p-6 border border-primary/10">
                <p className="text-base text-primary font-body leading-relaxed whitespace-pre-wrap">
                  {feedback.message}
                </p>
              </div>
            </div>

            {/* Rating Details */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-primary font-heading mb-6">
                Rating Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rating Score */}
                <div className="bg-background rounded-lg p-4 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icons.check size={20} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-secondary font-body mb-1">Rating Score</p>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{renderRatingEmoji(feedback.rating)}</span>
                        <span className="text-2xl font-bold text-primary font-body">
                          {feedback.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submitted Date */}
                <div className="bg-background rounded-lg p-4 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icons.clock size={20} className="text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-secondary font-body mb-1">Submitted On</p>
                      <p className="text-base font-semibold text-primary font-body">
                        {formatTimestamp(feedback.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div>
              <h3 className="text-xl font-bold text-primary font-heading mb-6">
                Device Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Operating System */}
                <div className="bg-background rounded-lg p-4 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icons.globe size={20} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-secondary font-body mb-1">Operating System</p>
                      <p className="text-base font-semibold text-primary font-body capitalize">
                        {feedback.deviceInfo?.os || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Device Model */}
                <div className="bg-background rounded-lg p-4 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icons.globe size={20} className="text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-secondary font-body mb-1">Device Model</p>
                      <p className="text-base font-semibold text-primary font-body">
                        {feedback.deviceInfo?.model || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* App Version */}
                <div className="bg-background rounded-lg p-4 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icons.check size={20} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-secondary font-body mb-1">App Version</p>
                      <p className="text-base font-semibold text-primary font-body">
                        {feedback.deviceInfo?.appVersion || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
