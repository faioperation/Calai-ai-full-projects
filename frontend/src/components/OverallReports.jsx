import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const defaultChartData = [
  { name: 'Total Call', value: 20, color: '#A94464' },
  { name: 'Call Drop Rate', value: 15, color: '#00E5FF' }
];

const legendData = [
  { name: 'Total Call', color: '#A94464' },
  { name: 'Total Call Duration', color: '#9E86FF' }
];

const OverallReports = ({ report }) => {
  const percentage = report?.overallPercentage ?? 80;
  
  // We can dynamically distribute chart values based on report values if available
  const chartData = report
    ? [
        { name: 'Total Call', value: report.totalCall || 0, color: '#A94464' },
        { name: 'Total Call Duration', value: report.totalCallDuration || 0, color: '#9E86FF' },
      ]
    : defaultChartData;

  // Render non-zero slices, or a fallback slice if all values are 0 so Recharts doesn't break
  const activeChartData = chartData.some(entry => entry.value > 0)
    ? chartData
    : defaultChartData;

  return (
    <div className="w-full h-full bg-[#191919] rounded-2xl p-6 border border-gray-800/50 flex flex-col">
      <h2 className="text-xl font-semibold text-white mb-8">Overall Report</h2>
      
      {/* Chart Container */}
      <div className="relative flex justify-center items-center h-[260px] mb-8">
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <span className="text-white text-sm font-medium">Over all</span>
          <span className="text-white text-4xl font-bold mt-1">{percentage}%</span>
        </div>

        <ResponsiveContainer width="100%" height="100%" className="relative z-10">
          <PieChart>
            <Pie
              data={activeChartData}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {activeChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value}%`, name]}
              contentStyle={{ backgroundColor: '#111111', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              wrapperStyle={{ zIndex: 100 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-5 mt-auto pb-2">
        {activeChartData
          .filter((item) => item.value > 0)
          .map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div 
                className="w-6 h-6 rounded-full shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white text-[15px] font-medium">{item.name}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default OverallReports;