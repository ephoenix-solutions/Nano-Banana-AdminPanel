import { Icons } from '@/config/icons';
import { UserGeneration } from '@/lib/types/user-generation.types';
import { User } from '@/lib/types/user.types';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';

interface GenerationInfoGridProps {
  generation: UserGeneration;
  user: User | null;
  plan: SubscriptionPlan | null;
  formatTimestamp: (timestamp: any) => string;
}

export default function GenerationInfoGrid({ generation, user, plan, formatTimestamp }: GenerationInfoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Generation ID */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.images size={20} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary font-body mb-1">Generation ID</p>
            <p className="text-base font-semibold text-primary font-body break-all">
              {generation.id}
            </p>
          </div>
        </div>
      </div>

      {/* User - WITH REAL PHOTO */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
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
              style={{ display: user?.photoURL ? 'none' : 'flex' }}
            >
              <Icons.users size={20} className="text-secondary" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-primary font-body">
              {user?.name || 'Unknown User'}
            </p>
            {user?.email && (
              <p className="text-xs text-secondary font-body mt-1">
                {user.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            generation.generationStatus === 'success' ? 'bg-green-100' :
            generation.generationStatus === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            {generation.generationStatus === 'success' && <Icons.check size={20} className="text-green-600" />}
            {generation.generationStatus === 'failed' && <Icons.x size={20} className="text-red-600" />}
            {generation.generationStatus === 'pending' && <Icons.clock size={20} className="text-yellow-600" />}
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Generation Status</p>
            <p className="text-base font-semibold text-primary font-body capitalize">
              {generation.generationStatus}
            </p>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.subscriptionPlan size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Subscription Plan</p>
            <p className="text-base font-semibold text-primary font-body">
              {plan?.name || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Model */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.code size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">AI Model</p>
            <p className="text-base font-semibold text-primary font-body">
              {generation.metadata?.model || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Processing Time */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.clock size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Processing Time</p>
            <p className="text-base font-semibold text-primary font-body">
              {generation.metadata?.processingTime
                ? `${(generation.metadata.processingTime / 1000).toFixed(2)}s`
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Prompt ID */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.fileText size={20} className="text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-secondary font-body mb-1">Prompt ID</p>
            <p className="text-base font-semibold text-primary font-body break-all">
              {generation.promptId}
            </p>
          </div>
        </div>
      </div>

      {/* Created At */}
      <div className="bg-background rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icons.calendar size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-secondary font-body mb-1">Created At</p>
            <p className="text-base font-semibold text-primary font-body">
              {formatTimestamp(generation.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription ID */}
      {generation.subscriptionId && (
        <div className="bg-background rounded-lg p-4 border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icons.userSubscription size={20} className="text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-secondary font-body mb-1">Subscription ID</p>
              <p className="text-base font-semibold text-primary font-body break-all">
                {generation.subscriptionId}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
