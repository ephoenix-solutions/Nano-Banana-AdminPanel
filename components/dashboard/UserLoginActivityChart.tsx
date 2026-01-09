'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Icons } from '@/config/icons';
import { useState } from 'react';

interface UserLoginData {
  dayWise: Array<{ date: string; newUsers: number; activeUsers: number }>;
  monthWise: Array<{ month: string; newUsers: number; activeUsers: number }>;
  yearWise: Array<{ year: string; newUsers: number; activeUsers: number }>;
}

interface UserLoginActivityChartProps {
  data: UserLoginData;
}

type ViewType = 'day' | 'month' | 'year';

export default function UserLoginActivityChart({ data }: UserLoginActivityChartProps) {
  const [viewType, setViewType] = useState<ViewType>('day');

  const getCurrentData = () => {
    switch (viewType) {
      case 'day':
        return data.dayWise;
      case 'month':
        return data.monthWise;
      case 'year':
        return data.yearWise;
      default:
        return data.dayWise;
    }
  };

  const getDataKey = () => {
    switch (viewType) {
      case 'day':
        return 'date';
      case 'month':
        return 'month';
      case 'year':
        return 'year';
      default:
        return 'date';
    }
  };

  const getTitle = () => {
    switch (viewType) {
      case 'day':
        return 'Daily Login Activity (Last 30 Days)';
      case 'month':
        return 'Monthly Login Activity (Last 12 Months)';
      case 'year':
        return 'Yearly Login Activity';
      default:
        return 'Login Activity';
    }
  };

  const currentData = getCurrentData();
  const dataKey = getDataKey();

  return (
    <div className="bg-white rounded-lg border border-primary/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
            <Icons.users size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary font-heading">{getTitle()}</h2>
            <p className="text-xs text-secondary">New registrations vs Active logins</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewType('day')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewType === 'day'
                ? 'bg-accent text-white'
                : 'bg-background text-primary hover:bg-accent/10'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewType('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewType === 'month'
                ? 'bg-accent text-white'
                : 'bg-background text-primary hover:bg-accent/10'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewType('year')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewType === 'year'
                ? 'bg-accent text-white'
                : 'bg-background text-primary hover:bg-accent/10'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={currentData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={dataKey} 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
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
          {/* New Users Line (Created At) */}
          <Line 
            type="monotone" 
            dataKey="newUsers" 
            stroke="#06A77D" 
            strokeWidth={2}
            dot={{ fill: '#06A77D', r: 4 }}
            activeDot={{ r: 6 }}
            name="New Users"
          />
          {/* Active Users Line (Last Login) */}
          <Line 
            type="monotone" 
            dataKey="activeUsers" 
            stroke="#FF6B35" 
            strokeWidth={2}
            dot={{ fill: '#FF6B35', r: 4 }}
            activeDot={{ r: 6 }}
            name="Active Users"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
