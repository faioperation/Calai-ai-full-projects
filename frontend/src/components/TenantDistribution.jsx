import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Dropdown from './Dropdown';

const COLORS = {
  active: '#10B981',
  suspended: '#EF4444',
  trial: '#F59E0B',
  expired: '#6B7280'
};

const renderCustomizedLabel = (props) => {
  const { cx, cy, midAngle, outerRadius, value, name, fill } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill={fill} 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${name}: ${value}%`}
    </text>
  );
};

const TenantDistribution = ({ apiData }) => {
  const [filter, setFilter] = useState('Weekly');

  const data = (apiData || []).map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.percentage,
    count: item.count,
    color: COLORS[item.status.toLowerCase()] || '#8B5CF6'
  }));

  const hasData = data.some(d => d.value > 0);
  const renderData = hasData ? data.filter(d => d.value > 0) : [{ name: 'No Data', value: 100, color: '#333' }];

  return (
    <div className="bg-[#191919] rounded-2xl p-6 border border-gray-800/50 flex flex-col h-full min-h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-medium">Tenant Status Distribution</h3>
        <div className="relative z-20">
          <Dropdown 
            options={["Weekly","Monthly", "Yearly", ]}
            value={filter}
            onSelect={(val) => setFilter(val)}
            inputClass="!bg-transparent !border-[#2563EB] !rounded-full !py-1.5 !px-4 !text-sm !text-gray-300 text-center min-w-[120px] focus:outline-none"
            optionClass="!bg-[#18181A] !border-[#2563EB] !text-gray-300"
            icon="!text-gray-300 right-2"
          />
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[350px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={renderData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={1}
              label={hasData ? renderCustomizedLabel : false}
              labelLine={false}
              isAnimationActive={true}
            >
              {renderData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center flex-wrap items-center gap-6 mt-4 pb-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3.5 h-3.5" style={{ backgroundColor: entry.color }}></div>
            <span className="text-[15px] font-medium text-gray-400">
              {entry.name} ({entry.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TenantDistribution;