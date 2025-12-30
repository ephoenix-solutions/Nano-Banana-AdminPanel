import { Icons } from '@/config/icons';
import { Feedback } from '@/lib/types/feedback.types';

interface StatsCardsProps {
  feedback: Feedback[];
  getAverageRating: () => string;
  getRatingCount: (rating: number) => number;
}

export default function StatsCards({
  feedback,
  getAverageRating,
  getRatingCount,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total Feedback */}
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

      {/* Average Rating */}
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

      {/* 5 Star Count */}
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

      {/* Low Rating Count (1-2 stars) */}
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
  );
}
