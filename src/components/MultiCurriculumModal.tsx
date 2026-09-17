import React, { useState } from 'react';
import { Personnel } from '../types';
import { 
  X, 
  BookOpen, 
  Layers, 
  Search, 
  Phone, 
  Mail, 
  Building2, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { calculateTenure } from '../utils/helpers';

interface MultiCurriculumModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelList: Personnel[];
  onSelectPerson: (person: Personnel) => void;
  onNavigateToDirectoryWithFilter: () => void;
}

export const MultiCurriculumModal: React.FC<MultiCurriculumModalProps> = ({
  isOpen,
  onClose,
  personnelList,
  onSelectPerson,
  onNavigateToDirectoryWithFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('');

  if (!isOpen) return null;

  // Filter only personnel with multi-curriculum responsibility
  const multiCurriculumPersonnel = personnelList.filter(
    p => p.isMultiCurriculum || (p.curricula && p.curricula.length > 1)
  );

  // Search and level filter
  const filteredList = multiCurriculumPersonnel.filter(p => {
    if (selectedLevelFilter && (!p.academicLevels || !p.academicLevels.includes(selectedLevelFilter))) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      (p.parentDepartment && p.parentDepartment.toLowerCase().includes(q)) ||
      (p.subDepartment && p.subDepartment.toLowerCase().includes(q)) ||
      (p.curricula && p.curricula.some(c => c.toLowerCase().includes(q))) ||
      p.position.toLowerCase().includes(q)
    );
  });

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'ปริญญาตรี':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'ปริญญาโท':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ปริญญาเอก':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ประกาศนียบัตร / ป.บัณฑิต':
      case 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        id="multi-curriculum-modal"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-pink-800 text-white p-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Layers className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  บุคลากรที่ดูแลภาระงานหลายหลักสูตร / ข้ามระดับชั้น
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-100 border border-indigo-400/40">
                  {multiCurriculumPersonnel.length} ท่าน
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 font-body mt-0.5">
                รายชื่อบุคลากรผู้รับผิดชอบงานการเงิน บัญชี พัสดุ หรืองบประมาณ ที่ครอบคลุมมากกว่า 1 หลักสูตร หรือดูแลข้ามระดับการศึกษา
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action / Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, ส่วนงาน, หลักสูตรที่ดูแล หรือตำแหน่ง..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-body placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-medium shrink-0">ระดับชั้น:</span>
            <button
              type="button"
              onClick={() => setSelectedLevelFilter('')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                selectedLevelFilter === ''
                  ? 'bg-indigo-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              ทั้งหมด
            </button>
            {['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก', 'ประกาศนียบัตร / ป.บัณฑิต'].map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevelFilter(selectedLevelFilter === lvl ? '' : lvl)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium border ${
                  selectedLevelFilter === lvl
                    ? 'bg-indigo-700 text-white border-indigo-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50'
                }`}
              >
                {lvl === 'ประกาศนียบัตร / ป.บัณฑิต' ? 'ป.บัณฑิต' : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Personnel List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-body text-xs">
              ไม่พบบุคลากรที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            filteredList.map((person, index) => {
              const tenure = calculateTenure(person.startDate);
              const curriculaList = person.curricula || [];
              const academicLevelsList = person.academicLevels || [];

              return (
                <div 
                  key={person.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-xs transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-800 font-bold flex items-center justify-center shrink-0 border border-indigo-200 text-xs">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 
                            onClick={() => {
                              onClose();
                              onSelectPerson(person);
                            }}
                            className="text-sm font-bold text-slate-900 hover:text-indigo-800 cursor-pointer transition truncate"
                          >
                            {person.fullName}
                          </h4>
                          <span className="text-xs text-indigo-700 font-medium">
                            ({person.position})
                          </span>

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            ดูแล {curriculaList.length} หลักสูตร
                          </span>
                        </div>

                        {/* Department Hierarchy */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-800">{person.parentDepartment || person.department}</span>
                          {person.subDepartment && (
                            <>
                              <span className="text-slate-300">›</span>
                              <span className="text-slate-600">{person.subDepartment}</span>
                            </>
                          )}
                        </div>

                        {/* Academic Levels */}
                        {academicLevelsList.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-[11px] text-slate-400 font-medium">ระดับชั้น:</span>
                            {academicLevelsList.map(level => (
                              <span
                                key={level}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getLevelBadgeColor(level)}`}
                              >
                                {level}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* List of Curricula Handled */}
                        {curriculaList.length > 0 && (
                          <div className="mt-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1.5">
                              <BookOpen className="w-3 h-3 text-indigo-600" />
                              <span>หลักสูตรที่ดูแลรับผิดชอบ:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {curriculaList.map(curr => (
                                <span
                                  key={curr}
                                  className="px-2 py-1 rounded bg-white text-slate-800 border border-slate-200 text-[11px] font-medium"
                                >
                                  {curr}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Duties & Contact Row */}
                        <div className="flex items-center justify-between gap-4 mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 font-body">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-slate-400">หน้าที่หลัก:</span>
                            {person.primaryDuties.map(d => (
                              <span key={d} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                                {d}
                              </span>
                            ))}
                            <span className="text-slate-300">•</span>
                            <span>อายุงาน {tenure.text}</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {person.phone && (
                              <a 
                                href={`tel:${person.phone}`}
                                className="flex items-center gap-1 text-slate-600 hover:text-indigo-800 text-[11px]"
                              >
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{person.phone}</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectPerson(person);
                              }}
                              className="text-indigo-700 hover:text-indigo-900 font-medium text-[11px] flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>ดูประวัติ</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 font-body">
            แสดง {filteredList.length} จากทั้งหมด {multiCurriculumPersonnel.length} ท่าน ที่มีภาระงานดูแลหลายหลักสูตร
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer"
            >
              ปิด
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToDirectoryWithFilter();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <span>กรองดูในทำเนียบผู้ปฏิบัติงาน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
