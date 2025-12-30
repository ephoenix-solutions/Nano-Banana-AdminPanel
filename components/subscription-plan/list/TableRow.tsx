import { Icons } from '@/config/icons';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';
import UserCell from './UserCell';

interface TableRowProps {
  plan: SubscriptionPlan;
  fetchUserName: (userId: string) => Promise<string>;
  formatTimestamp: (timestamp: any) => string | null;
  onView: (plan: SubscriptionPlan) => void;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  onToggleActive: (planId: string, isActive: boolean) => Promise<void>;
}

export default function TableRow({
  plan,
  fetchUserName,
  formatTimestamp,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: TableRowProps) {
  return (
    <tr className="hover:bg-background/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">
            {plan.name}
          </span>
          <span className="text-xs text-secondary">
            (Order: {plan.order})
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-primary font-semibold">
        {plan.currency} {plan.price}
      </td>
      <td className="px-6 py-4 text-sm text-primary">
        {plan.durationDays} days
      </td>
      <td className="px-6 py-4 text-sm text-primary">
        {plan.generationLimit} generations
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {plan.features.slice(0, 2).map((feature, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-accent/20 text-primary"
            >
              {feature}
            </span>
          ))}
          {plan.features.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary/20 text-primary">
              +{plan.features.length - 2} more
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onToggleActive(plan.id, plan.isActive)}
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            plan.isActive
              ? 'bg-accent text-primary'
              : 'bg-background text-secondary border border-primary/10'
          }`}
        >
          {plan.isActive ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-6 py-4 text-sm text-primary">
        <UserCell 
          userId={plan.createdBy} 
          timestamp={plan.createdAt}
          fetchUserName={fetchUserName}
          formatTimestamp={formatTimestamp}
        />
      </td>
      <td className="px-6 py-4 text-sm text-primary">
        {plan.updatedBy ? (
          <UserCell 
            userId={plan.updatedBy} 
            timestamp={plan.updatedAt}
            fetchUserName={fetchUserName}
            formatTimestamp={formatTimestamp}
          />
        ) : (
          <span className="text-secondary text-xs">Not updated</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onView(plan)}
            className="p-2 text-white bg-accent hover:bg-accent/90 rounded-md transition-all cursor-pointer"
            title="View"
          >
            <Icons.eye size={18} />
          </button>
          <button
            onClick={() => onEdit(plan)}
            className="p-2 text-primary bg-background hover:bg-accent hover:text-primary rounded-md transition-all border border-primary/10 cursor-pointer"
            title="Edit"
          >
            <Icons.edit size={18} />
          </button>
          <button
            onClick={() => onDelete(plan)}
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
