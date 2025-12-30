import { Icons } from '@/config/icons';
import { Feedback } from '@/lib/types/feedback.types';

interface FeedbackHeaderProps {
  feedback: Feedback;
  renderRatingEmoji: (rating: number) => string;
  formatTimestamp: (timestamp: any) => string;
}

export default function FeedbackHeader({
  feedback,
  renderRatingEmoji,
  formatTimestamp,
}: FeedbackHeaderProps) {
  return (
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
  );
}
