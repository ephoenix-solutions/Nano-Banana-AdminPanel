import { Icons } from '@/config/icons';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';

interface PlanHeaderProps {
  plan: SubscriptionPlan;
}

export default function PlanHeader({ plan }: PlanHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-8 border-b border-primary/10">
      <div className="flex items-center gap-6">
        {/* Plan Icon */}
        <div className="w-32 h-32 rounded-lg bg-accent/20 border-4 border-white shadow-lg flex items-center justify-center">
          <Icons.subscriptionPlan size={64} className="text-accent" />
        </div>

        {/* Plan Basic Info */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-primary font-heading mb-2">
            {plan.name}
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-4xl font-bold text-accent font-body">
              {plan.currency} {plan.price}
            </span>
            <span className="text-lg text-secondary font-body">
              / {plan.durationDays} days
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              plan.isActive 
                ? 'bg-accent text-primary' 
                : 'bg-secondary/20 text-secondary'
            }`}>
              {plan.isActive ? (
                <>
                  <Icons.check size={16} className="mr-2" />
                  Active
                </>
              ) : (
                <>
                  <Icons.close size={16} className="mr-2" />
                  Inactive
                </>
              )}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-primary">
              <Icons.file size={16} className="mr-2" />
              Order: {plan.order}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-primary">
              <Icons.check size={16} className="mr-2" />
              {plan.generationLimit} generations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
