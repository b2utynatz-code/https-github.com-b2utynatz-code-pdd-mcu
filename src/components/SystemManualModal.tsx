import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Printer, 
  Search, 
  Users, 
  Grid3X3, 
  FileSpreadsheet, 
  AlertTriangle, 
  Award, 
  CheckCircle2, 
  PlusCircle, 
  Download, 
  Upload, 
  ShieldCheck, 
  Info, 
  ChevronRight,
  HelpCircle,
  Building2,
  FileText
} from 'lucide-react';

interface SystemManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemManualModal: React.FC<SystemManualModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'dashboard' | 'directory' | 'sod' | 'alignment' | 'import_export' | 'roles' | 'faq'>('overview');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:static">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-auto animate-scaleUp max-h-[92vh] flex flex-col print:max-h-none print:h-auto print:shadow-none print:border-none print:rounded-none"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-900 via-[#9e104e] to-rose-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-5 h-5 text-pink-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-pink-500/30 text-pink-100 border border-pink-400/30">
                  คู่มือการใช้งานระบบสารสนเทศ
                </span>
                <span className="text-xs text-pink-200/80">มจร • ส่วนงานตรวจสอบภายใน</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-sans tracking-tight text-white mt-0.5">
                คู่มือระบบฐานข้อมูลและกำกับติดตามผู้ปฏิบัติงานการเงิน บัญชี พัสดุ และงบประมาณ
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer border border-white/20"
              title="พิมพ์คู่มือหรือบันทึกเป็น PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">พิมพ์ / บันทึก PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-pink-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="ปิดคู่มือ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Sidebar on Desktop, Horizontal on Mobile) */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Menu */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-3 space-y-1 shrink-0 overflow-x-auto md:overflow-y-auto print:hidden">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              หัวข้อคู่มือการใช้งาน
            </div>

            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeSection === 'overview'
                  ? 'bg-pink-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>1. ภาพรวมและวัตถุประสงค์</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeSection === 'dashboard'
                  ? 'bg-pink-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>2. การใช้งานแดชบอร์ด</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('directory')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeSection === 'directory'
                  ? 'bg-pink-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" />
                <span>3. สืบค้น & จัดการบุคลากร</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('sod')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeSection === 'sod'
                  ? 'bg-pink-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 shrink-0" />
                <span>4. ตรวจสอบเมทริกซ์ SoD</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('alignment')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeSection === 'alignment'
                  ? 'bg-pink-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 shrink-0" />
                <span>5. วิเคราะห์ความตรงสายงาน</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('import_export')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeSection === 'import_export'
                  ? 'bg-pink-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>6. นำเข้า / ส่งออก CSV</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('roles')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeSection === 'roles'
                  ? 'bg-pink-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>7. คู่มือแยกตามบทบาทผู้ใช้</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('faq')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                activeSection === 'faq'
                  ? 'bg-pink-700 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>8. คำถามที่พบบ่อย (FAQ)</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-5 sm:p-7 overflow-y-auto font-body space-y-6 text-slate-800 text-sm leading-relaxed">
            {/* Printable Document Title */}
            <div className="hidden print:block pb-4 border-b border-slate-300 mb-6">
              <h1 className="text-xl font-bold text-slate-900">
                คู่มือการใช้งานระบบสารสนเทศผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ
              </h1>
              <p className="text-xs text-slate-600">มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย • ส่วนงานตรวจสอบภายใน</p>
            </div>

            {/* Section 1: Overview */}
            {(activeSection === 'overview' || typeof window !== 'undefined') && (
              <div className={activeSection !== 'overview' ? 'hidden print:block' : 'space-y-4'}>
                <div className="flex items-center gap-2 text-pink-900 font-bold text-base sm:text-lg border-b border-pink-100 pb-2">
                  <Info className="w-5 h-5 text-pink-700" />
                  <span>1. ภาพรวมและวัตถุประสงค์ของระบบ (System Overview)</span>
                </div>
                
                <p>
                  ระบบสารสนเทศนี้จัดทำขึ้นโดย <strong>ส่วนงานตรวจสอบภายใน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (มจร)</strong> เพื่อเป็นศูนย์กลางฐานข้อมูลทำเนียบผู้ปฏิบัติงานสายสนับสนุนใน 4 ภาระงานหลัก (การเงิน, บัญชี, พัสดุ, งบประมาณ) ครอบคลุมทั้งส่วนกลาง คณะ บัณฑิตวิทยาลัย สถาบัน วิทยาเขต และวิทยาลัยสงฆ์ 39 ส่วนงานย่อยทั่วประเทศ
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-pink-50/70 border border-pink-200 rounded-xl p-3.5">
                    <h4 className="font-bold text-pink-950 text-xs mb-1">ความโปร่งใส & ธรรมาภิบาล</h4>
                    <p className="text-xs text-slate-600">
                      มีฐานข้อมูลตรวจสอบตัวตน อายุงาน วุฒิการศึกษา และภาระงานที่ได้รับมอบหมายจริง
                    </p>
                  </div>
                  <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5">
                    <h4 className="font-bold text-purple-950 text-xs mb-1">การควบคุมภายใน (SoD)</h4>
                    <p className="text-xs text-slate-600">
                      ตรวจสอบและแจ้งเตือนความเสี่ยงการควบหน้าที่การเงิน-พัสดุ ป้องกันข้อผิดพลาดและการทุจริต
                    </p>
                  </div>
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5">
                    <h4 className="font-bold text-blue-950 text-xs mb-1">การตัดสินใจของผู้บริหาร</h4>
                    <p className="text-xs text-slate-600">
                      ช่วยจัดสรรอัตรากำลัง พัฒนาสมรรถนะตรงสาย และออกรายงานประกอบการตรวจเงินแผ่นดิน
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Dashboard */}
            {(activeSection === 'dashboard' || typeof window !== 'undefined') && (
              <div className={activeSection !== 'dashboard' ? 'hidden print:block' : 'space-y-4'}>
                <div className="flex items-center gap-2 text-pink-900 font-bold text-base sm:text-lg border-b border-pink-100 pb-2">
                  <BookOpen className="w-5 h-5 text-pink-700" />
                  <span>2. การใช้งานแดชบอร์ดภาพรวม (Dashboard Navigation)</span>
                </div>

                <p>
                  หน้า <strong>แดชบอร์ดภาพรวม</strong> แสดงสถิติตัวชี้วัดหลัก (Key Metrics) แบบเรียลไทม์ เพื่อให้ผู้บริหารมองเห็นภาพรวมอัตรากำลังได้ในหน้าจอเดียว:
                </p>

                <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm pl-2">
                  <li>
                    <strong>การ์ดสรุปตัวเลขสถิติ (KPI Cards):</strong> จำนวนบุคลากรทั้งหมด (71 ท่าน), จำนวนส่วนงานย่อย (39 ส่วนงาน), อัตรากำลังงานการเงิน (45), งานบัญชี (43), งานพัสดุ (33), งานงบประมาณ (23)
                  </li>
                  <li>
                    <strong>การแจ้งเตือนความเสี่ยงการแบ่งแยกหน้าที่ (SoD Alert):</strong> กล่องแจ้งเตือนสีแดงด้านบนเมื่อพบบุคลากรที่ปฏิบัติงานควบการเงินและพัสดุ พร้อมปุ่มกดดูรายชื่อผู้มีความเสี่ยงทันที
                  </li>
                  <li>
                    <strong>แผนภูมิการกระจายภาระงาน (Workforce Distribution Chart):</strong> กราฟวงกลมแสดงสัดส่วนผู้ปฏิบัติงานในแต่ละหน้าที่
                  </li>
                  <li>
                    <strong>การประเมินความตรงสายงานของวุฒิการศึกษา (Education Alignment):</strong> สรุปสัดส่วนบุคลากรกลุ่มตรงสายโดยตรง, สายใกล้เคียง/ประยุกต์, และกลุ่มไม่ตรงสาย
                  </li>
                </ul>
              </div>
            )}

            {/* Section 3: Directory & Personnel Management */}
            {(activeSection === 'directory' || typeof window !== 'undefined') && (
              <div className={activeSection !== 'directory' ? 'hidden print:block' : 'space-y-4'}>
                <div className="flex items-center gap-2 text-pink-900 font-bold text-base sm:text-lg border-b border-pink-100 pb-2">
                  <Users className="w-5 h-5 text-pink-700" />
                  <span>3. การสืบค้นและจัดการข้อมูลบุคลากร (Directory & Search)</span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-pink-700" />
                      <span>การค้นหาข้อมูลแบบทันที (Instant Search & Filter):</span>
                    </h4>
                    <p className="text-slate-600">
                      ท่านสามารถพิมพ์ชื่อ-นามสกุล, เบอร์โทรศัพท์, ส่วนงาน, หรือหลักสูตรที่ดูแล ในช่องค้นหา ระบบจะกรองผลลัพธ์ทันทีโดยไม่ต้องกด Enter
                    </p>
                    <p className="text-slate-600">
                      <strong>ตัวกรองเสริม:</strong> เลือกกรองเฉพาะส่วนงาน, กรองตามภาระงาน (เฉพาะการเงิน, พัสดุ ฯลฯ), หรือกรองตามความตรงสายงาน
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <PlusCircle className="w-4 h-4 text-pink-700" />
                      <span>การเพิ่ม แก้ไข และลบข้อมูลผู้ปฏิบัติงาน:</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                      <li><strong>เพิ่มคนใหม่:</strong> กดปุ่มสีชมพู <em>"+ เพิ่มคนใหม่"</em> มุมขวาบน กรอกชื่อ-นามสกุล, ส่วนงาน, ตำแหน่ง, วุฒิการศึกษา, ติ๊กภาระงานที่รับผิดชอบ แล้วกดบันทึก</li>
                      <li><strong>แก้ไขข้อมูล:</strong> คลิกที่การ์ดบุคลากร หรือกดปุ่มไอคอนดินสอบนตาราง เพื่อเปิดฟอร์มแก้ไขข้อมูล</li>
                      <li><strong>ลบข้อมูล:</strong> คลิกปุ่มไอคอนถังขยะ จะมีหน้าต่างยืนยันเพื่อป้องกันการลบโดยไม่ตั้งใจ</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Segregation of Duties Matrix */}
            {(activeSection === 'sod' || typeof window !== 'undefined') && (
              <div className={activeSection !== 'sod' ? 'hidden print:block' : 'space-y-4'}>
                <div className="flex items-center gap-2 text-pink-900 font-bold text-base sm:text-lg border-b border-pink-100 pb-2">
                  <Grid3X3 className="w-5 h-5 text-pink-700" />
                  <span>4. เมทริกซ์แบ่งแยกหน้าที่และการควบคุมภายใน (SoD Matrix)</span>
                </div>

                <p>
                  เมทริกซ์แบ่งแยกหน้าที่ (Segregation of Duties - SoD) ออกแบบตามระเบียบกระทรวงการคลังและมาตรฐาน สตง. เพื่อตรวจจับจุดเสี่ยงด้านการทุจริต:
                </p>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-rose-50 p-3 border-b border-rose-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-rose-950 text-xs">จุดวิกฤต: การปฏิบัติงานควบ "การเงิน" และ "พัสดุ"</h4>
                      <p className="text-xs text-rose-800 mt-0.5">
                        ผู้ทำหน้าที่จัดซื้อจัดจ้าง (พัสดุ) ไม่ควรเป็นบุคคลเดียวกับผู้มีอำนาจเบิกจ่ายหรือเก็บรักษาเงินสด (การเงิน) เนื่องจากขาดการคานอำนาจและตรวจสอบทาน
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white space-y-2 text-xs text-slate-700">
                    <div className="font-semibold text-slate-900">วิธีใช้งานหน้าเมทริกซ์ SoD:</div>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1">
                      <li>คลิกที่แท็บ <strong>"เมทริกซ์หน้าที่ (SoD)"</strong> บนแถบเมนูหลัก</li>
                      <li>ระบบจะแสดงตารางไขว้ระหว่าง <strong>รายชื่อส่วนงาน</strong> กับ <strong>4 ภาระงาน</strong></li>
                      <li>ส่วนงานที่มีบุคลากรทำควบทั้งสองด้านจะมีแถบสีแดงไฮไลต์แจ้งเตือนชัดเจน</li>
                      <li>ผู้ตรวจสอบสามารถกดดูรายชื่อและข้อเสนอแนะในการบรรเทาความเสี่ยง (Mitigating Controls) เช่น การตั้งคณะกรรมการตรวจรับพัสดุจากบุคคลภายนอกงานการเงิน</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Alignment */}
            {(activeSection === 'alignment' || typeof window !== 'undefined') && (
              <div className={activeSection !== 'alignment' ? 'hidden print:block' : 'space-y-4'}>
                <div className="flex items-center gap-2 text-pink-900 font-bold text-base sm:text-lg border-b border-pink-100 pb-2">
                  <Award className="w-5 h-5 text-pink-700" />
                  <span>5. การวิเคราะห์ความตรงสายงานของวุฒิการศึกษา (Education Alignment)</span>
                </div>

                <p>
                  ระบบมีอัลกอริทึมวิเคราะห์เปรียบเทียบระหว่าง <strong>สาขาวิชาที่สำเร็จการศึกษา</strong> กับ <strong>ภาระงานที่รับผิดชอบจริง</strong> โดยจำแนกออกเป็น 3 ระดับ:
                </p>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-950">ตรงสายงานโดยตรง (Directly Aligned):</span>
                      <p className="text-xs text-emerald-800">วุฒิด้านการบัญชี, การเงิน, บริหารธุรกิจ, หรือเศรษฐศาสตร์ ปฏิบัติงานด้านการเงิน บัญชี หรืองบประมาณ</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-950">สายใกล้เคียง / ประยุกต์ได้ (Partially Aligned):</span>
                      <p className="text-xs text-amber-800">วุฒิด้านรัฐประศาสนศาสตร์, สารสนเทศ, การจัดการทั่วไป ซึ่งมีทักษะระเบียบราชการและการจัดเก็บเอกสาร</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/60 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-950">ไม่ตรงสายงาน (Not Aligned):</span>
                      <p className="text-xs text-rose-800">วุฒิด้านพุทธศาสตร์, ปรัชญา, ครุศาสตร์, ภาษาศาสตร์ — ระบบจะแนะนำให้จัดอบรมหลักสูตรระเบียบการเงินและพัสดุภาครัฐเพิ่มเติม</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 6: CSV Import/Export */}
            {(activeSection === 'import_export' || typeof window !== 'undefined') && (
              <div className={activeSection !== 'import_export' ? 'hidden print:block' : 'space-y-4'}>
                <div className="flex items-center gap-2 text-pink-900 font-bold text-base sm:text-lg border-b border-pink-100 pb-2">
                  <FileSpreadsheet className="w-5 h-5 text-pink-700" />
                  <span>6. การนำเข้าและส่งออกข้อมูล (CSV Import & Export)</span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-1.5">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-pink-700" />
                      <span>การส่งออกไฟล์ข้อมูล (Export CSV):</span>
                    </h4>
                    <p className="text-slate-600">
                      กดปุ่ม <strong>"นำเข้า / ส่งออก CSV"</strong> แล้วเลือก <strong>"ส่งออก CSV สำรองข้อมูล"</strong> ระบบจะดาวน์โหลดไฟล์ `.csv` ที่มีรหัสภาษาไทย UTF-8 with BOM ซึ่งสามารถเปิดใน Microsoft Excel ได้ทันทีโดยภาษาไทยไม่เพี้ยน
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-1.5">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-pink-700" />
                      <span>การนำเข้าข้อมูลไฟล์ใหม่ (Import CSV):</span>
                    </h4>
                    <p className="text-slate-600">
                      หากท่านต้องการอัปเดตข้อมูลจำนวนมาก สามารถดาวน์โหลดแม่แบบ CSV (Template) กรอกข้อมูลใน Excel แล้วลากไฟล์มาวางในช่องนำเข้า ระบบจะตรวจสอบความถูกต้องของหัวคอลัมน์และบันทึกลงระบบทันที
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section 7: Role-Based Guide */}
            {(activeSection === 'roles' || typeof window !== 'undefined') && (
              <div className={activeSection !== 'roles' ? 'hidden print:block' : 'space-y-4'}>
                <div className="flex items-center gap-2 text-pink-900 font-bold text-base sm:text-lg border-b border-pink-100 pb-2">
                  <ShieldCheck className="w-5 h-5 text-pink-700" />
                  <span>7. แนวทางการใช้งานแยกตามบทบาทผู้ใช้ (Role-Based Workflow)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="border border-pink-200 rounded-xl p-3.5 bg-pink-50/50 space-y-2">
                    <div className="font-bold text-pink-950 flex items-center gap-1.5 text-sm">
                      <Building2 className="w-4 h-4 text-pink-700" />
                      <span>สำหรับผู้บริหาร</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>เปิดดูหน้า <strong>แดชบอร์ด</strong> เพื่อประเมินอัตรากำลังรวม</li>
                      <li>ตรวจสอบจุดเสี่ยง SoD ในส่วนงานใต้บังคับบัญชา</li>
                      <li>กดปุ่ม <strong>"รายงานตรวจสอบ"</strong> เพื่อดูบทสรุปและข้อเสนอแนะเชิงนโยบาย</li>
                    </ul>
                  </div>

                  <div className="border border-purple-200 rounded-xl p-3.5 bg-purple-50/50 space-y-2">
                    <div className="font-bold text-purple-950 flex items-center gap-1.5 text-sm">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>สำหรับผู้ตรวจสอบภายใน</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>วิเคราะห์เมทริกซ์ SoD ก่อนเข้าตรวจประจำปี</li>
                      <li>สืบค้นประวัติ วุฒิ และอายุงานของผู้รับตรวจ</li>
                      <li>พิมพ์รายงานผลการตรวจสอบเป็นเอกสารทางการ</li>
                    </ul>
                  </div>

                  <div className="border border-blue-200 rounded-xl p-3.5 bg-blue-50/50 space-y-2">
                    <div className="font-bold text-blue-950 flex items-center gap-1.5 text-sm">
                      <Users className="w-4 h-4 text-blue-700" />
                      <span>สำหรับเจ้าหน้าที่ผู้ดูแลข้อมูล</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>อัปเดตข้อมูลบุคลากรเมื่อมีการโยกย้ายหรือเปลี่ยนหน้าที่</li>
                      <li>สำรองข้อมูลออกเป็น CSV ทุกสิ้นไตรมาส</li>
                      <li>ตรวจสอบความถูกต้องของเบอร์โทรและหลักสูตรที่ดูแล</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Section 8: FAQ */}
            {(activeSection === 'faq' || typeof window !== 'undefined') && (
              <div className={activeSection !== 'faq' ? 'hidden print:block' : 'space-y-4'}>
                <div className="flex items-center gap-2 text-pink-900 font-bold text-base sm:text-lg border-b border-pink-100 pb-2">
                  <HelpCircle className="w-5 h-5 text-pink-700" />
                  <span>8. คำถามที่พบบ่อย (Frequently Asked Questions)</span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                    <h4 className="font-bold text-slate-900">Q: หากข้อมูลบุคลากรสูญหายหรือต้องการเริ่มต้นใหม่ ทำอย่างไร?</h4>
                    <p className="text-slate-600 mt-1">
                      A: ท่านสามารถกดปุ่ม "นำเข้า / ส่งออก CSV" แล้วเลือก "โหลดชุดข้อมูลเริ่มต้นทางการ มจร (71 รายชื่อ)" ระบบจะรีเซ็ตกลับไปเป็นข้อมูลทางการฉบับตรวจสอบล่าสุดทันที
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                    <h4 className="font-bold text-slate-900">Q: รายงานผลการตรวจสอบสามารถบันทึกเป็น PDF ได้อย่างไร?</h4>
                    <p className="text-slate-600 mt-1">
                      A: เมื่อเปิดหน้าต่าง "รายงานตรวจสอบ" ให้คลิกปุ่ม <strong>"พิมพ์รายงาน / PDF"</strong> จากนั้นในหน้าต่างการพิมพ์ของเบราว์เซอร์ ให้เลือกปลายทาง (Destination) เป็น <em>"Save as PDF"</em> (บันทึกเป็น PDF)
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                    <h4 className="font-bold text-slate-900">Q: ระบบรองรับการเปิดใช้งานบนมือถือหรือ iPad หรือไม่?</h4>
                    <p className="text-slate-600 mt-1">
                      A: ระบบถูกออกแบบให้เป็น Responsive Web Application รองรับการเปิดผ่านเบราว์เซอร์ทั้ง Safari บน iPad, Chrome บนสมาร์ทโฟน และคอมพิวเตอร์เดสก์ท็อปอย่างสมบูรณ์แบบ
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-pink-700" />
            <span>ส่วนงานตรวจสอบภายใน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition cursor-pointer"
            >
              พิมพ์คู่มือ
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              ปิดคู่มือ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
