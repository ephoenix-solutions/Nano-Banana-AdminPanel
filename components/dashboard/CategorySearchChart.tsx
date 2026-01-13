'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Icons } from '@/config/icons';

interface CategorySearchData {
  name: string;
  searches: number;
  color: string;
}

interface CategorySearchChartProps {
  data: CategorySearchData[];
}

const COLORS = ['#FF6B35', '#004E89', '#F77F00', '#06A77D', '#D62828', '#8338EC', '#3A86FF', '#FB5607'];

export default function CategorySearchChart({ data }: CategorySearchChartProps) {
  // Sort by searches descending and take top 10
  const topCategories = [...data]
    .sort((a, b) => b.searches - a.searches)
    .slice(0, 10);

  const totalSearches = data.reduce((sum, cat) => sum + cat.searches, 0);

  return (
    <div className="bg-white rounded-lg border border-primary/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
            <Icons.categories size={20} className="text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary font-heading">Category Search Count</h2>
            <p className="text-xs text-secondary">Top 10 most searched categories • Total: {totalSearches.toLocaleString()} searches</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={topCategories} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            type="category"
            dataKey="name" 
            width={120}
            stroke="#6b7280"
            style={{ fontSize: '11px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number | undefined) => [
               (value ?? 0).toLocaleString(),
               'Searches'
             ]}
          />
          <Bar 
            dataKey="searches" 
            radius={[0, 8, 8, 0]}
            name="Search Count"
          >
            {topCategories.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-primary/10">
        <div className="grid grid-cols-2 gap-2">
          {topCategories.slice(0, 6).map((cat, index) => (
            <div key={cat.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-secondary truncate">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
