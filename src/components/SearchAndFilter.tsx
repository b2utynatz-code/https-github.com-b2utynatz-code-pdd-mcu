import React from 'react';
import { FilterState, PrimaryDuty } from '../types';
import { 
  Search, 
  X, 
  LayoutGrid, 
  List, 
  Filter, 
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { PRIMARY_DUTIES_LIST, SUBUNIT_CATEGORIES } from '../data/mockData';

interface SearchAndFilterProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  departments: string[];
  totalResults: number;
  totalPersonnel: number;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  departments,
  totalResults,
  totalPersonnel,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleDutyToggle = (duty: PrimaryDuty) => {
    setFilters(prev => ({
      ...prev,
      primaryDuty: prev.primaryDuty === duty ? '' : duty,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      department: '',
      primaryDuty: '',
      educationLevel: '',
      departmentCategory: '',
      tenureRange: '',
      auditStatus: '',
      multiDutyOnly: false,
      alignmentFilter: '',
    });
  };

  const hasActiveFilters = 
    filters.searchQuery !== '' ||
    filters.department !== '' ||
    filters.primaryDuty !== '' ||
    filters.educationLevel !== '' ||
    filters.departmentCategory !== '' ||
    filters.tenureRange !== '' ||
    filters.auditStatus !== '' ||
    Boolean(filters.multiDutyOnly) ||
    Boolean(filters.alignmentFilter);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3.5" id="search-filter-box">
      {/* Top Search Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-personnel"
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="สืบค้นชื่อ-นามสกุล, ตำแหน่ง, ส่วนงาน, ส่วนงานย่อย, หลักสูตร, สาขาวิชา, เบอร์โทร หรือ ID Line..."
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 font-body placeholder:text-slate-400"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 self-end sm:self-center border border-slate-200 rounded-lg p-1 bg-slate-50 shrink-0">
          <button
            id="btn-view-grid"
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-pink-900 shadow-xs border border-pink-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="มุมมองการ์ด (Card View)"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden md:inline">การ์ด</span>
          </button>
          <button
            id="btn-view-table"
            type="button"
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-pink-900 shadow-xs border border-pink-200'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="มุมมองตาราง 10 รายการ (Table View)"
          >
            <List className="w-4 h-4" />
            <span className="hidden md:inline">ตาราง (10 รายการ)</span>
          </button>
        </div>
      </div>

      {/* Duty Quick Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          ภาระหน้าที่หลัก:
        </span>
        <button
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, primaryDuty: '' }))}
          className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
            filters.primaryDuty === ''
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ทั้งหมด ({totalPersonnel})
        </button>

        {PRIMARY_DUTIES_LIST.map(duty => {
          const isActive = filters.primaryDuty === duty.name;
          return (
            <button
              key={duty.name}
              type="button"
              onClick={() => handleDutyToggle(duty.name)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border ${
                isActive
                  ? 'bg-pink-700 text-white border-pink-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-pink-50 hover:text-pink-900'
              }`}
            >
              {duty.name}
            </button>
          );
        })}

        {/* Quick Multi-duty filter button */}
        <button
          id="btn-filter-multi-duty"
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, multiDutyOnly: !prev.multiDutyOnly }))}
          className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer border flex items-center gap-1.5 ${
            filters.multiDutyOnly
              ? 'bg-rose-700 text-white border-rose-700 shadow-xs ring-2 ring-rose-300/40'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
          title="กรองเฉพาะผู้ปฏิบัติหน้าที่ควบตั้งแต่ 3 ด้านขึ้นไป"
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${filters.multiDutyOnly ? 'text-rose-200' : 'text-rose-600'}`} />
          <span>ปฏิบัติหน้าที่ควบตั้งแต่ 3 ด้านขึ้นไป</span>
        </button>
      </div>

      {/* Detailed Select Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
        {/* Department Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">ส่วนงานย่อย มจร</label>
          <select
            value={filters.department}
            onChange={e => setFilters(prev => ({ ...prev, department: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-600 font-body"
          >
            <option value="">ทุกส่วนงาน ({departments.length})</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Education Level Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">ระดับการศึกษา</label>
          <select
            value={filters.educationLevel}
            onChange={e => setFilters(prev => ({ ...prev, educationLevel: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-600 font-body"
          >
            <option value="">ทุกระดับการศึกษา</option>
            <option value="ปริญญาตรี">ปริญญาตรี</option>
            <option value="ปริญญาโท">ปริญญาโท</option>
            <option value="ปริญญาเอก">ปริญญาเอก</option>
            <option value="ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)">ปวส.</option>
          </select>
        </div>

        {/* Department Category Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">กลุ่มประเภทส่วนงาน</label>
          <select
            value={filters.departmentCategory}
            onChange={e => setFilters(prev => ({ ...prev, departmentCategory: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-600 font-body"
          >
            <option value="">ทุกกลุ่มส่วนงาน</option>
            {SUBUNIT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Tenure Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">อายุงาน</label>
          <select
            value={filters.tenureRange}
            onChange={e => setFilters(prev => ({ ...prev, tenureRange: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-600 font-body"
          >
            <option value="">ทุกช่วงอายุงาน</option>
            <option value="<1">น้อยกว่า 1 ปี</option>
            <option value="1-3">1 - 3 ปี</option>
            <option value="3-5">3 - 5 ปี</option>
            <option value=">5">มากกว่า 5 ปีขึ้นไป</option>
          </select>
        </div>

        {/* Major to Duty Alignment Filter */}
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">ความตรงสายงาน</label>
          <select
            value={filters.alignmentFilter || ''}
            onChange={e => setFilters(prev => ({ ...prev, alignmentFilter: e.target.value }))}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-600 font-body"
          >
            <option value="">ทุกกลุ่มความตรงสาย</option>
            <option value="non_aligned">ไม่ตรงสายงาน (ประเด็นติดตาม)</option>
            <option value="related">สายใกล้เคียง / ประยุกต์ได้</option>
            <option value="direct">ตรงสายงานโดยตรง</option>
          </select>
        </div>
      </div>

      {/* Results Count & Clear Button */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="text-slate-600">
          ผลการสืบค้น: <span className="font-bold text-pink-900">{totalResults}</span> จากทั้งหมด {totalPersonnel} คน
          {hasActiveFilters && (
            <span className="text-slate-600 ml-1.5">
              (กำลังใช้ตัวกรอง)
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-pink-800 transition font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        )}
      </div>
    </div>
  );
};
