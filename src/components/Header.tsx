import React from 'react';
import { 
  ShieldCheck, 
  Plus, 
  FileSpreadsheet, 
  FileText, 
  LayoutDashboard, 
  Users, 
  Grid3X3,
  Building2,
  Sparkles,
  Trash2,
  LogOut,
  UserCheck,
  ClipboardList,
  RotateCcw
} from 'lucide-react';
import { AuthUser } from '../types';

interface HeaderProps {
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  activeTab: 'dashboard' | 'directory' | 'matrix' | 'working-paper';
  setActiveTab: (tab: 'dashboard' | 'directory' | 'matrix' | 'working-paper') => void;
  onOpenAddModal: () => void;
  onOpenReportModal: () => void;
  onOpenImportExportModal: () => void;
  onOpenStarterModal?: () => void;
  onClearAllData?: () => void;
  onReloadSurveyData?: () => void;
  totalPersonnel: number;
  totalDepartments: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenReportModal,
  onOpenImportExportModal,
  onClearAllData,
  onReloadSurveyData,
  totalPersonnel,
  totalDepartments,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs" id="main-header">
      {/* Top Banner with University Identity */}
      <div className="bg-gradient-to-r from-[#9e104e] via-[#b8185c] to-[#7f0b3e] text-white px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <img 
              src="/mcu-logo.png" 
              alt="ตรา มจร" 
              className="w-7 h-7 object-contain rounded-full bg-white/95 p-0.5 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <span className="font-medium tracking-wide">
              มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (MCU)
            </span>
            <span className="hidden md:inline text-pink-200/70">•</span>
            <span className="hidden md:inline text-pink-100/90">
              ส่วนงานตรวจสอบภายใน (Internal Audit Unit)
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-950/60 text-pink-100 text-xs border border-pink-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-pink-300" />
              <span>ระบบตรวจสอบความโปร่งใส</span>
            </span>

            {currentUser && (
              <div className="flex items-center gap-2.5 pl-2 border-l border-pink-400/40">
                <div className="flex items-center gap-1.5 bg-pink-950/40 px-2.5 py-1 rounded-lg border border-pink-400/20">
                  <div className="w-5 h-5 rounded-full bg-amber-400 text-pink-950 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white leading-none flex items-center gap-1">
                      <span>{currentUser.fullName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 font-normal">
                        {currentUser.roleLabel.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-950/80 hover:bg-rose-900 text-pink-100 hover:text-white text-xs font-medium border border-pink-400/30 transition cursor-pointer shadow-xs"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ออกจากระบบ</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-pink-200 flex items-center justify-center p-1 shadow-md shadow-pink-900/5 shrink-0">
              <img 
                src="/mcu-logo.png" 
                alt="ตราสัญลักษณ์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-pink-100 text-pink-800 border border-pink-200">
                  ระบบสารสนเทศงานตรวจสอบภายใน
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-0.5">
                <span>ฐานข้อมูลผู้ปฏิบัติงานการเงิน บัญชี พัสดุ และงบประมาณ</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-body">
                ระบบสืบค้นและกำกับติดตามสถานะการดำเนินงานส่วนงานย่อย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
              </p>
            </div>
          </div>

          {/* Action Tools for Internal Auditor */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-add-personnel"
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-pink-700 hover:bg-pink-800 active:bg-pink-900 text-white text-sm font-medium transition shadow-xs cursor-pointer shadow-pink-800/20"
              title="เพิ่มข้อมูลผู้ปฏิบัติงานใหม่ทันที"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>เพิ่มคนใหม่</span>
            </button>

            <button
              id="btn-header-working-paper"
              type="button"
              onClick={() => setActiveTab('working-paper')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition border cursor-pointer ${
                activeTab === 'working-paper'
                  ? 'bg-pink-700 text-white border-pink-700 shadow-xs'
                  : 'bg-slate-100 hover:bg-pink-50 hover:text-pink-900 hover:border-pink-200 text-slate-700 border-slate-200'
              }`}
              title="เปิดดูรายงานกระดาษทำการตรวจสอบภายใน (Audit Working Paper)"
            >
              <ClipboardList className={`w-4 h-4 ${activeTab === 'working-paper' ? 'text-white' : 'text-pink-700'}`} />
              <span className="hidden sm:inline">กระดาษทำการ (WP)</span>
              <span className="sm:hidden">WP</span>
            </button>

            <button
              id="btn-audit-report"
              type="button"
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-pink-900 hover:border-pink-200 text-slate-700 text-sm font-medium transition border border-slate-200 cursor-pointer"
              title="ดูรายงานผลการตรวจสอบอัตรากำลัง"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">รายงานตรวจสอบ</span>
              <span className="sm:hidden">รายงาน</span>
            </button>

            <button
              id="btn-import-export"
              type="button"
              onClick={onOpenImportExportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-pink-900 hover:border-pink-200 text-slate-700 text-sm font-medium transition border border-slate-200 cursor-pointer"
              title="นำเข้าหรือส่งออกข้อมูล Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-pink-700" />
              <span className="hidden sm:inline">นำเข้า / ส่งออก CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>

            {onReloadSurveyData && totalPersonnel === 0 && (
              <button
                id="btn-header-reload-data"
                type="button"
                onClick={onReloadSurveyData}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-sm font-medium transition cursor-pointer shadow-xs"
                title="โหลดชุดข้อมูลสำรวจบุคลากร มจร ประจำปี 2569 (191 ท่าน)"
              >
                <RotateCcw className="w-4 h-4 text-white" />
                <span>โหลดข้อมูลสำรวจ มจร (191 ท่าน)</span>
              </button>
            )}

            {onClearAllData && totalPersonnel > 0 && (
              <button
                id="btn-header-clear-data"
                type="button"
                onClick={onClearAllData}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-medium transition cursor-pointer"
                title="เคลียร์ข้อมูลทั้งหมดในระบบเพื่อแนบไฟล์ CSV ใหม่"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">เคลียร์ข้อมูลทั้งหมด</span>
                <span className="sm:hidden">เคลียร์ข้อมูล</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs between Dashboard, Directory, Duty Matrix, and Audit Working Paper */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <nav className="flex items-center space-x-1 flex-wrap gap-y-1.5" aria-label="Tabs">
            <button
              id="tab-dashboard"
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-pink-50 text-pink-900 border border-pink-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-pink-700' : 'text-slate-500'}`} />
              <span>แดชบอร์ดภาพรวม</span>
            </button>

            <button
              id="tab-directory"
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-pink-50 text-pink-900 border border-pink-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'directory' ? 'text-pink-700' : 'text-slate-500'}`} />
              <span>ทำเนียบบุคลากร & ค้นหา</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === 'directory' ? 'bg-pink-200 text-pink-900' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalPersonnel}
              </span>
            </button>

            <button
              id="tab-matrix"
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-pink-50 text-pink-900 border border-pink-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Grid3X3 className={`w-4 h-4 ${activeTab === 'matrix' ? 'text-pink-700' : 'text-slate-500'}`} />
              <span>เมทริกซ์แบ่งแยกหน้าที่ (SoD)</span>
            </button>

            <button
              id="tab-working-paper"
              type="button"
              onClick={() => setActiveTab('working-paper')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                activeTab === 'working-paper'
                  ? 'bg-pink-50 text-pink-900 border border-pink-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className={`w-4 h-4 ${activeTab === 'working-paper' ? 'text-pink-700' : 'text-slate-500'}`} />
              <span>กระดาษทำการ (Working Paper)</span>
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'working-paper' ? 'bg-pink-200 text-pink-900' : 'bg-pink-100 text-pink-800'
              }`}>
                WP-HR-01
              </span>
            </button>
          </nav>

          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span>ครอบคลุม {totalDepartments} ส่วนงานย่อย</span>
            <span>•</span>
            <span>ฐานข้อมูลปรับปรุงล่าสุด: ก.ย. 2569</span>
          </div>
        </div>
      </div>
    </header>
  );
};
