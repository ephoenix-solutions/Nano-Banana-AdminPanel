import { Icons } from '@/config/icons';
import { UserSubscription } from '@/lib/types/user-subscription.types';
import { SortField, SortOrder } from '@/lib/hooks/useUserSubscriptionsList';
import { Timestamp } from 'firebase/firestore';
import SortableHeader from './SortableHeader';
import TableRow from './TableRow';

interface SubscriptionsTableProps {
  subscriptions: UserSubscription[];
  sortField: SortField;
  sortOrder: SortOrder;
  getUserName: (userId: string) => string;
  getPlanName: (planId: string) => string;
  formatTimestamp: (timestamp: Timestamp) => string;
  isExpired: (endDate: Timestamp) => boolean;
  onSort: (field: SortField) => void;
  onDelete: (subscription: UserSubscription) => void;
  onToggleActive: (subscriptionId: string, isActive: boolean) => Promise<void>;
}

export default function SubscriptionsTable({
  subscriptions,
  sortField,
  sortOrder,
  getUserName,
  getPlanName,
  formatTimestamp,
  isExpired,
  onSort,
  onDelete,
  onToggleActive,
}: SubscriptionsTableProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background border-b border-primary/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="user" 
                  label="User"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="plan" 
                  label="Plan"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="startDate" 
                  label="Start Date"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="endDate" 
                  label="End Date"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                <SortableHeader 
                  field="paymentMethod" 
                  label="Payment Method"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary font-body">
                Status
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-primary font-body">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription, index) => (
              <TableRow
                key={subscription.id}
                subscription={subscription}
                index={index}
                getUserName={getUserName}
                getPlanName={getPlanName}
                formatTimestamp={formatTimestamp}
                isExpired={isExpired}
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
