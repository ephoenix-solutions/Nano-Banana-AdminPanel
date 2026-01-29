import { Icons } from '@/config/icons';
import { User } from '@/lib/types/user.types';

interface TrashStatsCardsProps {
  users: User[];
}

export default function TrashStatsCards({ users }: TrashStatsCardsProps) {
  const totalUsers = users.length;
  const googleUsers = users.filter((u) => u.provider === 'google').length;
  const appleUsers = users.filter((u) => u.provider === 'apple' || u.provider === 'ios').length;
  const adminUsers = users.filter((u) => u.role === 'admin').length;

  const stats = [
    {
      label: 'Total Deleted',
      value: totalUsers,
      icon: Icons.trash,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      label: 'Google Users',
      value: googleUsers,
      icon: Icons.globe,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Apple Users',
      value: appleUsers,
      icon: Icons.phone,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Admin Users',
      value: adminUsers,
      icon: Icons.shield,
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
