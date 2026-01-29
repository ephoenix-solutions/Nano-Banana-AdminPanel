import { Icons } from '@/config/icons';
import { Category } from '@/lib/types/category.types';

interface TrashStatsCardsProps {
  categories: Category[];
}

export default function TrashStatsCards({ categories }: TrashStatsCardsProps) {
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce(
    (sum, c) => sum + (c.subcategories?.length || 0),
    0
  );
  const totalSearchCount = categories.reduce(
    (sum, c) => sum + (typeof c.searchCount === 'number' ? c.searchCount : parseInt(c.searchCount) || 0),
    0
  );
  const avgSubcategories = totalCategories > 0 
    ? (totalSubcategories / totalCategories).toFixed(1) 
    : '0';

  const stats = [
    {
      label: 'Deleted Categories',
      value: totalCategories,
      icon: Icons.trash,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      label: 'Deleted Subcategories',
      value: totalSubcategories,
      icon: Icons.file,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Total Searches',
      value: totalSearchCount,
      icon: Icons.search,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      label: 'Avg Subcategories',
      value: avgSubcategories,
      icon: Icons.chart,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
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
