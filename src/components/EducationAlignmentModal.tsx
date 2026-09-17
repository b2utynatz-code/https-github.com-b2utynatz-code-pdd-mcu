import React, { useState, useMemo } from 'react';
import { Personnel, PrimaryDuty } from '../types';
import { 
  X, 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Search, 
  Download, 
  Eye, 
  Building2, 
  Award, 
  BookOpen, 
  Clock, 
  Layers, 
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckSquare
} from 'lucide-react';
import { 
  evaluatePersonnelAlignment, 
  calculateAlignmentSummary, 
  INSTITUTIONAL_AUDIT_RECOMMENDATIONS 
} from '../utils/educationAlignment';

interface EducationAlignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelList: Personnel[];
  onSelectPerson: (person: Personnel) => void;
  onNavigateToDirectoryWithFilter?: (filterLevel: string) => void;
}

export const EducationAlignmentModal: React.FC<EducationAlignmentModalProps> = ({
  isOpen,
  onClose,
  personnelList,
  onSelectPerson,
  onNavigateToDirectoryWithFilter,
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'personnel' | 'matrix'>('recommendations');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'direct' | 'related' | 'non_aligned'>('all');
  const [dutyFilter, setDutyFilter] = useState<string>('all');

  const stats = useMemo(() => calculateAlignmentSummary(personnelList), [personnelList]);

  // Evaluated personnel list
  const evaluatedList = useMemo(() => {
    return personnelList.map(p => ({
      person: p,
      evaluation: evaluatePersonnelAlignment(p),
    }));
  }, [personnelList]);

  // Filtered list
  const filteredList = useMemo(() => {
    return evaluatedList.filter(({ person, evaluation }) => {
      // Level filter
      if (levelFilter !== 'all' && evaluation.level !== levelFilter) {
        return false;
      }

      // Duty filter
      if (dutyFilter !== 'all' && !person.primaryDuties.includes(dutyFilter as PrimaryDuty)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          person.fullName.toLowerCase().includes(q) ||
          person.department.toLowerCase().includes(q) ||
          (person.parentDepartment && person.parentDepartment.toLowerCase().includes(q)) ||
          person.major.toLowerCase().includes(q) ||
          person.position.toLowerCase().includes(q) ||
          evaluation.reason.toLowerCase().includes(q) ||
          person.primaryDuties.some(d => d.toLowerCase().includes(q));

        if (!matches) return false;
      }

      return true;
    });
  }, [evaluatedList, levelFilter, dutyFilter, searchQuery]);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    const headers = [
      'ลำดับ',
      'ส่วนงาน',
      'หน่วยงานหลัก',
      'ส่วนงานย่อย',
      'ชื่อ-นามสกุล',
      'ตำแหน่ง',
      'ระดับการศึกษา',
      'สาขาวิชาที่สำเร็จการศึกษา',
      'ภาระหน้าที่หลักที่ได้รับมอบหมาย',
      'ผลการประเมินความตรงสายงาน',
      'เหตุผลการประเมิน',
      'ข้อเสนอแนะเชิงกำกับติดตาม',
      'เบอร์โทรศัพท์'
    ];

    const rows = evaluatedList.map(({ person, evaluation }, index) => [
      index + 1,
      `"${person.department.replace(/"/g, '""')}"`,
      `"${(person.parentDepartment || '').replace(/"/g, '""')}"`,
      `"${(person.subDepartment || '').replace(/"/g, '""')}"`,
      `"${person.fullName.replace(/"/g, '""')}"`,
      `"${person.position.replace(/"/g, '""')}"`,
      `"${person.educationLevel.replace(/"/g, '""')}"`,
      `"${person.major.replace(/"/g, '""')}"`,
      `"${person.primaryDuties.join(', ')}"`,
      `"${evaluation.levelLabel}"`,
      `"${evaluation.reason.replace(/"/g, '""')}"`,
      `"${evaluation.recommendation.replace(/"/g, '""')}"`,
      `"${person.phone || '-'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MCU_Education_Job_Alignment_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePersonClick = (person: Personnel) => {
    onClose();
    onSelectPerson(person);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      id="education-alignment-modal-backdrop"
    >
      <div 
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
        id="education-alignment-modal-container"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-900 via-rose-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-pink-200 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  การวิเคราะห์คุณวุฒิการศึกษากับภาระงาน และข้อเสนอแนะเชิงกำกับติดตาม
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/40 text-pink-100 text-xs font-semibold border border-pink-400/30">
                  {stats.total} ท่าน
                </span>
              </div>
              <p className="text-xs text-pink-200/90 font-body">
                ระบบสารสนเทศเพื่อการกำกับติดตามด้านการบริหารอัตรากำลังและการควบคุมภายใน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-pink-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Summary Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap font-body">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>ตรงสายงาน: <strong className="font-semibold">{stats.directCount} ท่าน ({stats.directPct}%)</strong></span>
            </span>
            <span className="flex items-center gap-1.5 text-blue-800">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>สายใกล้เคียง: <strong className="font-semibold">{stats.relatedCount} ท่าน ({stats.relatedPct}%)</strong></span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>ไม่ตรงสายงาน: <strong>{stats.nonAlignedCount} ท่าน ({stats.nonAlignedPct}%)</strong></span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-medium transition cursor-pointer text-xs shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>ส่งออกรายงานวิเคราะห์ (CSV)</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'recommendations'
                ? 'border-pink-700 text-pink-900 bg-pink-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-pink-700" />
            <span>ข้อเสนอแนะเชิงยุทธศาสตร์ 4 มิติ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('personnel')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'personnel'
                ? 'border-pink-700 text-pink-900 bg-pink-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-pink-700" />
            <span>รายชื่อและผลวิเคราะห์รายบุคคล ({filteredList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'matrix'
                ? 'border-pink-700 text-pink-900 bg-pink-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-pink-700" />
            <span>สถิติความเสี่ยงแยกตามภาระหน้าที่</span>
          </button>
        </div>

        {/* Tab 1: Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
            {/* Top context card */}
            <div className="p-4 rounded-xl bg-pink-50 border border-pink-200 text-xs text-pink-950 flex items-start gap-3 shadow-2xs font-body">
              <ShieldAlert className="w-5 h-5 text-pink-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-pink-900 text-sm mb-1">
                  บทวิเคราะห์เชิงตรวจสอบภายใน (Audit Insights & Rationale)
                </div>
                <p className="leading-relaxed">
                  จากการสำรวจข้อมูลผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณในส่วนงานย่อย มจร พบว่ามีบุคลากรที่สำเร็จการศึกษาไม่ตรงสายงานถึง <strong>{stats.nonAlignedCount} ท่าน ({stats.nonAlignedPct}%)</strong> โดยเฉพาะในส่วนงานภูมิภาคและหลักสูตรระดับบัณฑิตศึกษา ซึ่งส่วนใหญ่สำเร็จการศึกษาทางพระพุทธศาสนา ครุศาสตร์ สังคมศาสตร์ หรือภาษาศาสตร์ การขาดคุณวุฒิด้านการบัญชีและกฎหมายพัสดุก่อให้เกิดความเสี่ยงต่อข้อผิดพลาดในการบันทึกบัญชี 3 มิติ และกระบวนการจัดซื้อจัดจ้างตาม พ.ร.บ. 2560 ดังนั้น จึงจัดทำข้อเสนอแนะเชิงยุทธศาสตร์เพื่อการกำกับติดตาม ดังนี้:
                </p>
              </div>
            </div>

            {/* 4 Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INSTITUTIONAL_AUDIT_RECOMMENDATIONS.map((rec, index) => (
                <div 
                  key={rec.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-pink-300 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        {rec.priority}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                      {rec.pillar}
                    </h3>
                    <div className="text-xs font-semibold text-pink-800 mb-2">
                      {rec.summary}
                    </div>

                    <p className="text-xs text-slate-600 font-body leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] font-body bg-slate-50/70 p-2.5 rounded-xl">
                    <div className="flex items-start gap-1 text-slate-700">
                      <span className="font-semibold text-slate-900 shrink-0">กลุ่มเป้าหมาย:</span>
                      <span className="text-slate-600">{rec.targetAudience}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>หน่วยงานหลัก: <strong className="text-slate-800">{rec.responsibleUnit}</strong></span>
                      <span className="text-pink-700 font-semibold">{rec.followUpPeriod}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Bar */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900">ต้องการดูรายชื่อผู้ปฏิบัติงานที่ไม่ตรงสายงานเพื่อวางแผนพัฒนาทักษะ?</span>
                <p className="text-slate-500 font-body">สามารถคัดกรองบุคลากร 49 ท่าน เพื่อส่งรายชื่อเข้ารับการอบรมบัญชีและพัสดุได้ทันที</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLevelFilter('non_aligned');
                  setActiveTab('personnel');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-medium transition cursor-pointer shrink-0 shadow-xs"
              >
                <span>ดูรายชื่อไม่ตรงสายงาน ({stats.nonAlignedCount} ท่าน)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Personnel List & Individual Alignment Evaluation */}
        {activeTab === 'personnel' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ, ส่วนงาน, สาขาวิชาที่จบ, ภาระงาน..."
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

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <button
                  type="button"
                  onClick={() => setLevelFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    levelFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ทั้งหมด ({evaluatedList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLevelFilter('non_aligned')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                    levelFilter === 'non_aligned'
                      ? 'bg-rose-700 text-white'
                      : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>ไม่ตรงสาย ({stats.nonAlignedCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLevelFilter('related')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                    levelFilter === 'related'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>สายใกล้เคียง ({stats.relatedCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLevelFilter('direct')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                    levelFilter === 'direct'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ตรงสายโดยตรง ({stats.directCount})</span>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 space-y-3">
              {filteredList.length === 0 ? (
                <div className="text-center py-16 text-slate-500 space-y-2 bg-white rounded-xl border border-slate-200 p-8">
                  <GraduationCap className="w-10 h-10 mx-auto text-slate-300" />
                  <div className="font-semibold text-slate-800 text-xs">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</div>
                  <button
                    type="button"
                    onClick={() => {
                      setLevelFilter('all');
                      setSearchQuery('');
                    }}
                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-medium cursor-pointer"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                </div>
              ) : (
                filteredList.map(({ person, evaluation }, idx) => {
                  const isDirect = evaluation.level === 'direct';
                  const isRelated = evaluation.level === 'related';
                  const isNonAligned = evaluation.level === 'non_aligned';

                  return (
                    <div
                      key={person.id}
                      onClick={() => handlePersonClick(person)}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-pink-300 hover:shadow-md transition cursor-pointer group space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-pink-900 transition">
                                {person.fullName}
                              </h4>
                              <span className="text-xs text-slate-500 font-body">
                                ({person.position})
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 font-body mt-0.5 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-pink-700 shrink-0" />
                              <span>{person.department}</span>
                              {person.subDepartment && (
                                <span className="text-slate-400">↳ {person.subDepartment}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Alignment Badge */}
                        <div className="shrink-0">
                          {isDirect && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>ตรงสายงาน</span>
                            </span>
                          )}
                          {isRelated && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                              <span>สายใกล้เคียง</span>
                            </span>
                          )}
                          {isNonAligned && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                              <span>ไม่ตรงสายงาน</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Education vs Duties Comparison Box */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-body">
                        <div>
                          <span className="text-[11px] text-slate-500 font-medium">สาขาที่สำเร็จการศึกษา:</span>
                          <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3.5 h-3.5 text-pink-700 shrink-0" />
                            <span>{person.educationLevel} สาขา{person.major}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-500 font-medium">ภาระหน้าที่ที่ได้รับมอบหมาย:</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {person.primaryDuties.map(d => (
                              <span key={d} className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white text-slate-700 border border-slate-200">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Recommendation & Reason */}
                      <div className="text-xs font-body space-y-1">
                        <div className="text-slate-600">
                          <strong className="text-slate-800 font-medium">ข้อสังเกต:</strong> {evaluation.reason}
                        </div>
                        <div className="text-pink-900 bg-pink-50/70 p-2 rounded border border-pink-100/80">
                          <strong className="font-semibold">ข้อเสนอแนะงานกำกับติดตาม:</strong> {evaluation.recommendation}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>เบอร์ติดต่อ: {person.phone || '-'} {person.lineId ? `(Line: ${person.lineId})` : ''}</span>
                        <span className="text-pink-700 group-hover:underline font-semibold flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>ดูข้อมูลครบ 10 ด้าน</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Risk Matrix by Duty */}
        {activeTab === 'matrix' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-pink-700" />
                <span>การวิเคราะห์ความเสี่ยงด้านคุณวุฒิรายภาระหน้าที่ (Duty-specific Qualification Risk)</span>
              </h3>
              <p className="text-xs text-slate-600 font-body">
                แสดงจำนวนบุคลากรที่ปฏิบัติหน้าที่ในแต่ละด้าน เทียบกับคุณวุฒิตรงสายงาน เพื่อระบุภาระงานที่มีความเสี่ยงเชิงโครงสร้างสูงสุด
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* 1. Accounting */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">งานบัญชี (Accounting)</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      ไม่ตรงสาย {stats.dutyAlignment.accounting.riskRate}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-body">
                    มีผู้ปฏิบัติงานทั้งหมด {stats.dutyAlignment.accounting.total} คน จบตรงสายการบัญชี {stats.dutyAlignment.accounting.direct} คน ไม่ตรงสาย {stats.dutyAlignment.accounting.nonAligned} คน
                  </p>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${Math.round((stats.dutyAlignment.accounting.direct / stats.dutyAlignment.accounting.total) * 100)}%` }} title="ตรงสาย" />
                    <div className="bg-blue-400 h-full" style={{ width: `${Math.round((stats.dutyAlignment.accounting.related / stats.dutyAlignment.accounting.total) * 100)}%` }} title="สายใกล้เคียง" />
                    <div className="bg-rose-500 h-full" style={{ width: `${stats.dutyAlignment.accounting.riskRate}%` }} title="ไม่ตรงสาย" />
                  </div>
                  <div className="text-[11px] text-rose-800 bg-rose-50 p-2 rounded border border-rose-200 font-body">
                    <strong>ข้อเสนอแนะ:</strong> กำหนดเป็นภาระงานเร่งด่วนอันดับ 1 ที่ต้องจัดอบรมผังบัญชีและมาตรฐานการรายงานทางการเงินภาครัฐ
                  </div>
                </div>

                {/* 2. Supplies */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">งานพัสดุ (Procurement)</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      ไม่ตรงสาย {stats.dutyAlignment.supplies.riskRate}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-body">
                    มีผู้ปฏิบัติงานทั้งหมด {stats.dutyAlignment.supplies.total} คน จบตรงสาย/กฎหมาย/ผ่านอบรม {stats.dutyAlignment.supplies.direct} คน ไม่ตรงสาย {stats.dutyAlignment.supplies.nonAligned} คน
                  </p>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${Math.round((stats.dutyAlignment.supplies.direct / stats.dutyAlignment.supplies.total) * 100)}%` }} title="ตรงสาย" />
                    <div className="bg-blue-400 h-full" style={{ width: `${Math.round((stats.dutyAlignment.supplies.related / stats.dutyAlignment.supplies.total) * 100)}%` }} title="สายใกล้เคียง" />
                    <div className="bg-rose-500 h-full" style={{ width: `${stats.dutyAlignment.supplies.riskRate}%` }} title="ไม่ตรงสาย" />
                  </div>
                  <div className="text-[11px] text-rose-800 bg-rose-50 p-2 rounded border border-rose-200 font-body">
                    <strong>ข้อเสนอแนะ:</strong> ส่งเสริมการสอบผ่านหลักสูตรผู้ปฏิบัติงานด้านพัสดุของกรมบัญชีกลางเพื่อรับสิทธิ์และมาตรฐานตามกฎหมาย
                  </div>
                </div>

                {/* 3. Finance */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">งานการเงิน (Finance)</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      ไม่ตรงสาย {stats.dutyAlignment.finance.riskRate}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-body">
                    มีผู้ปฏิบัติงานทั้งหมด {stats.dutyAlignment.finance.total} คน ตรงสาย/บริหารจัดการ {stats.dutyAlignment.finance.direct + stats.dutyAlignment.finance.related} คน
                  </p>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${Math.round((stats.dutyAlignment.finance.direct / stats.dutyAlignment.finance.total) * 100)}%` }} />
                    <div className="bg-blue-400 h-full" style={{ width: `${Math.round((stats.dutyAlignment.finance.related / stats.dutyAlignment.finance.total) * 100)}%` }} />
                    <div className="bg-rose-500 h-full" style={{ width: `${stats.dutyAlignment.finance.riskRate}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 font-body">
                    <strong>ข้อเสนอแนะ:</strong> จัดทำ Checklist รายการตรวจหลักฐานการจ่ายเงินและภาษีหัก ณ ที่จ่าย
                  </div>
                </div>

                {/* 4. Budget */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">งานงบประมาณ (Budgeting)</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      ไม่ตรงสาย {stats.dutyAlignment.budget.riskRate}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-body">
                    มีผู้ปฏิบัติงานทั้งหมด {stats.dutyAlignment.budget.total} คน ตรงสาย/บริหารจัดการ {stats.dutyAlignment.budget.direct + stats.dutyAlignment.budget.related} คน
                  </p>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: `${Math.round((stats.dutyAlignment.budget.direct / stats.dutyAlignment.budget.total) * 100)}%` }} />
                    <div className="bg-blue-400 h-full" style={{ width: `${Math.round((stats.dutyAlignment.budget.related / stats.dutyAlignment.budget.total) * 100)}%` }} />
                    <div className="bg-rose-500 h-full" style={{ width: `${stats.dutyAlignment.budget.riskRate}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200 font-body">
                    <strong>ข้อเสนอแนะ:</strong> อบรมการติดตามแผนปฏิบัติราชการและระบบเบิกจ่ายงบประมาณแผ่นดิน/เงินรายได้
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <div>
            รายงานวิเคราะห์ข้อมูลการศึกษาบุคลากรและข้อเสนอแนะงานตรวจสอบ มจร • ข้อมูลทั้งหมด {stats.total} คน
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
