import React, { useMemo } from 'react';
import { Personnel } from '../types';
import { 
  GraduationCap, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ArrowRight, 
  BookOpen, 
  ShieldAlert, 
  FileText,
  TrendingUp,
  UserCheck,
  Award
} from 'lucide-react';
import { calculateAlignmentSummary, INSTITUTIONAL_AUDIT_RECOMMENDATIONS } from '../utils/educationAlignment';

interface EducationAlignmentSectionProps {
  personnelList: Personnel[];
  onOpenAlignmentModal: () => void;
  onFilterNonAligned: () => void;
}

export const EducationAlignmentSection: React.FC<EducationAlignmentSectionProps> = ({
  personnelList,
  onOpenAlignmentModal,
  onFilterNonAligned,
}) => {
  const stats = useMemo(() => {
    return calculateAlignmentSummary(personnelList);
  }, [personnelList]);

  return (
    <div 
      id="education-alignment-section" 
      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-800 flex items-center justify-center shrink-0 border border-pink-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                การวิเคราะห์ความสอดคล้องของสาขาการศึกษากับภาระงานที่ได้รับมอบหมาย
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-100 text-pink-800 border border-pink-200">
                ข้อมูลวิเคราะห์เชิงตรวจสอบ
              </span>
            </div>
            <p className="text-xs text-slate-500 font-body mt-0.5">
              การประเมินคุณวุฒิการศึกษากับมาตรฐานวิชาชีพด้านการเงิน บัญชี พัสดุ และงบประมาณ ส่วนงานย่อย มจร ({stats.total} ท่าน)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAlignmentModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>ดูรายละเอียดและข้อเสนอแนะฉบับเต็ม</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Direct Match */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              <span>ตรงสายงานโดยตรง</span>
            </span>
            <span className="text-xs font-bold text-emerald-700">{stats.directPct}%</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {stats.directCount} <span className="text-xs font-normal text-slate-500">ท่าน</span>
            </div>
            <p className="text-[11px] text-emerald-800 font-body mt-1 leading-relaxed">
              จบสาขาการบัญชี, การเงิน หรือนิติศาสตร์ตรงกับภาระหน้าที่ มีความพร้อมด้านวิชาชีพสูง
            </p>
          </div>
          <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${stats.directPct}%` }} />
          </div>
        </div>

        {/* 2. Related Field */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-700" />
              <span>สายใกล้เคียง / ประยุกต์ได้</span>
            </span>
            <span className="text-xs font-bold text-blue-700">{stats.relatedPct}%</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {stats.relatedCount} <span className="text-xs font-normal text-slate-500">ท่าน</span>
            </div>
            <p className="text-[11px] text-blue-800 font-body mt-1 leading-relaxed">
              จบบริหารธุรกิจ, การจัดการ, รัฐประศาสนศาสตร์ มีพื้นฐานด้านกระบวนการและเอกสารราชการ
            </p>
          </div>
          <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${stats.relatedPct}%` }} />
          </div>
        </div>

        {/* 3. Non-aligned (Needs Supervision) */}
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-700" />
              <span>ไม่ตรงสายงาน</span>
            </span>
            <span className="text-xs font-bold text-rose-700">{stats.nonAlignedPct}%</span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-rose-900 flex items-baseline gap-2">
              <span>{stats.nonAlignedCount}</span>
              <span className="text-xs font-normal text-slate-500">ท่าน</span>
              <span className="text-[10px] font-semibold text-rose-700 px-1.5 py-0.2 rounded bg-rose-100 border border-rose-200">
                ประเด็นติดตาม
              </span>
            </div>
            <p className="text-[11px] text-rose-800 font-body mt-1 leading-relaxed">
              จบสาขาอื่น เช่น พระพุทธศาสนา, การศึกษา, ภาษา, สังคมศาสตร์ ควรมีระบบพี่เลี้ยงและคู่มือ SOP
            </p>
          </div>
          <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-600 rounded-full" style={{ width: `${stats.nonAlignedPct}%` }} />
          </div>
        </div>
      </div>

      {/* Duty-Specific Breakdown Grid */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-pink-700" />
            <span>สัดส่วนความตรงสายงานจำแนกรายภาระหน้าที่หลัก</span>
          </div>
          <span className="text-[11px] text-slate-500 font-body">
            ความเสี่ยงวัดจากสัดส่วนผู้ปฏิบัติงานที่ไม่ตรงสายงาน
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Accounting */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>1. งานบัญชี</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {stats.dutyAlignment.accounting.total} คน
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-body">
              <span>ตรงสาย (การบัญชี):</span>
              <span className="font-bold text-emerald-700">{stats.dutyAlignment.accounting.direct} คน</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-body">
              <span>ไม่ตรงสายงาน:</span>
              <span className="font-bold text-rose-700">{stats.dutyAlignment.accounting.nonAligned} คน ({stats.dutyAlignment.accounting.riskRate}%)</span>
            </div>
          </div>

          {/* Finance */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>2. งานการเงิน</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {stats.dutyAlignment.finance.total} คน
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-body">
              <span>ตรงสาย / ใกล้เคียง:</span>
              <span className="font-bold text-emerald-700">{stats.dutyAlignment.finance.direct + stats.dutyAlignment.finance.related} คน</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-body">
              <span>ไม่ตรงสายงาน:</span>
              <span className="font-bold text-rose-700">{stats.dutyAlignment.finance.nonAligned} คน ({stats.dutyAlignment.finance.riskRate}%)</span>
            </div>
          </div>

          {/* Supplies */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>3. งานพัสดุ</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-pink-50 text-pink-700 border border-pink-200">
                {stats.dutyAlignment.supplies.total} คน
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-body">
              <span>ตรงสาย / ใกล้เคียง:</span>
              <span className="font-bold text-emerald-700">{stats.dutyAlignment.supplies.direct + stats.dutyAlignment.supplies.related} คน</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-body">
              <span>ไม่ตรงสายงาน:</span>
              <span className="font-bold text-rose-700">{stats.dutyAlignment.supplies.nonAligned} คน ({stats.dutyAlignment.supplies.riskRate}%)</span>
            </div>
          </div>

          {/* Budget */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>4. งานงบประมาณ</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                {stats.dutyAlignment.budget.total} คน
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-body">
              <span>ตรงสาย / ใกล้เคียง:</span>
              <span className="font-bold text-emerald-700">{stats.dutyAlignment.budget.direct + stats.dutyAlignment.budget.related} คน</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-body">
              <span>ไม่ตรงสายงาน:</span>
              <span className="font-bold text-rose-700">{stats.dutyAlignment.budget.nonAligned} คน ({stats.dutyAlignment.budget.riskRate}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Audit Recommendations Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-rose-700" />
            <span>ข้อเสนอแนะเชิงยุทธศาสตร์และการกำกับติดตาม (Institutional Audit Recommendations)</span>
          </div>
          <button
            type="button"
            onClick={onOpenAlignmentModal}
            className="text-xs text-pink-700 hover:text-pink-900 font-semibold cursor-pointer"
          >
            ดูข้อเสนอแนะทั้ง 4 มิติ &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-body">
          {INSTITUTIONAL_AUDIT_RECOMMENDATIONS.slice(0, 2).map((rec, i) => (
            <div 
              key={rec.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-pink-300 hover:shadow-2xs transition space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-900">{rec.pillar}</span>
                <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
                  {rec.priority.split(' ')[0]}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {rec.description}
              </p>
              <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>หน่วยงานรับผิดชอบ: {rec.responsibleUnit.split(' ')[0]}</span>
                <span className="text-pink-700 font-medium">ระยะเวลา: {rec.followUpPeriod}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer link to filter */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <span className="text-slate-500 font-body">
          พบผู้ปฏิบัติงานที่ไม่ตรงสายงาน <span className="font-bold text-rose-800">{stats.nonAlignedCount} ท่าน</span> จากทั้งหมด {stats.total} ท่าน
        </span>
        <button
          type="button"
          onClick={onFilterNonAligned}
          className="inline-flex items-center gap-1.5 text-rose-700 hover:text-rose-900 font-semibold cursor-pointer"
        >
          <span>กรองดูรายชื่อผู้ปฏิบัติงานไม่ตรงสายงานในทำเนียบ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
