import { Icons } from '@/config/icons';
import { Country } from '@/lib/types/country.types';

interface StatsCardsProps {
  countries: Country[];
}

export default function StatsCards({ countries }: StatsCardsProps) {
  const totalCountries = countries.length;
  const withCategories = countries.filter((c) => c.categories && c.categories.length > 0).length;
  const withoutCategories = countries.filter((c) => !c.categories || c.categories.length === 0).length;

  const stats = [
    {
      label: 'Total Countries',
      value: totalCountries,
      icon: Icons.globe,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'With Categories',
      value: withCategories,
      icon: Icons.categories,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      label: 'Without Categories',
      value: withoutCategories,
      icon: Icons.alert,
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
