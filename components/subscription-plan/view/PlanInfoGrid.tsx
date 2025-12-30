import { Icons } from '@/config/icons';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';

interface PlanInfoGridProps {
  plan: SubscriptionPlan;
  creatorName: string;
  creatorPhoto: string;
  updaterName: string;
  updaterPhoto: string;
  formatTimestamp: (timestamp: any) => string;
}

export default function PlanInfoGrid({
  plan,
  creatorName,
  creatorPhoto,
  updaterName,
  updaterPhoto,
  formatTimestamp,
}: PlanInfoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Plan ID */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.subscriptionPlan size={20} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary font-body mb-1">Plan ID</p>
            <p className="text-base font-semibold text-primary font-body break-all">
              {plan.id}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Name */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.file size={20} className="text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary font-body mb-1">Plan Name</p>
            <p className="text-base font-semibold text-primary font-body">
              {plan.name}
            </p>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.subscriptionPlan size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Price</p>
            <p className="text-base font-semibold text-primary font-body">
              {plan.currency} {plan.price}
            </p>
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.globe size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Currency</p>
            <p className="text-base font-semibold text-primary font-body">
              {plan.currency}
            </p>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.clock size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Duration</p>
            <p className="text-base font-semibold text-primary font-body">
              {plan.durationDays} days
            </p>
          </div>
        </div>
      </div>

      {/* Generation Limit */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.images size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Generation Limit</p>
            <p className="text-base font-semibold text-primary font-body">
              {plan.generationLimit} generations
            </p>
          </div>
        </div>
      </div>

      {/* Display Order */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.file size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Display Order</p>
            <p className="text-base font-semibold text-primary font-body">
              {plan.order}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.check size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Status</p>
            <p className="text-base font-semibold text-primary font-body">
              {plan.isActive ? 'Active - Visible to users' : 'Inactive - Hidden from users'}
            </p>
          </div>
        </div>
      </div>

      {/* Created By */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {creatorPhoto ? (
              <img
                src={creatorPhoto}
                alt={creatorName}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center"
              style={{ display: creatorPhoto ? 'none' : 'flex' }}
            >
              <Icons.users size={20} className="text-accent" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Created By</p>
            <p className="text-base font-semibold text-primary font-body">
              {creatorName}
            </p>
            {plan.createdAt && (
              <p className="text-xs text-secondary font-body mt-1">
                {formatTimestamp(plan.createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Updated By */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {plan.updatedBy && updaterPhoto ? (
              <img
                src={updaterPhoto}
                alt={updaterName}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center"
              style={{ display: (plan.updatedBy && updaterPhoto) ? 'none' : 'flex' }}
            >
              <Icons.users size={20} className="text-secondary" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Updated By</p>
            {plan.updatedBy ? (
              <>
                <p className="text-base font-semibold text-primary font-body">
                  {updaterName}
                </p>
                {plan.updatedAt && (
                  <p className="text-xs text-secondary font-body mt-1">
                    {formatTimestamp(plan.updatedAt)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-base text-secondary font-body italic">
                Not updated yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
