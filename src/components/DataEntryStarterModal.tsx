import React from 'react';
import { PlusCircle, Upload, FileSpreadsheet, Trash2, RotateCcw, X, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { exportToCSV } from '../utils/helpers';
import { Personnel } from '../types';

interface DataEntryStarterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddForm: () => void;
  onOpenImportModal: () => void;
  onClearAllData: () => void;
  onRestoreSampleData: () => void;
  currentCount: number;
}

export const DataEntryStarterModal: React.FC<DataEntryStarterModalProps> = ({
  isOpen,
  onClose,
  onOpenAddForm,
  onOpenImportModal,
  onClearAllData,
  onRestoreSampleData,
  currentCount,
}) => {
  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const sampleRow: Personnel[] = [
      {
        id: 'template-01',
        department: 'คณะพุทธศาสตร์',
        departmentCategory: 'คณะ / บัณฑิตวิทยาลัย',
        fullName: 'นายตัวอย่าง ขยันยิ่ง',
        position: 'นักวิชาการเงินและบัญชีปฏิบัติการ',
        primaryDuties: ['การเงิน', 'บัญชี'],
        duties: ['ควบคุมการเบิกจ่าย', 'จัดทำบัญชี 3 มิติ'],
        dutyDescription: 'รับผิดชอบงานเบิกจ่ายเงินรายได้และงบประมาณแผ่นดิน',
        educationLevel: 'ปริญญาตรี',
        major: 'การบัญชี',
        startDate: '2020-01-15',
        email: 'sample@mcu.ac.th',
        lineId: 'sample_line_id',
        phone: '035-248-000',
        internalPhone: '8000',
        auditStatus: 'ปกติ',
      }
    ];
    exportToCSV(sampleRow, 'MCU_Personnel_Data_Template_แม่แบบนำเข้า.csv');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="starter-title"
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-800 via-pink-700 to-rose-700 text-white p-5 flex items-start justify-between shrink-0">
          <div>
            <div className="text-xs text-pink-200 font-medium tracking-wide">
              ระบบสารสนเทศงานตรวจสอบภายใน มจร
            </div>
            <h2 id="starter-title" className="text-lg font-bold mt-0.5 flex items-center gap-2">
              <span>เริ่มต้นใส่ข้อมูลที่จะแสดงในระบบ</span>
            </h2>
            <p className="text-xs text-pink-100 font-body mt-1">
              เลือกวิธีการใส่ข้อมูลผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Current Status Badge */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">สถานะข้อมูลปัจจุบันในระบบ:</span>
            <span className="font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
              {currentCount > 0 ? `มีข้อมูลอยู่แล้ว ${currentCount} คน` : 'ยังไม่มีข้อมูล (ระบบว่างเปล่า)'}
            </span>
          </div>

          {/* Option 1: Direct Form Entry */}
          <div className="p-4 rounded-xl border-2 border-pink-600/30 hover:border-pink-600 bg-pink-50/40 hover:bg-pink-50/70 transition space-y-2 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-pink-900 font-bold text-sm">
                <div className="w-8 h-8 rounded-lg bg-pink-700 text-white flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4>วิธีที่ 1: กรอกข้อมูลทีละท่านผ่านแบบฟอร์ม</h4>
                  <p className="text-xs text-pink-800/80 font-normal font-body">
                    บันทึกข้อมูลครบทั้ง 10 หมวดรายการตามมาตรฐานงานตรวจสอบภายใน
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-body leading-relaxed pt-1">
              กรอกข้อมูลชื่อ-สกุล, ตำแหน่ง, ส่วนงาน, ภาระหน้าที่ 4 ด้าน (การเงิน/บัญชี/พัสดุ/งบประมาณ), วุฒิการศึกษา, วันเริ่มงาน, ช่องทางติดต่อ และสถานะการตรวจสอบ
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddForm();
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-pink-700 hover:bg-pink-800 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
              >
                <span>เปิดแบบฟอร์มกรอกข้อมูลทันที</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Option 2: Batch Upload via CSV / Excel */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 transition space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4>วิธีที่ 2: นำเข้าไฟล์ชุดข้อมูล (CSV / Excel)</h4>
                <p className="text-xs text-slate-500 font-normal font-body">
                  สำหรับหน่วยงานที่มีตารางรายชื่อเจ้าหน้าที่อยู่แล้ว
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-body leading-relaxed pt-1">
              นำเข้าไฟล์ CSV ในคราวเดียว หรือดาวน์โหลดไฟล์แม่แบบเพื่อนำไปกรอกข้อมูลก่อนอัปโหลดเข้าระบบ
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenImportModal();
                }}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>เปิดหน้าต่างนำเข้า CSV</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-pink-700" />
                <span>ดาวน์โหลด Template CSV</span>
              </button>
            </div>
          </div>

          {/* Management / Clean Slate Actions */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">
              การจัดการชุดข้อมูลเริ่มต้น (Data Setup Options)
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onClearAllData}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-medium transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>ล้างข้อมูลทั้งหมด (เริ่มจากว่างเปล่า)</span>
              </button>
              <button
                type="button"
                onClick={onRestoreSampleData}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>โหลดข้อมูลสำรวจจริง มจร</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
