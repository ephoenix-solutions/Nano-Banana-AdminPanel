import { Icons } from '@/config/icons';
import { SubscriptionPlan } from '@/lib/types/subscription-plan.types';

interface StatsCardsProps {
  plans: SubscriptionPlan[];
}

export default function StatsCards({ plans }: StatsCardsProps) {
  const totalPlans = plans.length;
  const activePlans = plans.filter((p) => p.isActive).length;
  const inactivePlans = plans.filter((p) => !p.isActive).length;

  const stats = [
    {
      label: 'Total Plans',
      value: totalPlans,
      icon: Icons.subscriptionPlan,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Active Plans',
      value: activePlans,
      icon: Icons.check,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      label: 'Inactive Plans',
      value: inactivePlans,
      icon: Icons.close,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
