import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import Dropdown from './Dropdown';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181A] border border-gray-800 p-3 rounded-lg shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold text-sm">
          {payload[0].value} Min
        </p>
      </div>
    );
  }
  return null;
};

const CallDuration = ({ data: apiData }) => {
  const [timeRange, setTimeRange] = useState('Last 15 days');



  const chartData = apiData && apiData.length > 0
    ? apiData.map(item => ({
        name: item.date,
        value: item.duration
      }))
    : defaultData;

  return (
    <div className="w-full bg-[#191919] rounded-2xl px-6 py-10 border border-gray-800/50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-medium text-white">Total Call Duration</h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">8.06%</span>
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Icon icon="lucide:trending-up" className="text-black text-xs" />
            </div>
          </div>
        </div>
        
      
      </div>

      {/* Chart */}
      <div className="w-full h-[300px] sm:h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              horizontal={false} 
              vertical={true} 
              stroke="#262626" 
            />
            
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              dy={10}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              dx={-10}
              domain={[0, 'auto']}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#262626', strokeWidth: 1 }} />
            
            <Area
              type="linear"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              dot={{ r: 7, fill: '#0F2EC5', strokeWidth: 0 }}
              activeDot={{ r: 7, fill: '#0F2EC580', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CallDuration;