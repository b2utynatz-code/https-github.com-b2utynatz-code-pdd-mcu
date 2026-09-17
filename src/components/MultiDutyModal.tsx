import React, { useState, useMemo } from 'react';
import { Personnel, PrimaryDuty } from '../types';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  Search, 
  ExternalLink, 
  Phone, 
  Mail, 
  Building2, 
  ArrowRight,
  UserCheck,
  Download,
  BookOpen,
  Layers,
  GraduationCap,
  Clock,
  LayoutGrid,
  List,
  Eye
} from 'lucide-react';
import { calculateTenure, exportToCSV, formatThaiDate } from '../utils/helpers';

interface MultiDutyModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelList: Personnel[];
  onSelectPerson: (person: Personnel) => void;
  onNavigateToDirectoryWithFilter: () => void;
}

export const MultiDutyModal: React.FC<MultiDutyModalProps> = ({
  isOpen,
  onClose,
  personnelList,
  onSelectPerson,
  onNavigateToDirectoryWithFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter only personnel with >= 3 primary duties
  const multiDutyPersonnel = useMemo(() => {
    return personnelList.filter(p => p.primaryDuties && p.primaryDuties.length >= 3);
  }, [personnelList]);

  // Search filter inside this subset
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return multiDutyPersonnel;
    const q = searchQuery.toLowerCase().trim();
    return multiDutyPersonnel.filter(p => {
      return (
        p.fullName.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        (p.parentDepartment && p.parentDepartment.toLowerCase().includes(q)) ||
        (p.subDepartment && p.subDepartment.toLowerCase().includes(q)) ||
        (p.curricula && p.curricula.some(c => c.toLowerCase().includes(q))) ||
        (p.academicLevels && p.academicLevels.some(l => l.toLowerCase().includes(q))) ||
        p.position.toLowerCase().includes(q) ||
        (p.major && p.major.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.lineId && p.lineId.toLowerCase().includes(q)) ||
        p.primaryDuties.some(d => d.toLowerCase().includes(q))
      );
    });
  }, [multiDutyPersonnel, searchQuery]);

  if (!isOpen) return null;

  const sodRiskCount = multiDutyPersonnel.filter(
    p => p.primaryDuties.includes('การเงิน') && p.primaryDuties.includes('พัสดุ')
  ).length;

  const getDutyColor = (duty: PrimaryDuty) => {
    switch (duty) {
      case 'การเงิน': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'บัญชี': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'พัสดุ': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'งบประมาณ': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredList, 
      `MCU_Personnel_MultiDuties_3plus_${new Date().toISOString().slice(0, 10)}.csv`
    );
  };

  const handlePersonClick = (person: Personnel) => {
    onClose();
    onSelectPerson(person);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      id="multi-duty-modal-backdrop"
    >
      <div 
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
        id="multi-duty-modal-container"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-900 via-pink-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/30 border border-rose-400/40 flex items-center justify-center text-rose-200 shrink-0 shadow-inner">
              <AlertTriangle className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  ผู้ปฏิบัติหน้าที่ควบตั้งแต่ 3 ด้านขึ้นไป
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/40 text-rose-100 text-xs font-semibold border border-rose-400/30">
                  {multiDutyPersonnel.length} ท่าน
                </span>
              </div>
              <p className="text-xs text-rose-200/90 font-body">
                ชุดข้อมูลตรวจสอบข้อสังเกตภาระงานควบ เพื่อการบริหารอัตรากำลังและการกำกับติดตามตามหลักธรรมาภิบาล มจร
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Context Sub-banner */}
        <div className="px-6 py-2.5 bg-rose-50/80 border-b border-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-900 shrink-0">
          <div className="flex items-center gap-2 font-body">
            <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
            <span>
              ข้อสังเกตงานตรวจสอบ: พบผู้ปฏิบัติงานที่มีภาระงานควบทั้ง <span className="font-semibold">การเงิน</span> และ <span className="font-semibold">พัสดุ</span> (ความเสี่ยง SoD) จำนวน <span className="font-bold text-rose-800">{sodRiskCount} ท่าน</span> จากทั้งหมด {multiDutyPersonnel.length} ท่าน
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 font-medium transition cursor-pointer shadow-2xs text-xs"
              title="ส่งออกรายชื่อผู้ปฏิบัติหน้าที่ควบ 3 ด้านขึ้นไปเป็นไฟล์ CSV"
            >
              <Download className="w-3.5 h-3.5 text-rose-700" />
              <span>ส่งออก CSV ({filteredList.length} ท่าน)</span>
            </button>
          </div>
        </div>

        {/* Controls Bar: Search, View Mode, and Direct Filter Navigation */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, ส่วนงาน, หลักสูตร, ตำแหน่ง, เบอร์โทร..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 font-body"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-white shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-rose-50 text-rose-900 border border-rose-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">การ์ด</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-rose-50 text-rose-900 border border-rose-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ตารางข้อมูล</span>
              </button>
            </div>

            {/* Filter in Directory */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToDirectoryWithFilter();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-medium transition cursor-pointer shrink-0 shadow-xs"
              title="เปิดดูรายชื่อทั้งหมด 20 ท่าน ในทำเนียบผู้ปฏิบัติงาน"
            >
              <span>เปิดดูในทำเนียบ ({filteredList.length} คน)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-3 bg-white rounded-xl border border-slate-200 p-8">
              <UserCheck className="w-12 h-12 mx-auto text-slate-300" />
              <div className="font-semibold text-slate-800">ไม่พบข้อมูลที่ตรงกับคำค้นหา</div>
              <p className="text-xs font-body text-slate-500 max-w-sm mx-auto">
                คำค้นหา "{searchQuery}" ไม่ตรงกับชื่อ ส่วนงาน หรือภาระงานของบุคลากรกลุ่มนี้
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-medium cursor-pointer"
              >
                ล้างคำค้นหา
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((person, idx) => {
                const hasSodConflict = person.primaryDuties.includes('การเงิน') && person.primaryDuties.includes('พัสดุ');
                const { years } = calculateTenure(person.startDate);

                return (
                  <div
                    key={person.id}
                    onClick={() => handlePersonClick(person)}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:shadow-md transition flex flex-col justify-between space-y-3.5 cursor-pointer group relative"
                  >
                    <div>
                      {/* Card Header: Index, Name, Position, SoD tag */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-900 transition flex items-center gap-1.5">
                              <span>{person.fullName}</span>
                            </h4>
                            <p className="text-xs text-slate-600 font-body">
                              {person.position}
                            </p>
                          </div>
                        </div>

                        {hasSodConflict && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>เสี่ยง SoD</span>
                          </span>
                        )}
                      </div>

                      {/* Department & Subunit Hierarchy */}
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                          <span className="truncate">{person.parentDepartment || person.department}</span>
                        </div>
                        {person.subDepartment && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 pl-5 font-body">
                            <span className="text-slate-400">↳</span>
                            <span className="truncate">{person.subDepartment}</span>
                          </div>
                        )}
                      </div>

                      {/* Curricula & Academic Levels if available */}
                      {((person.curricula && person.curricula.length > 0) || (person.academicLevels && person.academicLevels.length > 0)) && (
                        <div className="mt-2 space-y-1 text-[11px] font-body">
                          {person.curricula && person.curricula.length > 0 && (
                            <div className="flex items-start gap-1 text-slate-600">
                              <BookOpen className="w-3 h-3 text-pink-700 shrink-0 mt-0.5" />
                              <span className="text-slate-700 line-clamp-1">
                                {person.curricula.join(', ')}
                              </span>
                            </div>
                          )}
                          {person.academicLevels && person.academicLevels.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap pl-4">
                              {person.academicLevels.map(lvl => (
                                <span key={lvl} className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                                  {lvl}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Primary Duties Badges */}
                      <div className="mt-3">
                        <div className="text-[11px] font-medium text-slate-500 mb-1">
                          หน้าที่ควบ ({person.primaryDuties.length} ด้าน):
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {person.primaryDuties.map(d => (
                            <span
                              key={d}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getDutyColor(d)}`}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Duty description snippet */}
                      {person.dutyDescription && (
                        <p className="text-[11px] text-slate-500 font-body mt-2 line-clamp-2 italic bg-slate-50/70 p-1.5 rounded border border-slate-100">
                          "{person.dutyDescription}"
                        </p>
                      )}
                    </div>

                    {/* Footer Row: Contact, Tenure & Action button */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>อายุงาน {years} ปี</span>
                        </span>
                        {person.phone && (
                          <span className="flex items-center gap-1 text-slate-700">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{person.phone}</span>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePersonClick(person);
                        }}
                        className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 font-semibold cursor-pointer group-hover:underline text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูข้อมูลครบ 10 ด้าน</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-2.5 text-center w-10">#</th>
                      <th className="p-2.5 min-w-[170px]">ชื่อ-นามสกุล / ตำแหน่ง</th>
                      <th className="p-2.5 min-w-[200px]">ส่วนงาน / ส่วนงานย่อย / หลักสูตร</th>
                      <th className="p-2.5 min-w-[200px]">ภาระหน้าที่ควบ (3-4 ด้าน)</th>
                      <th className="p-2.5 min-w-[90px] text-center">ความเสี่ยง SoD</th>
                      <th className="p-2.5 min-w-[120px]">การศึกษา</th>
                      <th className="p-2.5 min-w-[110px]">เบอร์โทร / Line</th>
                      <th className="p-2.5 text-center min-w-[80px]">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-body">
                    {filteredList.map((person, idx) => {
                      const hasSodConflict = person.primaryDuties.includes('การเงิน') && person.primaryDuties.includes('พัสดุ');
                      const { years } = calculateTenure(person.startDate);

                      return (
                        <tr
                          key={person.id}
                          onClick={() => handlePersonClick(person)}
                          className="hover:bg-rose-50/40 transition cursor-pointer group"
                        >
                          <td className="p-2.5 text-center font-bold text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900 group-hover:text-rose-900 transition">
                              {person.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {person.position}
                            </div>
                          </td>
                          <td className="p-2.5">
                            <div className="font-medium text-slate-800">
                              {person.parentDepartment || person.department}
                            </div>
                            {person.subDepartment && (
                              <div className="text-[11px] text-slate-600">
                                ↳ {person.subDepartment}
                              </div>
                            )}
                            {person.curricula && person.curricula.length > 0 && (
                              <div className="text-[10px] text-pink-700 truncate max-w-xs mt-0.5">
                                • {person.curricula.join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5">
                            <div className="flex flex-wrap gap-1">
                              {person.primaryDuties.map(d => (
                                <span
                                  key={d}
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getDutyColor(d)}`}
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-2.5 text-center">
                            {hasSodConflict ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                                <span>เสี่ยง SoD</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-2.5">
                            <div className="font-medium text-slate-800">
                              {person.educationLevel}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                              {person.major}
                            </div>
                          </td>
                          <td className="p-2.5">
                            <div className="text-slate-800">
                              {person.phone || '-'}
                            </div>
                            {person.lineId && (
                              <div className="text-[11px] text-slate-500">
                                Line: {person.lineId}
                              </div>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePersonClick(person);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-medium transition cursor-pointer text-[11px]"
                            >
                              <Eye className="w-3 h-3" />
                              <span>ดูข้อมูล</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <div>
            แสดงผล <span className="font-bold text-slate-900">{filteredList.length}</span> จากทั้งหมด <span className="font-bold text-rose-900">{multiDutyPersonnel.length} ท่าน</span> (ปฏิบัติหน้าที่ควบตั้งแต่ 3 ด้านขึ้นไป)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium transition cursor-pointer text-xs"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
