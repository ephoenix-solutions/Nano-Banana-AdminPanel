import { Icons } from '@/config/icons';
import { User } from '@/lib/types/user.types';

interface StatsCardsProps {
  users: User[];
}

export default function StatsCards({ users }: StatsCardsProps) {
  const totalUsers = users.length;
  const googleUsers = users.filter((u) => u.provider === 'google').length;
  const appleUsers = users.filter((u) => u.provider === 'apple' || u.provider === 'ios').length;
  const activeToday = users.filter((u) => {
    const today = new Date();
    const lastLogin = u.lastLogin.toDate();
    return lastLogin.toDateString() === today.toDateString();
  }).length;

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Icons.users,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Google Users',
      value: googleUsers,
      icon: Icons.globe,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      label: 'Apple Users',
      value: appleUsers,
      icon: Icons.phone,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Active Today',
      value: activeToday,
      icon: Icons.check,
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
