import { Icons } from '@/config/icons';
import { Feedback } from '@/lib/types/feedback.types';

interface DeviceInfoSectionProps {
  feedback: Feedback;
}

export default function DeviceInfoSection({ feedback }: DeviceInfoSectionProps) {
  return (
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
  );
}
