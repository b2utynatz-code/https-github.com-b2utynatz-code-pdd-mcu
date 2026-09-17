import React, { useState, useMemo } from 'react';
import { Personnel } from '../types';
import { 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { PieChart, Building, Users, ArrowRight } from 'lucide-react';

interface CategoryPieChartProps {
  personnelList: Personnel[];
  onSelectCategoryFilter: (category: string) => void;
  onNavigateToDirectory: () => void;
}

// Sophisticated, accessible palette matching MCU identity
const CATEGORY_COLORS = [
  '#be185d', // Deep pink (คณะ / บัณฑิตวิทยาลัย)
  '#2563eb', // Blue (วิทยาเขต / วิทยาลัยสงฆ์)
  '#059669', // Emerald (สำนักงานอธิการบดี / ส่วนกลาง)
  '#7c3aed', // Purple (สถาบัน / สำนัก)
  '#d97706', // Amber (อื่นๆ)
];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  personnelList,
  onSelectCategoryFilter,
  onNavigateToDirectory,
}) => {
  // Mode toggle: By personnel count vs by unique departments count
  const [metricMode, setMetricMode] = useState<'personnel' | 'departments'>('personnel');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Group data by department category
  const chartData = useMemo(() => {
    const map = new Map<string, { personnelCount: number; departments: Set<string> }>();

    personnelList.forEach(p => {
      const cat = p.departmentCategory || 'ส่วนงานอื่นๆ';
      if (!map.has(cat)) {
        map.set(cat, { personnelCount: 0, departments: new Set<string>() });
      }
      const entry = map.get(cat)!;
      entry.personnelCount += 1;
      entry.departments.add(p.department);
    });

    const totalPersonnel = personnelList.length || 1;
    const allUniqueDepts = new Set(personnelList.map(p => p.department)).size || 1;

    return Array.from(map.entries()).map(([name, data], idx) => {
      const deptsCount = data.departments.size;
      return {
        name,
        personnelCount: data.personnelCount,
        deptCount: deptsCount,
        value: metricMode === 'personnel' ? data.personnelCount : deptsCount,
        personnelPct: Math.round((data.personnelCount / totalPersonnel) * 100),
        deptPct: Math.round((deptsCount / allUniqueDepts) * 100),
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      };
    });
  }, [personnelList, metricMode]);

  const totalValue = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const handleSliceClick = (data: any) => {
    if (data && data.name) {
      onSelectCategoryFilter(data.name);
      onNavigateToDirectory();
    }
  };

  return (
    <div 
      id="category-pie-chart-card" 
      className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-100 text-pink-700">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                สรุปกลุ่มประเภทส่วนงานที่มีข้อมูลแล้ว
              </h3>
              <p className="text-xs text-slate-500 font-body">
                สัดส่วนจำแนกตามโครงสร้างส่วนงาน มจร
              </p>
            </div>
          </div>

          {/* Metric Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setMetricMode('personnel')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                metricMode === 'personnel'
                  ? 'bg-white text-pink-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-pink-700" />
              <span>บุคลากร (คน)</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('departments')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                metricMode === 'departments'
                  ? 'bg-white text-pink-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-blue-700" />
              <span>ส่วนงาน (แห่ง)</span>
            </button>
          </div>
        </div>

        {/* Pie Chart Display */}
        <div className="relative h-64 w-full flex items-center justify-center my-2">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                onClick={handleSliceClick}
                cursor="pointer"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="#ffffff"
                    strokeWidth={2}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-700 space-y-1">
                        <div className="font-bold text-pink-200">{item.name}</div>
                        <div className="text-slate-200">
                          • บุคลากร: <span className="font-semibold text-white">{item.personnelCount} คน</span> ({item.personnelPct}%)
                        </div>
                        <div className="text-slate-200">
                          • ส่วนงานย่อย: <span className="font-semibold text-white">{item.deptCount} ส่วนงาน</span> ({item.deptPct}%)
                        </div>
                        <div className="text-[10px] text-pink-300 pt-0.5 border-t border-slate-700">
                          คลิกเพื่อกรองดูรายชื่อ
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RechartsPie>
          </ResponsiveContainer>

          {/* Center Indicator */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">
              {totalValue}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 font-body">
              {metricMode === 'personnel' ? 'บุคลากรทั้งหมด' : 'ส่วนงานทั้งหมด'}
            </span>
          </div>
        </div>

        {/* Breakdown Legend Items */}
        <div className="space-y-2 pt-1 font-body">
          {chartData.map((item) => (
            <div
              key={item.name}
              onClick={() => handleSliceClick(item)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs shrink-0">
                <span className="font-bold text-slate-900">
                  {metricMode === 'personnel' ? `${item.personnelCount} คน` : `${item.deptCount} แห่ง`}
                </span>
                <span className="text-slate-600 text-[11px]">
                  ({metricMode === 'personnel' ? item.personnelPct : item.deptPct}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateToDirectory}
          className="text-xs font-medium text-pink-700 hover:text-pink-800 flex items-center gap-1 cursor-pointer"
        >
          <span>ดูข้อมูลส่วนงานทั้งหมดในทำเนียบ</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
