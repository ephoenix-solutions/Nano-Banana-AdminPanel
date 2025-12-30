import { Icons } from '@/config/icons';
import { UserSubscription } from '@/lib/types/user-subscription.types';
import { Timestamp } from 'firebase/firestore';

interface TableRowProps {
  subscription: UserSubscription;
  index: number;
  getUserName: (userId: string) => string;
  getPlanName: (planId: string) => string;
  formatTimestamp: (timestamp: Timestamp) => string;
  isExpired: (endDate: Timestamp) => boolean;
  onDelete: (subscription: UserSubscription) => void;
  onToggleActive: (subscriptionId: string, isActive: boolean) => Promise<void>;
}

export default function TableRow({
  subscription,
  index,
  getUserName,
  getPlanName,
  formatTimestamp,
  isExpired,
  onDelete,
  onToggleActive,
}: TableRowProps) {
  const expired = isExpired(subscription.endDate);

  return (
    <tr
      className={`transition-colors ${
        index % 2 === 0
          ? 'bg-white hover:bg-background/50'
          : 'bg-background hover:bg-background-200'
      }`}
    >
      <td className="px-6 py-4">
        <div>
          <p className="font-semibold text-primary">
            {getUserName(subscription.userId)}
          </p>
          <p className="text-xs text-secondary font-mono">
            {subscription.userId}
          </p>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-primary font-medium">
        {getPlanName(subscription.planId)}
      </td>
      <td className="px-6 py-4 text-sm text-primary">
        {formatTimestamp(subscription.startDate)}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-primary">
            {formatTimestamp(subscription.endDate)}
          </span>
          {expired && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/20 text-secondary">
              Expired
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/20 text-primary capitalize">
          {subscription.paymentMethod}
        </span>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onToggleActive(subscription.id, subscription.isActive)}
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            subscription.isActive
              ? 'bg-accent text-primary'
              : 'bg-background text-secondary border border-primary/10'
          }`}
        >
          {subscription.isActive ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onDelete(subscription)}
            className="p-2 text-white bg-secondary hover:bg-secondary/90 rounded-md transition-all cursor-pointer"
            title="Delete"
          >
            <Icons.trash size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
