import React from 'react';
import { Personnel, PrimaryDuty } from '../types';
import { 
  Coins, 
  BookOpenCheck, 
  Package, 
  PieChart, 
  AlertTriangle, 
  CheckCircle2, 
  GraduationCap, 
  Clock,
  ArrowRight,
  ShieldAlert,
  Users
} from 'lucide-react';
import { calculateTenure } from '../utils/helpers';
import { CategoryPieChart } from './CategoryPieChart';
import { EducationAlignmentSection } from './EducationAlignmentSection';

interface DashboardStatsProps {
  personnelList: Personnel[];
  onSelectDutyFilter: (duty: PrimaryDuty) => void;
  onSelectCategoryFilter: (category: string) => void;
  onSelectAuditFilter: (status: string) => void;
  onOpenMultiDutyModal: () => void;
  onOpenAlignmentModal?: () => void;
  onFilterNonAligned?: () => void;
  onNavigateToDirectory: () => void;
  onNavigateToMatrix: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  personnelList,
  onSelectDutyFilter,
  onSelectCategoryFilter,
  onSelectAuditFilter,
  onOpenMultiDutyModal,
  onOpenAlignmentModal,
  onFilterNonAligned,
  onNavigateToDirectory,
  onNavigateToMatrix,
}) => {
  const total = personnelList.length;

  // Count by primary duty
  const financeCount = personnelList.filter(p => p.primaryDuties.includes('การเงิน')).length;
  const accountingCount = personnelList.filter(p => p.primaryDuties.includes('บัญชี')).length;
  const suppliesCount = personnelList.filter(p => p.primaryDuties.includes('พัสดุ')).length;
  const budgetCount = personnelList.filter(p => p.primaryDuties.includes('งบประมาณ')).length;

  // Internal Audit Risk Analysis: Segregation of Duties (SoD)
  // Check if a person is handling both Finance AND Supplies (major internal control conflict!)
  const sodConflictPersonnel = personnelList.filter(
    p => p.primaryDuties.includes('การเงิน') && p.primaryDuties.includes('พัสดุ')
  );

  // Check personnel handling 3 or more roles
  const multiDutyPersonnel = personnelList.filter(p => p.primaryDuties.length >= 3);

  // Education level breakdown
  const bachelorsCount = personnelList.filter(p => p.educationLevel === 'ปริญญาตรี').length;
  const mastersCount = personnelList.filter(p => p.educationLevel === 'ปริญญาโท').length;
  const doctorateCount = personnelList.filter(p => p.educationLevel === 'ปริญญาเอก').length;
  const otherEduCount = total - (bachelorsCount + mastersCount + doctorateCount);

  // Tenure breakdown
  let lessThan1Year = 0;
  let oneToThreeYears = 0;
  let threeToFiveYears = 0;
  let moreThanFiveYears = 0;

  personnelList.forEach(p => {
    const { years } = calculateTenure(p.startDate);
    if (years < 1) lessThan1Year++;
    else if (years <= 3) oneToThreeYears++;
    else if (years <= 5) threeToFiveYears++;
    else moreThanFiveYears++;
  });

  // Unique departments covered
  const coveredDepartments = new Set(personnelList.map(p => p.department)).size;

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Internal Audit Alert Banner */}
      {sodConflictPersonnel.length > 0 && (
        <div 
          id="sod-warning-banner"
          className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-200 text-rose-900 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-rose-900">
                  ข้อสังเกตงานตรวจสอบภายใน: การแบ่งแยกหน้าที่ (Segregation of Duties - SoD)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-200 text-rose-800">
                  พบ {sodConflictPersonnel.length} รายการ
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 font-body">
                พบผู้ปฏิบัติงานที่มีภาระงานควบทั้ง <span className="font-semibold text-rose-950">งานการเงิน (รับ-จ่ายเงิน)</span> และ <span className="font-semibold text-rose-950">งานพัสดุ (จัดซื้อจัดจ้าง)</span> ในส่วนงานเดียวกัน ซึ่งอาจมีความเสี่ยงด้านการควบคุมภายในตามหลักธรรมาภิบาล
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToMatrix}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-medium transition shrink-0 cursor-pointer"
          >
            <span>ตรวจสอบในตาราง SoD</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Core Duty Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <span>ผู้ปฏิบัติงานจำแนกตาม 4 ภาระหน้าที่หลัก</span>
          </h2>
          <span className="text-xs text-slate-500 font-body">
            คลิกที่การ์ดเพื่อกรองข้อมูลทันที
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Finance */}
          <div
            id="duty-card-finance"
            onClick={() => { onSelectDutyFilter('การเงิน'); onNavigateToDirectory(); }}
            className="bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-6 -mt-6 transition group-hover:scale-110 pointer-events-none" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                1. งานการเงิน
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{financeCount}</span>
                <span className="text-xs text-slate-500">คน ({Math.round((financeCount / (total || 1)) * 100)}%)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-body line-clamp-2">
                รับ-จ่ายเงิน, เบิกจ่ายเงินงบประมาณ, ควบคุมเงินสดย่อย, กระทบยอดเงินฝากธนาคาร
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-medium group-hover:translate-x-0.5 transition">
              <span>ดูรายชื่อผู้รับผิดชอบ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 2. Accounting */}
          <div
            id="duty-card-accounting"
            onClick={() => { onSelectDutyFilter('บัญชี'); onNavigateToDirectory(); }}
            className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-6 -mt-6 transition group-hover:scale-110 pointer-events-none" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                2. งานบัญชี
              </span>
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <BookOpenCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{accountingCount}</span>
                <span className="text-xs text-slate-500">คน ({Math.round((accountingCount / (total || 1)) * 100)}%)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-body line-clamp-2">
                จัดทำระบบบัญชี 3 มิติ, รายงานการเงิน, บันทึกบัญชีรายรับ-จ่าย, จัดทำงบทดลอง
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-medium group-hover:translate-x-0.5 transition">
              <span>ดูรายชื่อผู้รับผิดชอบ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 3. Procurement / Supplies */}
          <div
            id="duty-card-supplies"
            onClick={() => { onSelectDutyFilter('พัสดุ'); onNavigateToDirectory(); }}
            className="bg-white rounded-xl p-5 border border-slate-200 hover:border-pink-300 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full -mr-6 -mt-6 transition group-hover:scale-110 pointer-events-none" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                3. งานพัสดุ
              </span>
              <div className="w-9 h-9 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{suppliesCount}</span>
                <span className="text-xs text-slate-500">คน ({Math.round((suppliesCount / (total || 1)) * 100)}%)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-body line-clamp-2">
                จัดซื้อจัดจ้าง e-GP, ควบคุมทะเบียนครุภัณฑ์, ตรวจสอบพัสดุประจำปีตาม พ.ร.บ. 2560
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-pink-700 font-medium group-hover:translate-x-0.5 transition">
              <span>ดูรายชื่อผู้รับผิดชอบ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 4. Budget */}
          <div
            id="duty-card-budget"
            onClick={() => { onSelectDutyFilter('งบประมาณ'); onNavigateToDirectory(); }}
            className="bg-white rounded-xl p-5 border border-slate-200 hover:border-purple-300 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-6 -mt-6 transition group-hover:scale-110 pointer-events-none" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                4. งานงบประมาณ
              </span>
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <PieChart className="w-5 h-5" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{budgetCount}</span>
                <span className="text-xs text-slate-500">คน ({Math.round((budgetCount / (total || 1)) * 100)}%)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 font-body line-clamp-2">
                จัดทำคำของบประมาณ, จัดสรรและติดตามผลการเบิกจ่ายงบประมาณแผ่นดินและเงินรายได้
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-medium group-hover:translate-x-0.5 transition">
              <span>ดูรายชื่อผู้รับผิดชอบ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Internal Audit Metrics & Quality Control Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metric 1: Covered Subunits */}
        <div 
          onClick={onNavigateToDirectory}
          className="bg-white rounded-xl p-5 border border-slate-200 flex items-center justify-between shadow-xs hover:border-pink-300 transition cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center shrink-0 border border-pink-100 group-hover:scale-105 transition">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{coveredDepartments}</span>
                <span className="text-xs text-slate-500 font-medium">ส่วนงานย่อย</span>
              </div>
              <div className="text-xs font-semibold text-slate-800">ส่วนงานที่มีข้อมูลในระบบ มจร</div>
              <div className="text-[11px] text-slate-500 font-body">ครอบคลุมส่วนกลาง คณะ บัณฑิตวิทยาลัย และวิทยาเขตทั่วประเทศ ({total} บุคลากร)</div>
            </div>
          </div>
          <div className="text-xs text-pink-700 font-medium hidden sm:flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition">
            <span>ดูทำเนียบ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Metric 2: Multi-role Workload (Click opens complete dataset modal) */}
        <div 
          id="btn-open-multi-duty-card"
          onClick={onOpenMultiDutyModal}
          className="bg-white rounded-xl p-5 border border-rose-200 bg-gradient-to-br from-white to-rose-50/30 flex items-center justify-between shadow-xs cursor-pointer hover:border-rose-300 hover:shadow-md transition group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200 group-hover:scale-105 transition">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-rose-900">{multiDutyPersonnel.length}</span>
                <span className="text-xs text-rose-700 font-medium">คน (จาก {total} คน)</span>
              </div>
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <span>ผู้ปฏิบัติหน้าที่ควบตั้งแต่ 3 ด้านขึ้นไป</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-800 font-bold border border-rose-200">ข้อสังเกต</span>
              </div>
              <div className="text-[11px] text-rose-600 font-body">ควรติดตามเพื่อป้องกันความเสี่ยงภาระงานล้นและระบบควบคุมภายใน</div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMultiDutyModal();
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition cursor-pointer shrink-0 shadow-xs group-hover:translate-x-0.5"
          >
            <span>ดูรายละเอียด ({multiDutyPersonnel.length} ท่าน)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Breakdowns: Education, Experience, and Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Education Level Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-pink-700" />
              <h3 className="text-sm font-semibold text-slate-900">ระดับการศึกษาของผู้ปฏิบัติงาน</h3>
            </div>
            <span className="text-xs text-slate-500">{total} คน</span>
          </div>

          <div className="space-y-3 font-body">
            {/* ปริญญาตรี */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">ปริญญาตรี</span>
                <span className="text-slate-900 font-semibold">{bachelorsCount} คน ({Math.round((bachelorsCount / (total || 1)) * 100)}%)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-600 rounded-full transition-all duration-500" 
                  style={{ width: `${(bachelorsCount / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* ปริญญาโท */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">ปริญญาโท</span>
                <span className="text-slate-900 font-semibold">{mastersCount} คน ({Math.round((mastersCount / (total || 1)) * 100)}%)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                  style={{ width: `${(mastersCount / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* ปริญญาเอก */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">ปริญญาเอก</span>
                <span className="text-slate-900 font-semibold">{doctorateCount} คน ({Math.round((doctorateCount / (total || 1)) * 100)}%)</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 rounded-full transition-all duration-500" 
                  style={{ width: `${(doctorateCount / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

            {otherEduCount > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">อื่นๆ (เช่น ปวส.)</span>
                  <span className="text-slate-900 font-semibold">{otherEduCount} คน ({Math.round((otherEduCount / (total || 1)) * 100)}%)</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-400 rounded-full transition-all duration-500" 
                    style={{ width: `${(otherEduCount / (total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            สาขาวิชายอดนิยม: การบัญชี, บริหารธุรกิจ, การเงิน, รัฐประศาสนศาสตร์, พุทธศาสตร์
          </div>
        </div>

        {/* Tenure & Experience Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-700" />
              <h3 className="text-sm font-semibold text-slate-900">อายุงานและประสบการณ์ปฏิบัติงาน</h3>
            </div>
            <span className="text-xs text-slate-500">คำนวณจากวันเริ่มงาน</span>
          </div>

          <div className="space-y-3 font-body">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">&gt; 5 ปีขึ้นไป (ประสบการณ์สูง)</span>
                <span className="text-slate-900 font-semibold">{moreThanFiveYears} คน</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                  style={{ width: `${(moreThanFiveYears / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">3 - 5 ปี (ชำนาญการ)</span>
                <span className="text-slate-900 font-semibold">{threeToFiveYears} คน</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-600 rounded-full transition-all duration-500" 
                  style={{ width: `${(threeToFiveYears / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">1 - 3 ปี (ระดับปฏิบัติการ)</span>
                <span className="text-slate-900 font-semibold">{oneToThreeYears} คน</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(oneToThreeYears / (total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">&lt; 1 ปี (เริ่มงานใหม่)</span>
                <span className="text-slate-900 font-semibold">{lessThan1Year} คน</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-400 rounded-full transition-all duration-500" 
                  style={{ width: `${(lessThan1Year / (total || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            ผู้ปฏิบัติงานส่วนใหญ่มีอายุงานมากกว่า 3 ปี มีความต่อเนื่องในการบริหารงบประมาณ
          </div>
        </div>

        {/* Pie Chart: Subunit Categories Breakdown */}
        <CategoryPieChart
          personnelList={personnelList}
          onSelectCategoryFilter={onSelectCategoryFilter}
          onNavigateToDirectory={onNavigateToDirectory}
        />
      </div>

      {/* Education to Assigned Duties Alignment Analysis & Strategic Recommendations */}
      <EducationAlignmentSection
        personnelList={personnelList}
        onOpenAlignmentModal={onOpenAlignmentModal || (() => {})}
        onFilterNonAligned={onFilterNonAligned || (() => {})}
      />
    </div>
  );
};
