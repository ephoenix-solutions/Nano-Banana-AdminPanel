'use client';

import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Icons } from '@/config/icons';
import { useFeedbackDetails } from '@/lib/hooks/useFeedbackDetails';
import { Timestamp } from 'firebase/firestore';

// Import view components
import FeedbackHeader from '@/components/feedback/view/FeedbackHeader';
import UserInfoSection from '@/components/feedback/view/UserInfoSection';
import MessageSection from '@/components/feedback/view/MessageSection';
import RatingDetailsSection from '@/components/feedback/view/RatingDetailsSection';
import DeviceInfoSection from '@/components/feedback/view/DeviceInfoSection';

export default function ViewFeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const feedbackId = params.id as string;

  const { loading, error, feedback, user } = useFeedbackDetails(feedbackId);

  const handleBack = () => {
    router.push('/feedback');
  };

  const formatTimestamp = (timestamp: Timestamp): string => {
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

  const renderRatingEmoji = (rating: number): string => {
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
          {/* Feedback Header Section */}
          <FeedbackHeader
            feedback={feedback}
            renderRatingEmoji={renderRatingEmoji}
            formatTimestamp={formatTimestamp}
          />

          {/* Detailed Information Section */}
          <div className="p-8">
            {/* User Information */}
            <UserInfoSection user={user} />

            {/* Feedback Message */}
            <MessageSection feedback={feedback} />

            {/* Rating Details */}
            <RatingDetailsSection
              feedback={feedback}
              renderRatingEmoji={renderRatingEmoji}
              formatTimestamp={formatTimestamp}
            />

            {/* Device Information */}
            <DeviceInfoSection feedback={feedback} />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
