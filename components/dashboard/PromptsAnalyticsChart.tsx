'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Icons } from '@/config/icons';
import { useState } from 'react';

interface PromptsAnalyticsData {
  topPrompts: Array<{
    name: string;
    likes: number;
    searches: number;
    saves: number;
  }>;
  overview: {
    total: number;
    trending: number;
    regular: number;
  };
}

interface PromptsAnalyticsChartProps {
  data: PromptsAnalyticsData;
}

type ViewType = 'top' | 'overview';

const COLORS = ['#FF6B35', '#004E89', '#F77F00'];

export default function PromptsAnalyticsChart({ data }: PromptsAnalyticsChartProps) {
  const [viewType, setViewType] = useState<ViewType>('top');

  const pieData = [
    { name: 'Trending', value: data.overview.trending, color: '#FF6B35' },
    { name: 'Regular', value: data.overview.regular, color: '#004E89' },
  ];

  return (
    <div className="bg-white rounded-lg border border-primary/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
            <Icons.images size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary font-heading">Prompts Analytics</h2>
            <p className="text-xs text-secondary">
              {viewType === 'top' 
                ? 'Top 10 prompts by engagement' 
                : `Total: ${data.overview.total} prompts`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewType('top')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewType === 'top'
                ? 'bg-accent text-white'
                : 'bg-background text-primary hover:bg-accent/10'
            }`}
          >
            Top Prompts
          </button>
          <button
            onClick={() => setViewType('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewType === 'overview'
                ? 'bg-accent text-white'
                : 'bg-background text-primary hover:bg-accent/10'
            }`}
          >
            Overview
          </button>
        </div>
      </div>

      {viewType === 'top' ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.topPrompts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              style={{ fontSize: '11px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
            />
            <Bar dataKey="likes" fill="#FF6B35" radius={[8, 8, 0, 0]} name="Likes" />
            <Bar dataKey="searches" fill="#004E89" radius={[8, 8, 0, 0]} name="Searches" />
            <Bar dataKey="saves" fill="#F77F00" radius={[8, 8, 0, 0]} name="Saves" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-4 pt-4 border-t border-primary/10">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{data.overview.total}</p>
            <p className="text-xs text-secondary mt-1">Total Prompts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{data.overview.trending}</p>
            <p className="text-xs text-secondary mt-1">Trending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">{data.overview.regular}</p>
            <p className="text-xs text-secondary mt-1">Regular</p>
          </div>
        </div>
      </div>
    </div>
  );
}
