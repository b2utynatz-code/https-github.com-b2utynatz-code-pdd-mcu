import React from 'react';
import { Personnel } from '../types';
import { X, Printer, ShieldCheck, Download, AlertTriangle, CheckCircle2, GraduationCap, ClipboardList } from 'lucide-react';
import { calculateTenure, formatThaiDate } from '../utils/helpers';
import { calculateAlignmentSummary } from '../utils/educationAlignment';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelList: Personnel[];
  onOpenWorkingPaper?: () => void;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  personnelList,
  onOpenWorkingPaper,
}) => {
  if (!isOpen) return null;

  const total = personnelList.length;
  const financeCount = personnelList.filter(p => p.primaryDuties.includes('การเงิน')).length;
  const accountingCount = personnelList.filter(p => p.primaryDuties.includes('บัญชี')).length;
  const suppliesCount = personnelList.filter(p => p.primaryDuties.includes('พัสดุ')).length;
  const budgetCount = personnelList.filter(p => p.primaryDuties.includes('งบประมาณ')).length;

  const sodConflicts = personnelList.filter(
    p => p.primaryDuties.includes('การเงิน') && p.primaryDuties.includes('พัสดุ')
  );

  const suppliesStaff = personnelList.filter(p => p.primaryDuties.includes('พัสดุ'));
  const certifiedSupplies = suppliesStaff.filter(p => p.isCertifiedProcurement);

  const alignmentStats = calculateAlignmentSummary(personnelList);

  const coveredDepartments = Array.from(new Set(personnelList.map(p => p.department)));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div 
        id="audit-report-modal"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Modal Controls Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="w-5 h-5 text-pink-400" />
            <span>รายงานผลการตรวจสอบอัตรากำลังและการปฏิบัติงาน (Internal Audit Report)</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenWorkingPaper && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWorkingPaper();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-pink-300 text-xs font-medium transition cursor-pointer border border-slate-700"
                title="เปิดดูกระดาษทำการตรวจสอบภายใน (Audit Working Paper)"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">กระดาษทำการ (WP)</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-medium transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์รายงาน / บันทึก PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 bg-white font-body text-slate-900 space-y-6 print:p-0 print:overflow-visible">
          {/* Official Document Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900/80">
            <div className="inline-block p-2 rounded-full border border-pink-700 text-pink-800 font-bold text-sm mb-2">
              มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-slate-950">
              รายงานผลการสำรวจและประเมินระบบข้อมูลผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ
            </h1>
            <p className="text-sm text-slate-700 mt-1">
              ส่วนงานย่อย มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย ประจำปีงบประมาณ พ.ศ. 2569
            </p>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-center gap-4">
              <span>หน่วยงานผู้จัดทำ: ส่วนงานตรวจสอบภายใน มจร</span>
              <span>•</span>
              <span>วันที่พิมพ์รายงาน: {formatThaiDate(new Date().toISOString().split('T')[0])}</span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h2 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-xs">1</span>
              <span>สรุปผลการสำรวจอัตรากำลัง 4 ภาระงานหลัก</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed indent-6">
              ส่วนงานตรวจสอบภายใน ได้ดำเนินการสำรวจและรวบรวมข้อมูลผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ ของส่วนงานย่อยทั้งในส่วนกลาง คณะ บัณฑิตวิทยาลัย วิทยาเขต และวิทยาลัยสงฆ์ รวมทั้งสิ้น <strong>{coveredDepartments.length} ส่วนงาน</strong> มีผู้ปฏิบัติงานที่บันทึกข้อมูลในระบบทั้งสิ้น <strong>{total} คน</strong> โดยมีสถิติจำแนกตามภาระงานหลักดังนี้:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-center">
                <div className="text-xs text-slate-500 font-medium">1. งานการเงิน</div>
                <div className="text-xl font-bold text-emerald-800 font-sans mt-0.5">{financeCount} คน</div>
                <div className="text-[11px] text-slate-500">{Math.round((financeCount / (total || 1)) * 100)}% ของบุคลากร</div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-center">
                <div className="text-xs text-slate-500 font-medium">2. งานบัญชี</div>
                <div className="text-xl font-bold text-blue-800 font-sans mt-0.5">{accountingCount} คน</div>
                <div className="text-[11px] text-slate-500">{Math.round((accountingCount / (total || 1)) * 100)}% ของบุคลากร</div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-center">
                <div className="text-xs text-slate-500 font-medium">3. งานพัสดุ</div>
                <div className="text-xl font-bold text-pink-800 font-sans mt-0.5">{suppliesCount} คน</div>
                <div className="text-[11px] text-slate-500">{Math.round((suppliesCount / (total || 1)) * 100)}% ของบุคลากร</div>
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-center">
                <div className="text-xs text-slate-500 font-medium">4. งานงบประมาณ</div>
                <div className="text-xl font-bold text-purple-800 font-sans mt-0.5">{budgetCount} คน</div>
                <div className="text-[11px] text-slate-500">{Math.round((budgetCount / (total || 1)) * 100)}% ของบุคลากร</div>
              </div>
            </div>
          </div>

          {/* Section 2: Internal Control Assessment (SoD) */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-xs">2</span>
              <span>ข้อตรวจพบด้านการควบคุมภายในและการแบ่งแยกหน้าที่ (Segregation of Duties - SoD)</span>
            </h2>

            {sodConflicts.length > 0 ? (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>ข้อสังเกต: พบความเสี่ยงในการแบ่งแยกหน้าที่ (SoD Conflict) จำนวน {sodConflicts.length} รายการ</span>
                </div>
                <p className="text-rose-800 leading-relaxed">
                  ตามหลักการควบคุมภายในที่ดีของกระทรวงการคลังและสำนักงานการตรวจเงินแผ่นดิน (สตง.) การปฏิบัติหน้าที่รับ-จ่ายเงิน (การเงิน) และการจัดซื้อจัดจ้าง (พัสดุ) ควรแยกออกจากกันโดยเด็ดขาด เพื่อป้องกันความเสี่ยงจากการทุจริตและข้อผิดพลาด
                </p>
                <div className="mt-2 pt-2 border-t border-rose-200">
                  <span className="font-semibold text-rose-950 block mb-1">รายชื่อและส่วนงานที่มีข้อสังเกต:</span>
                  <ul className="list-disc list-inside space-y-1 text-rose-900">
                    {sodConflicts.map(p => (
                      <li key={p.id}>
                        <strong>{p.fullName}</strong> ({p.position}) — ส่วนงาน: {p.department} (ภาระงาน: {p.primaryDuties.join(', ')})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ผลการประเมิน: ไม่พบการควบหน้าที่ระหว่างงานการเงินและงานพัสดุในบุคคลเดียวกัน</span>
              </div>
            )}
          </div>

          {/* Section 3: Legal Compliance & Capacity Building */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-xs">3</span>
              <span>การปฏิบัติตาม พ.ร.บ.การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              ผู้ปฏิบัติงานด้านพัสดุทั้งหมด <strong>{suppliesStaff.length} คน</strong> มีผู้ผ่านการฝึกอบรมและขึ้นทะเบียนตามระเบียบฯ แล้วจำนวน <strong>{certifiedSupplies.length} คน ({Math.round((certifiedSupplies.length / (suppliesStaff.length || 1)) * 100)}%)</strong> และมีผู้ที่อยู่ระหว่างรอการเข้าอบรมจำนวน {suppliesStaff.length - certifiedSupplies.length} คน
            </p>
          </div>

          {/* Section 4: Education Qualification Alignment Assessment */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-xs">4</span>
              <span>การวิเคราะห์ความตรงสายงานของสาขาวิชาที่สำเร็จการศึกษากับภาระหน้าที่</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed indent-6">
              จากการวิเคราะห์คุณวุฒิการศึกษาเทียบกับภาระหน้าที่รับผิดชอบด้านการเงิน บัญชี พัสดุ และงบประมาณ พบว่ามีบุคลากรที่สำเร็จการศึกษา <strong>ตรงสายงานโดยตรง {alignmentStats.directCount} คน ({alignmentStats.directPct}%)</strong>, <strong>สายใกล้เคียง/ประยุกต์ได้ {alignmentStats.relatedCount} คน ({alignmentStats.relatedPct}%)</strong> และ <strong>ไม่ตรงสายงาน {alignmentStats.nonAlignedCount} คน ({alignmentStats.nonAlignedPct}%)</strong>
            </p>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-lg p-2.5 text-center">
                <div className="text-[11px] text-emerald-800 font-semibold">ตรงสายงานโดยตรง</div>
                <div className="text-lg font-bold text-emerald-900">{alignmentStats.directCount} คน ({alignmentStats.directPct}%)</div>
                <div className="text-[10px] text-emerald-700">บัญชี, การเงิน, บริหารธุรกิจ, เศรษฐศาสตร์</div>
              </div>
              <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-2.5 text-center">
                <div className="text-[11px] text-blue-800 font-semibold">สายใกล้เคียง/ประยุกต์</div>
                <div className="text-lg font-bold text-blue-900">{alignmentStats.relatedCount} คน ({alignmentStats.relatedPct}%)</div>
                <div className="text-[10px] text-blue-700">รัฐประศาสนศาสตร์, สารสนเทศ, การจัดการ</div>
              </div>
              <div className="border border-amber-300 bg-amber-50/50 rounded-lg p-2.5 text-center">
                <div className="text-[11px] text-amber-900 font-semibold">ไม่ตรงสาย (ควรติดตาม)</div>
                <div className="text-lg font-bold text-amber-950">{alignmentStats.nonAlignedCount} คน ({alignmentStats.nonAlignedPct}%)</div>
                <div className="text-[10px] text-amber-800">พุทธศาสตร์, ปรัชญา, ครุศาสตร์, สังคมศาสตร์</div>
              </div>
            </div>
          </div>

          {/* Section 5: Recommendations */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <h2 className="text-base font-bold font-sans text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-xs">5</span>
              <span>ข้อเสนอแนะเชิงนโยบายของผู้ตรวจสอบภายในเพื่อการพัฒนาและติดตาม</span>
            </h2>

            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed">
              <li>
                <strong>ปรับปรุงคำสั่งมอบหมายหน้าที่ (Segregation of Duties):</strong> ส่วนงานที่มีบุคลากรจำกัดจนต้องควบหน้าที่การเงินและพัสดุ ควรแต่งตั้งคณะกรรมการตรวจรับพัสดุที่เป็นบุคคลภายนอกงานการเงินมาร่วมตรวจสอบ
              </li>
              <li>
                <strong>จัดทำหลักสูตรฝึกอบรมแบบเร่งรัด (Fast-Track Competency):</strong> สำหรับกลุ่มผู้ปฏิบัติงานที่ไม่ตรงสายงาน ({alignmentStats.nonAlignedCount} คน) โดยเฉพาะงานบัญชีและการเงิน ควรจัดอบรมมาตรฐานการเงิน มจร และระบบสารสนเทศทางบัญชีภาครัฐอย่างต่อเนื่อง
              </li>
              <li>
                <strong>ระบบพี่เลี้ยงและคู่มือขั้นตอนปฏิบัติงาน (SOP & Mentorship):</strong> มอบหมายให้นักวิชาการเงินและบัญชีส่วนกลาง/วิทยาเขตหลัก เป็นพี่เลี้ยงประกบคู่ให้คำปรึกษาส่วนงานย่อยและวิทยาลัยสงฆ์
              </li>
              <li>
                <strong>การตรวจทานซ้ำ (Dual-Review Mechanism):</strong> ในขั้นตอนการจัดทำเอกสารสำคัญทางการเงิน บัญชี และจัดซื้อจัดจ้าง ควรมีขั้นตอนตรวจสอบทานอย่างน้อย 2 ชั้นก่อนเสนอผู้มีอำนาจลงนาม
              </li>
              <li>
                <strong>ปรับปรุงฐานข้อมูลสม่ำเสมอ:</strong> มอบหมายให้แต่ละส่วนงานย่อยอัปเดตข้อมูลผู้ปฏิบัติงานเมื่อมีการโยกย้ายหรือเปลี่ยนภาระงาน เพื่อให้ระบบสืบค้นสะท้อนสถานะที่เป็นปัจจุบันที่สุด
              </li>
            </ol>
          </div>

          {/* Signatures for Official Audit Report */}
          <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-8">
              <p>ลงชื่อ..........................................................<br />( .......................................................... )<br />นักวิชาการตรวจสอบภายใน ผู้จัดทำรายงาน</p>
            </div>
            <div className="space-y-8">
              <p>ลงชื่อ..........................................................<br />( .......................................................... )<br />ผู้อำนวยการส่วนงานตรวจสอบภายใน มจร</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-300 hover:bg-slate-400 text-slate-800 text-xs font-medium transition cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
