'use client';

import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Icons } from '@/config/icons';
import { useState } from 'react';

interface GenerationChartData {
  dayWise: Array<{ date: string; success: number; failed: number; pending: number; total: number; successRate: number }>;
  monthWise: Array<{ month: string; success: number; failed: number; pending: number; total: number; successRate: number }>;
  yearWise: Array<{ year: string; success: number; failed: number; pending: number; total: number; successRate: number }>;
}

interface GenerationStatsChartProps {
  data: GenerationChartData;
}

type ViewType = 'day' | 'month' | 'year';

export default function GenerationStatsChart({ data }: GenerationStatsChartProps) {
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
        return data.monthWise;
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
        return 'month';
    }
  };

  const getTitle = () => {
    switch (viewType) {
      case 'day':
        return 'Daily Image Generation Activity (Last 30 Days)';
      case 'month':
        return 'Monthly Image Generation Activity (Last 12 Months)';
      case 'year':
        return 'Yearly Image Generation Activity';
      default:
        return 'Image Generation Activity';
    }
  };

  const currentData = getCurrentData();
  const dataKey = getDataKey();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          className="p-3"
        >
          <p className="font-semibold text-primary mb-2">{data[dataKey]}</p>
          <div className="space-y-1">
            <p className="text-green-600">Success: {data.success}</p>
            <p className="text-red-600">Failed: {data.failed}</p>
            <p className="text-yellow-600">Pending: {data.pending}</p>
            <p className="text-primary font-semibold">Total: {data.total}</p>
            <p className="text-blue-600 font-semibold">Success Rate: {data.successRate}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-primary/10 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
            <Icons.images size={20} className="text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary font-heading">{getTitle()}</h2>
            <p className="text-xs text-secondary">Generation volume and success rates</p>
          </div>
        </div>

        {/* Time Period Selector */}
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

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={currentData}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey={dataKey} 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#3b82f6"
            style={{ fontSize: '12px' }}
            domain={[0, 100]}
          />
          <Tooltip 
            content={<CustomTooltip />}
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
          
          {/* Stacked Bars */}
          <Bar 
            yAxisId="left"
            dataKey="success" 
            stackId="a" 
            fill="#10b981" 
            name="Success"
          />
          <Bar 
            yAxisId="left"
            dataKey="failed" 
            stackId="a" 
            fill="#ef4444" 
            name="Failed"
          />
          <Bar 
            yAxisId="left"
            dataKey="pending" 
            stackId="a" 
            fill="#f59e0b" 
            name="Pending"
          />
          
          {/* Success Rate Line */}
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="successRate" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Success Rate (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
