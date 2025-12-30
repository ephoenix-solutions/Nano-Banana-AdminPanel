import { Icons } from '@/config/icons';
import { Prompt } from '@/lib/types/prompt.types';

interface StatsCardsProps {
  prompts: Prompt[];
}

export default function StatsCards({ prompts }: StatsCardsProps) {
  const totalPrompts = prompts.length;
  const trendingCount = prompts.filter((p) => p.isTrending).length;
  const totalLikes = prompts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const totalSearches = prompts.reduce((sum, p) => sum + (p.searchCount || 0), 0);
  const totalSaves = prompts.reduce((sum, p) => sum + (p.savesCount || 0), 0);

  const stats = [
    {
      label: 'Total Prompts',
      value: totalPrompts,
      icon: Icons.file,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Trending',
      value: trendingCount,
      icon: Icons.chart,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      label: 'Total Likes',
      value: totalLikes,
      icon: Icons.check,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
    {
      label: 'Total Searches',
      value: totalSearches,
      icon: Icons.search,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      label: 'Total Saves',
      value: totalSaves,
      icon: Icons.bookmark,
      bgColor: 'bg-accent/20',
      iconColor: 'text-accent',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
