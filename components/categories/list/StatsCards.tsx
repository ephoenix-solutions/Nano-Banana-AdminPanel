import { Icons } from '@/config/icons';
import { Category } from '@/lib/types/category.types';

interface StatsCardsProps {
  categories: Category[];
}

export default function StatsCards({ categories }: StatsCardsProps) {
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce(
    (sum, cat) => sum + (cat.subcategories?.length || 0),
    0
  );
  const totalSearches = categories.reduce(
    (sum, cat) => sum + parseInt(String(cat.searchCount) || '0'),
    0
  );

  const stats = [
    {
      label: 'Total Categories',
      value: totalCategories,
      icon: Icons.categories,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Total Subcategories',
      value: totalSubcategories,
      icon: Icons.file,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      label: 'Total Searches',
      value: totalSearches,
      icon: Icons.search,
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
