import { Icons } from '@/config/icons';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';
import TableRow from './TableRow';

interface PlansTableProps {
  plans: SubscriptionPlan[];
  fetchUserName: (userId: string) => Promise<string>;
  formatTimestamp: (timestamp: any) => string | null;
  onView: (plan: SubscriptionPlan) => void;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  onToggleActive: (planId: string, isActive: boolean) => Promise<void>;
}

export default function PlansTable({
  plans,
  fetchUserName,
  formatTimestamp,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: PlansTableProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Price
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Duration
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Generation Limit
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Features
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Created By
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Updated By
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {plans.map((plan) => (
              <TableRow
                key={plan.id}
                plan={plan}
                fetchUserName={fetchUserName}
                formatTimestamp={formatTimestamp}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
