import { UserGeneration } from '@/lib/types/user-generation.types';
import { Icons } from '@/config/icons';

interface StatsCardsProps {
  generations: UserGeneration[];
}

export default function StatsCards({ generations }: StatsCardsProps) {
  const totalGenerations = generations.length;
  const successCount = generations.filter((g) => g.generationStatus === 'success').length;
  const failedCount = generations.filter((g) => g.generationStatus === 'failed').length;
  const pendingCount = generations.filter((g) => g.generationStatus === 'pending').length;
  
  const successRate = totalGenerations > 0 
    ? ((successCount / totalGenerations) * 100).toFixed(1) 
    : '0.0';

  const stats = [
    {
      label: 'Total Generations',
      value: totalGenerations.toLocaleString(),
      icon: Icons.images,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Successful',
      value: successCount.toLocaleString(),
      icon: Icons.check,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Failed',
      value: failedCount.toLocaleString(),
      icon: Icons.x,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      icon: Icons.trending,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg border border-primary/10 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary font-body mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-primary font-heading">{stat.value}</p>
              </div>
              <div className={`w-14 h-14 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <IconComponent size={28} className={stat.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
