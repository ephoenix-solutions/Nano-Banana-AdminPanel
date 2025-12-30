import { Icons } from '@/config/icons';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';
import { StatusFilter, PaymentMethodFilter } from '@/lib/hooks/useUserSubscriptionsList';

interface SearchFilterBarProps {
  searchQuery: string;
  planFilter: string;
  statusFilter: StatusFilter;
  paymentMethodFilter: PaymentMethodFilter;
  plans: SubscriptionPlan[];
  hasActiveFilters: boolean;
  totalSubscriptions: number;
  filteredCount: number;
  onSearchChange: (query: string) => void;
  onPlanChange: (filter: string) => void;
  onStatusChange: (filter: StatusFilter) => void;
  onPaymentMethodChange: (filter: PaymentMethodFilter) => void;
  onClearFilters: () => void;
}

export default function SearchFilterBar({
  searchQuery,
  planFilter,
  statusFilter,
  paymentMethodFilter,
  plans,
  hasActiveFilters,
  totalSubscriptions,
  filteredCount,
  onSearchChange,
  onPlanChange,
  onStatusChange,
  onPaymentMethodChange,
  onClearFilters,
}: SearchFilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-primary/10 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.search size={20} className="text-secondary" />
            </div>
            <input
              type="text"
              placeholder="Search by user name or transaction ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary placeholder-secondary/50"
            />
          </div>
        </div>

        {/* Plan Filter */}
        <div className="w-full md:w-48">
          <select
            value={planFilter}
            onChange={(e) => onPlanChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
          >
            <option value="all">All Plans</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
            className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Payment Method Filter */}
        <div className="w-full md:w-48">
          <select
            value={paymentMethodFilter}
            onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethodFilter)}
            className="w-full px-3 py-2.5 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-body text-primary"
          >
            <option value="all">All Methods</option>
            <option value="google">Google Pay</option>
            <option value="apple">Apple Pay</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-secondary/20 text-secondary rounded-lg font-semibold hover:bg-secondary/10 transition-all whitespace-nowrap"
          >
            <Icons.close size={20} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-primary/10">
        <p className="text-sm text-secondary font-body">
          Showing <span className="font-semibold text-primary">{filteredCount}</span> of{' '}
          <span className="font-semibold text-primary">{totalSubscriptions}</span> subscriptions
        </p>
      </div>
    </div>
  );
}
