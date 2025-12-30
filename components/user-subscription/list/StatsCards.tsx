import { Icons } from '@/config/icons';
import { UserSubscription } from '@/lib/types/user-subscription.types';
import { Timestamp } from 'firebase/firestore';

interface StatsCardsProps {
  subscriptions: UserSubscription[];
  isExpired: (endDate: Timestamp) => boolean;
}

export default function StatsCards({ subscriptions, isExpired }: StatsCardsProps) {
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter((s) => s.isActive).length;
  const expiredSubscriptions = subscriptions.filter((s) => isExpired(s.endDate)).length;
  const googlePaySubscriptions = subscriptions.filter((s) => s.paymentMethod === 'google').length;

  const stats = [
    {
      label: 'Total Subscriptions',
      value: totalSubscriptions,
      icon: Icons.userSubscription,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Active',
      value: activeSubscriptions,
      icon: Icons.check,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      label: 'Expired',
      value: expiredSubscriptions,
      icon: Icons.clock,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Google Pay',
      value: googlePaySubscriptions,
      icon: Icons.subscriptionPlan,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg border border-primary/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary font-body">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-primary font-heading mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon size={24} className={stat.iconColor} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
