import { Icons } from '@/config/icons';

interface PlanFeaturesProps {
  features: string[];
}

export default function PlanFeatures({ features }: PlanFeaturesProps) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-primary font-heading mb-4">
        Plan Features ({features.length})
      </h3>
      {features && features.length > 0 ? (
        <div className="bg-background rounded-lg p-6 border border-primary/10">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icons.check size={14} className="text-accent" />
                </div>
                <span className="text-base text-primary font-body flex-1">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-background rounded-lg p-8 border border-primary/10 text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.file size={32} className="text-accent" />
          </div>
          <p className="text-secondary font-body">No features added yet</p>
        </div>
      )}
    </div>
  );
}
