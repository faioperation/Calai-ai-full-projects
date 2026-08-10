import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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

const PlanDistribution = ({ apiData }) => {
  const data = (apiData || []).map((item, index) => ({
    name: item.name,
    value: item.percentage,
    count: item.count,
    color: COLORS[index % COLORS.length]
  }));

  const hasData = data.some(d => d.value > 0);
  const renderData = hasData ? data.filter(d => d.value > 0) : [{ name: 'No Data', value: 100, color: '#333' }];

  return (
    <div className="bg-[#191919] rounded-2xl p-6 border border-gray-800/50 flex flex-col h-full min-h-[400px]">
      <h3 className="text-white text-lg font-medium mb-4">Plan Distribution</h3>
      
      <div className="flex-1 w-full min-h-[250px] relative">
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
            <span className="text-[15px] font-medium" style={{ color: entry.color }}>
              {entry.name} ({entry.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlanDistribution;