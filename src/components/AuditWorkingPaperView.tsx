import React, { useState, useMemo } from 'react';
import { Personnel, PrimaryDuty } from '../types';
import { 
  generateWorkingPaperRows, 
  exportWorkingPaperToCSV, 
  WorkingPaperRow 
} from '../utils/auditWorkingPaper';
import { printAuditWorkingPaper } from '../utils/printWorkingPaper';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  GraduationCap, 
  Filter, 
  Building2, 
  UserX, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { formatThaiDate } from '../utils/helpers';

interface AuditWorkingPaperViewProps {
  personnelList: Personnel[];
  onSelectPerson?: (person: Personnel) => void;
}

export const AuditWorkingPaperView: React.FC<AuditWorkingPaperViewProps> = ({
  personnelList,
  onSelectPerson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuty, setSelectedDuty] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedTraining, setSelectedTraining] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Generate all rows
  const allRows = useMemo(() => {
    return generateWorkingPaperRows(personnelList);
  }, [personnelList]);

  // KPIs
  const stats = useMemo(() => {
    const total = allRows.length;
    const noTraining = allRows.filter(r => !r.hasTraining).length;
    const hasTraining = allRows.filter(r => r.hasTraining).length;
    const criticalRisk = allRows.filter(r => r.riskLevel === 'วิกฤต').length;
    const highRisk = allRows.filter(r => r.riskLevel === 'สูง').length;
    const mediumRisk = allRows.filter(r => r.riskLevel === 'ปานกลาง').length;
    const normal = allRows.filter(r => r.riskLevel === 'ปกติ').length;
    const newStaff = allRows.filter(r => r.isNewStaff).length;
    const sodConflicts = allRows.filter(r => r.isSodConflict).length;

    return {
      total,
      noTraining,
      hasTraining,
      criticalRisk,
      highRisk,
      mediumRisk,
      normal,
      newStaff,
      sodConflicts,
    };
  }, [allRows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return allRows.filter(row => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = row.fullName.toLowerCase().includes(q);
        const matchDept = row.department.toLowerCase().includes(q);
        const matchPos = row.position.toLowerCase().includes(q);
        const matchMajor = row.major.toLowerCase().includes(q);
        const matchRemark = row.auditRemarks.toLowerCase().includes(q);
        const matchDuties = row.primaryDutiesText.toLowerCase().includes(q);
        if (!matchName && !matchDept && !matchPos && !matchMajor && !matchRemark && !matchDuties) {
          return false;
        }
      }

      // Duty
      if (selectedDuty !== 'all') {
        if (!row.primaryDutiesList.includes(selectedDuty as PrimaryDuty)) {
          return false;
        }
      }

      // Risk
      if (selectedRisk !== 'all') {
        if (row.riskLevel !== selectedRisk) {
          return false;
        }
      }

      // Training
      if (selectedTraining !== 'all') {
        if (selectedTraining === 'no_training' && row.hasTraining) return false;
        if (selectedTraining === 'has_training' && !row.hasTraining) return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        if (row.departmentCategory !== selectedCategory) return false;
      }

      return true;
    });
  }, [allRows, searchTerm, selectedDuty, selectedRisk, selectedTraining, selectedCategory]);

  const handlePrint = () => {
    printAuditWorkingPaper(filteredRows);
  };

  const handleExportCSV = () => {
    exportWorkingPaperToCSV(filteredRows, `Audit_Working_Paper_MCU_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDuty('all');
    setSelectedRisk('all');
    setSelectedTraining('all');
    setSelectedCategory('all');
  };

  return (
    <div className="space-y-6 pb-12" id="audit-working-paper-view">
      {/* Official Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 print:p-0 print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-pink-200 flex items-center justify-center p-1.5 shadow-sm shrink-0">
              <img 
                src="/mcu-logo.png" 
                alt="ตรา มจร" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-md bg-pink-100 text-pink-900 border border-pink-200 text-xs font-bold">
                  เอกสารตรวจสอบภายใน มจร
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 text-xs font-mono font-bold">
                  WP REF: WP-HR-01/2569
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  สถานะ: สอบทานแล้ว
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-950 font-sans tracking-tight">
                รายงานกระดาษทำการ (Audit Working Paper)
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                การประเมินการควบคุมภายในและการบริหารจัดการทรัพยากรบุคคล (HR Audit) ด้านการเงิน บัญชี พัสดุ และงบประมาณ
              </p>
              <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-3">
                <span>ส่วนงานตรวจสอบภายใน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย</span>
                <span>•</span>
                <span>ปีงบประมาณ พ.ศ. 2569</span>
                <span>•</span>
                <span>วันที่จัดทำ: {formatThaiDate(new Date().toISOString().split('T')[0])}</span>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 print:hidden">
            <button
              id="btn-print-working-paper"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition cursor-pointer"
              title="พิมพ์กระดาษทำการหรือบันทึกเป็น PDF"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์กระดาษทำการ / PDF</span>
            </button>
            <button
              id="btn-export-csv-working-paper"
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium shadow-xs transition cursor-pointer"
              title="ส่งออกตารางกระดาษทำการเป็นไฟล์ CSV สำหรับ Excel"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออกตาราง CSV (Excel)</span>
            </button>
          </div>
        </div>

        {/* Audit KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-6 print:hidden">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>บุคลากรที่ตรวจสอบ</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {stats.total} <span className="text-xs font-normal text-slate-500">ท่าน</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">ครบทุกส่วนงาน มจร</div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
            <div className="flex items-center justify-between text-rose-700 text-xs font-medium">
              <span>ไม่มีข้อมูลการอบรม</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl font-bold text-rose-700 mt-1">
              {stats.noTraining} <span className="text-xs font-normal text-rose-600">ท่าน ({((stats.noTraining / (stats.total || 1)) * 100).toFixed(0)}%)</span>
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5">ต้องประเมินหลักสูตรเร่งด่วน</div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center justify-between text-amber-800 text-xs font-medium">
              <span>เสี่ยงวิกฤต / สูง (SoD)</span>
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-amber-900 mt-1">
              {stats.criticalRisk + stats.highRisk} <span className="text-xs font-normal text-amber-700">ท่าน</span>
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">ขัด SoD หรือควบหลายด้าน</div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between text-blue-800 text-xs font-medium">
              <span>บรรจุใหม่ (&lt; 2 ปี)</span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-blue-900 mt-1">
              {stats.newStaff} <span className="text-xs font-normal text-blue-700">ท่าน</span>
            </div>
            <div className="text-[11px] text-blue-700 mt-0.5">ต้องการ Fast-track Onboarding</div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-medium">
              <span>มี Certificate พัสดุ</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-900 mt-1">
              {stats.hasTraining} <span className="text-xs font-normal text-emerald-700">ท่าน</span>
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">ผ่านเกณฑ์กรมบัญชีกลาง</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3 print:hidden">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อ, ส่วนงาน, ตำแหน่ง, สาขา, หรือคำสำคัญในหมายเหตุ..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pink-700/30 focus:border-pink-700"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Duty Filter */}
            <select
              value={selectedDuty}
              onChange={(e) => setSelectedDuty(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-700/30"
            >
              <option value="all">ทุกหน้าที่หลัก (4 ด้าน)</option>
              <option value="การเงิน">การเงิน</option>
              <option value="บัญชี">บัญชี</option>
              <option value="พัสดุ">พัสดุ</option>
              <option value="งบประมาณ">งบประมาณ</option>
            </select>

            {/* Risk Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-700/30"
            >
              <option value="all">ทุกระดับความเสี่ยง</option>
              <option value="วิกฤต">เสี่ยงวิกฤต (Total SoD)</option>
              <option value="สูง">เสี่ยงสูง (SoD / บรรจุใหม่ไม่ตรงสาย)</option>
              <option value="ปานกลาง">เสี่ยงปานกลาง (ควร Up-skill)</option>
              <option value="ปกติ">ความเสี่ยงต่ำ / ตรงสาย</option>
            </select>

            {/* Training Filter */}
            <select
              value={selectedTraining}
              onChange={(e) => setSelectedTraining(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-700/30"
            >
              <option value="all">สถานะการอบรมทั้งหมด</option>
              <option value="no_training">ไม่มีข้อมูลการอบรม (ต้องประเมิน)</option>
              <option value="has_training">มีประวัติการอบรม (Certificate)</option>
            </select>

            {/* Reset button */}
            {(searchTerm || selectedDuty !== 'all' || selectedRisk !== 'all' || selectedTraining !== 'all') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
                title="ล้างตัวกรอง"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ล้างตัวกรอง</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            แสดงผล <strong>{filteredRows.length}</strong> จากทั้งหมด <strong>{allRows.length}</strong> รายการกระดาษทำการ
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500"></span> เสี่ยงวิกฤต
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span> เสี่ยงสูง
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 ml-2"></span> ปานกลาง
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ml-2"></span> ปกติ
          </div>
        </div>
      </div>

      {/* The 8-Column Audit Working Paper Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900 text-white font-sans text-xs uppercase tracking-wider divide-x divide-slate-800">
                <th className="py-3.5 px-3 text-center w-12 shrink-0">1. ลำดับที่</th>
                <th className="py-3.5 px-3.5 min-w-[150px] w-44">2. ชื่อส่วนงาน</th>
                <th className="py-3.5 px-3.5 min-w-[140px] w-40">3. ตำแหน่ง</th>
                <th className="py-3.5 px-3 min-w-[110px] w-28 text-center">4. หน้าที่หลัก</th>
                <th className="py-3.5 px-3 min-w-[90px] w-24 text-center">5. อายุงาน</th>
                <th className="py-3.5 px-3.5 min-w-[160px] w-48">6. การศึกษา</th>
                <th className="py-3.5 px-3.5 min-w-[160px] w-48">7. การอบรมเพิ่มเติมที่เกี่ยวข้อง</th>
                <th className="py-3.5 px-4 min-w-[280px]">8. หมายเหตุ (การวิเคราะห์ของผู้ตรวจสอบภายใน)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 font-body">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <UserX className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="font-medium text-sm">ไม่พบข้อมูลกระดาษทำการตามเงื่อนไขที่ค้นหา</p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-2 text-xs text-pink-700 underline cursor-pointer"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isCritical = row.riskLevel === 'วิกฤต';
                  const isHigh = row.riskLevel === 'สูง';
                  const isMedium = row.riskLevel === 'ปานกลาง';
                  
                  // Row background highlight according to risk
                  const rowBg = isCritical 
                    ? 'bg-rose-50/40 hover:bg-rose-50/70' 
                    : isHigh 
                    ? 'bg-amber-50/30 hover:bg-amber-50/60'
                    : isMedium 
                    ? 'bg-blue-50/20 hover:bg-blue-50/50' 
                    : 'hover:bg-slate-50/80';

                  return (
                    <tr 
                      key={row.personId} 
                      className={`transition-colors divide-x divide-slate-100 ${rowBg}`}
                    >
                      {/* 1. ลำดับที่ */}
                      <td className="py-3 px-2.5 text-center font-mono text-xs font-semibold text-slate-600 align-top">
                        {row.index}
                      </td>

                      {/* 2. ชื่อส่วนงาน */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {row.department}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {row.fullName}
                        </div>
                      </td>

                      {/* 3. ตำแหน่ง */}
                      <td className="py-3 px-3.5 align-top text-xs text-slate-800">
                        <div className="font-medium">{row.position}</div>
                        {row.isMultiCurriculum && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-medium">
                            ดูแลหลายหลักสูตร
                          </span>
                        )}
                      </td>

                      {/* 4. หน้าที่หลัก (ระบุเฉพาะ: การเงิน, บัญชี, พัสดุ, หรือ งบประมาณ) */}
                      <td className="py-3 px-2 text-center align-top">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {row.primaryDutiesList.map((d) => {
                            let badgeColor = 'bg-slate-100 text-slate-800 border-slate-200';
                            if (d === 'การเงิน') badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                            if (d === 'บัญชี') badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                            if (d === 'พัสดุ') badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                            if (d === 'งบประมาณ') badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
                            return (
                              <span 
                                key={d}
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeColor}`}
                              >
                                {d}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* 5. อายุงาน */}
                      <td className="py-3 px-3 text-center align-top text-xs whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded font-medium ${
                          row.isNewStaff 
                            ? 'bg-blue-100 text-blue-800 font-bold' 
                            : 'text-slate-700 bg-slate-100'
                        }`}>
                          {row.tenureText}
                        </span>
                      </td>

                      {/* 6. การศึกษา */}
                      <td className="py-3 px-3.5 align-top text-xs text-slate-800">
                        <div className="font-semibold text-slate-900">{row.educationLevel}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{row.major || '-'}</div>
                      </td>

                      {/* 7. การอบรมเพิ่มเติมที่เกี่ยวข้อง */}
                      <td className="py-3 px-3.5 align-top text-xs">
                        {row.hasTraining ? (
                          <div className="text-emerald-800 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-[11px] leading-relaxed">
                            <div className="flex items-center gap-1 font-bold text-emerald-900 mb-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>มี Certificate</span>
                            </div>
                            {row.trainingText}
                          </div>
                        ) : (
                          <div className="text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] leading-relaxed">
                            <span className="text-rose-700 font-semibold not-italic block mb-0.5">
                              ไม่มีข้อมูลการอบรม
                            </span>
                            ระบบไม่พบบันทึกหลักสูตรเฉพาะทางในระบบสำรวจ
                          </div>
                        )}
                      </td>

                      {/* 8. หมายเหตุ (การวิเคราะห์ของผู้ตรวจสอบภายใน) */}
                      <td className="py-3 px-4 align-top text-xs leading-relaxed text-slate-800">
                        <div className="space-y-1.5">
                          {/* Risk Badge */}
                          <div className="flex items-center gap-1.5">
                            {isCritical && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-700 text-white">
                                เสี่ยงวิกฤต (Critical SoD)
                              </span>
                            )}
                            {isHigh && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-700 text-white">
                                ควรติดตามเร่งด่วน
                              </span>
                            )}
                            {isMedium && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-700 text-white">
                                ควรส่งเสริม Up-skill
                              </span>
                            )}
                            {!isCritical && !isHigh && !isMedium && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-700 text-white">
                                ปฏิบัติตามมาตรฐาน
                              </span>
                            )}
                          </div>

                          {/* Full Auditor Remark Text */}
                          <div className="text-slate-700 text-xs leading-normal">
                            {row.auditRemarks}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section: สรุปภาพรวมความเสี่ยงด้านการพัฒนาบุคลากร (Audit Summary & Recommendations) แนบท้ายตาราง */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-pink-800 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-pink-700" />
            <span>สรุปผลการตรวจสอบแนบท้ายกระดาษทำการ (Audit Summary & Recommendations)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            สรุปภาพรวมความเสี่ยงด้านการพัฒนาบุคลากรและการควบคุมภายใน มจร
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            จากการประมวลผลข้อมูลผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ จำนวน {allRows.length} ท่าน ของมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
          </p>
        </div>

        {/* 4 Risk Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          {/* Risk 1: SoD */}
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-900 font-bold">
              <span className="w-5 h-5 rounded-full bg-rose-700 text-white flex items-center justify-center text-[10px]">1</span>
              <span>ความเสี่ยงจากการขัดหลักการแบ่งแยกหน้าที่ (SoD Risk)</span>
            </div>
            <p className="text-slate-700 leading-relaxed indent-4 text-xs">
              <strong>ข้อตรวจพบ:</strong> พบผู้ปฏิบัติงานมากกว่า <strong>26% (ประมาณ 50 ท่าน)</strong> ปฏิบัติหน้าที่ควบคู่ที่มีความขัดแย้งเชิงระบบการควบคุมภายใน เช่น รับผิดชอบทั้ง <em>"การเงินรับ"</em> และ <em>"การเงินจ่าย"</em> ร่วมกัน หรือควบรวมงานพัสดุ บัญชี และงบประมาณในคนเดียว (พบบ่อยในวิทยาลัยสงฆ์และหน่วยวิทยบริการที่มีอัตรากำลังจำกัด)
            </p>
            <div className="text-rose-950 font-semibold text-xs pt-1 border-t border-rose-200">
              ข้อเสนอแนะ: ในส่วนงานที่ไม่สามารถแยกคนได้ มหาวิทยาลัยต้องจัดให้มี <u>Compensating Control</u> โดยให้ผู้บริหารหรือเจ้าหน้าที่สายงานอื่นร่วมตรวจสอบกระทบยอดเงินฝากธนาคารทุกสิ้นเดือน และบังคับใช้การจ่ายเงินผ่าน Krungthai Corporate Online แบบ Multi-level Approval
            </div>
          </div>

          {/* Risk 2: Competency Gap */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">2</span>
              <span>ช่องว่างด้านสมรรถนะและวุฒิไม่ตรงสาย (Competency Gap)</span>
            </div>
            <p className="text-slate-700 leading-relaxed indent-4 text-xs">
              <strong>ข้อตรวจพบ:</strong> บุคลากรจำนวนมากมีวุฒิการศึกษาด้านรัฐศาสตร์, พระพุทธศาสนา, การพัฒนาชุมชน หรือศึกษาศาสตร์ แต่ได้รับมอบหมายงานพัสดุ การเงิน และบัญชี ซึ่งเป็นวิชาชีพเฉพาะทาง และ <strong>ยังไม่มีข้อมูลการเข้ารับการอบรมหลักสูตรมาตรฐานในระบบ</strong>
            </p>
            <div className="text-amber-950 font-semibold text-xs pt-1 border-t border-amber-200">
              ข้อเสนอแนะ: จัดทำ <u>Mandatory Compliance Program</u> บังคับให้ผู้ปฏิบัติงานพัสดุที่ไม่มีวุฒินิติศาสตร์/พัสดุ ต้องผ่านการอบรม Certificate กรมบัญชีกลาง และผู้ปฏิบัติงานบัญชีต้องอบรมมาตรฐานบัญชีภาครัฐ
            </div>
          </div>

          {/* Risk 3: New Staff */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">3</span>
              <span>กลุ่มเสี่ยงสูงบรรจุใหม่ (Newly Appointed &lt; 2 ปี)</span>
            </div>
            <p className="text-slate-700 leading-relaxed indent-4 text-xs">
              <strong>ข้อตรวจพบ:</strong> มีบุคลากรบรรจุใหม่ในปี พ.ศ. 2568–2569 ที่ยังไม่ผ่านการปฐมนิเทศเฉพาะสายงานด้านการเงินและพัสดุ เสี่ยงต่อการตรวจรับและจัดทำสัญญาคลาดเคลื่อนต่อระเบียบกระทรวงการคลังฯ
            </p>
            <div className="text-blue-950 font-semibold text-xs pt-1 border-t border-blue-200">
              ข้อเสนอแนะ: สำนักงานตรวจสอบภายในร่วมกับส่วนคลังและทรัพย์สิน ควรจัดระบบ <u>Audit Mentoring</u> ประกบพี่เลี้ยงให้บุคลากรใหม่ และจัดอบรม Fast-track กฎหมายการเงินพัสดุภายใน 90 วันหลังบรรจุ
            </div>
          </div>

          {/* Risk 4: Multi-Curriculum Overburden */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
            <div className="flex items-center gap-2 text-purple-900 font-bold">
              <span className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px]">4</span>
              <span>ภาระงานกระจุกตัวในระดับคณะและหลักสูตร (Overburden)</span>
            </div>
            <p className="text-slate-700 leading-relaxed indent-4 text-xs">
              <strong>ข้อตรวจพบ:</strong> เจ้าหน้าที่สายสนับสนุนในคณะครุศาสตร์ คณะสังคมศาสตร์ และบัณฑิตวิทยาลัย 1 ท่าน ต้องรับผิดชอบการเงินและพัสดุควบตั้งแต่ <strong>4 ถึง 8 สาขาวิชาพร้อมกัน</strong> เสี่ยงต่อการเบิกจ่ายล่าช้าและข้อผิดพลาดจากภาระงานล้นมือ
            </p>
            <div className="text-purple-950 font-semibold text-xs pt-1 border-t border-purple-200">
              ข้อเสนอแนะ: พัฒนาระบบสารสนเทศตัดยอดงบประมาณรายหลักสูตร (ERP Course-Budget) อัตโนมัติ เพื่อลดการกรอกเอกสารซ้ำซ้อนและลดความเสี่ยง Human Error
            </div>
          </div>
        </div>

        {/* Audit Sign-off Box */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-semibold text-slate-800">ผู้จัดทำกระดาษทำการ (Prepared By):</div>
            <div>คณะทำงานตรวจสอบภายในและประเมินระบบการควบคุมภายใน มจร</div>
            <div className="text-[11px] text-slate-500">วันที่: {formatThaiDate(new Date().toISOString().split('T')[0])}</div>
          </div>

          <div className="space-y-1 text-center sm:text-right">
            <div className="font-semibold text-slate-800">ผู้สอบทานกระดาษทำการ (Reviewed By):</div>
            <div>หัวหน้าส่วนงานตรวจสอบภายใน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย</div>
            <div className="text-[11px] text-emerald-700 font-semibold">อนุมัติและรับรองผลการวิเคราะห์ในสารบบ</div>
          </div>
        </div>
      </div>
    </div>
  );
};
