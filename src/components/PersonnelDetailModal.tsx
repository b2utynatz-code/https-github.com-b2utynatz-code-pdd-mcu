import React, { useState } from 'react';
import { Personnel } from '../types';
import { 
  X, 
  Building2, 
  User, 
  Briefcase, 
  ClipboardList, 
  GraduationCap, 
  Calendar, 
  Mail, 
  Phone, 
  MessageSquare, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  Printer, 
  Clock,
  Award,
  Trash2,
  BookOpen,
  Layers,
  Sparkles,
  Plus,
  FileCheck
} from 'lucide-react';
import { formatThaiDate, calculateTenure } from '../utils/helpers';
import { evaluatePersonnelAlignment } from '../utils/educationAlignment';

interface PersonnelDetailModalProps {
  person: Personnel | null;
  onClose: () => void;
  onEdit: (person: Personnel) => void;
  onDelete?: (id: string) => void;
}

export const PersonnelDetailModal: React.FC<PersonnelDetailModalProps> = ({
  person,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copiedLine, setCopiedLine] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!person) return null;

  const tenure = calculateTenure(person.startDate);
  const isMonk = person.gender === 'monk' || person.fullName.startsWith('พระ') || person.titlePrefix?.startsWith('พระ');
  const trainings = person.trainings || [];
  const totalTrainingHours = trainings.reduce((acc, t) => acc + (Number(t.hours) || 0), 0);

  const handleCopy = (text: string, type: 'line' | 'phone' | 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'line') {
      setCopiedLine(true);
      setTimeout(() => setCopiedLine(false), 2000);
    } else if (type === 'phone') {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        id="personnel-detail-modal"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-800 via-pink-700 to-rose-700 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${
              isMonk ? 'bg-pink-600 text-pink-100 border border-pink-400/40' : 'bg-white/20 text-white'
            }`}>
              {isMonk ? 'มจร' : person.fullName.slice(0, 2)}
            </div>
            <div>
              <div className="text-xs text-pink-200 font-medium tracking-wide">
                บัตรประวัติและข้อมูลผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ
              </div>
              <h2 className="text-xl font-bold mt-0.5">
                {person.fullName}
              </h2>
              <p className="text-xs text-pink-100 font-body">
                {person.position} • {person.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="พิมพ์เอกสารสำหรับงานตรวจสอบ"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: ข้อมูลทั่วไป (Items 1-4) */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 text-pink-900 font-semibold text-sm">
              <User className="w-4 h-4 text-pink-700" />
              <span>หมวดที่ 1: ข้อมูลทั่วไป</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-body text-xs">
              {/* 1. ส่วนงาน */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">1. ส่วนงานหลัก</span>
                <span className="text-slate-900 font-semibold text-sm block">{person.parentDepartment || person.department}</span>
                {person.subDepartment && (
                  <span className="text-pink-900 text-xs font-medium block mt-0.5">ส่วนงานย่อย: {person.subDepartment}</span>
                )}
                <span className="text-slate-500 text-[11px] block mt-0.5">กลุ่มสังกัด: {person.departmentCategory}</span>
              </div>

              {/* 2. ชื่อ-นามสกุล */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">2. ชื่อ-นามสกุล</span>
                <span className="text-slate-900 font-semibold text-sm block">{person.fullName}</span>
                {person.titlePrefix && <span className="text-slate-500 text-[11px]">คำนำหน้า: {person.titlePrefix}</span>}
              </div>

              {/* 3. ตำแหน่ง */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">3. ตำแหน่ง</span>
                <span className="text-slate-900 font-semibold text-sm block text-pink-900">{person.position}</span>
              </div>

              {/* 4. ภาระหน้าที่ */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 sm:col-span-2 space-y-2">
                <span className="text-slate-400 block text-[11px] font-medium">4. ภาระหน้าที่</span>
                
                <div className="flex flex-wrap gap-1.5">
                  {person.primaryDuties.map(duty => {
                    let badgeColor = 'bg-slate-100 text-slate-700';
                    if (duty === 'การเงิน') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    if (duty === 'บัญชี') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    if (duty === 'พัสดุ') badgeColor = 'bg-pink-50 text-pink-700 border-pink-200';
                    if (duty === 'งบประมาณ') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';

                    return (
                      <span key={duty} className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeColor}`}>
                        งาน{duty}
                      </span>
                    );
                  })}

                  {person.isCertifiedProcurement && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                      <Award className="w-3.5 h-3.5" />
                      <span>ผ่านการรับรองกฎหมายพัสดุ e-GP</span>
                    </span>
                  )}
                </div>

                {person.dutyDescription && (
                  <div className="pt-2 text-slate-700 leading-relaxed bg-white p-3 rounded border border-slate-200/70">
                    <span className="font-medium text-slate-900 block mb-1 text-[11px]">รายละเอียดความรับผิดชอบ:</span>
                    {person.dutyDescription}
                  </div>
                )}

                {person.duties && person.duties.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] text-slate-500 font-medium block mb-1">งานเฉพาะที่ได้รับมอบหมาย:</span>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {person.duties.map((duty, idx) => (
                        <li key={idx}>{duty}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* New Section: รายละเอียดส่วนงานย่อยและหลักสูตรที่รับผิดชอบ */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-pink-900 font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-pink-700" />
                <span>โครงสร้างส่วนงานย่อยและหลักสูตรที่รับผิดชอบ</span>
              </div>
              {person.isMultiCurriculum && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Layers className="w-3 h-3 text-indigo-600" />
                  <span>ดูแลควบ {person.curricula?.length || 2} หลักสูตร</span>
                </span>
              )}
            </div>

            <div className="space-y-3 font-body text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* ส่วนงานหลัก */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">ส่วนงานหลัก / คณะ / วิทยาเขต</span>
                  <span className="text-slate-900 font-semibold text-sm block">{person.parentDepartment || person.department}</span>
                </div>

                {/* ส่วนงานย่อย / ภาควิชา */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">ส่วนงานย่อย / ภาควิชา / สาขาวิชา</span>
                  <span className="text-slate-900 font-semibold text-sm block text-pink-900">
                    {person.subDepartment || 'สำนักงานส่วนงาน'}
                  </span>
                </div>
              </div>

              {/* ระดับการศึกษาที่เปิดสอน/รับผิดชอบ */}
              {person.academicLevels && person.academicLevels.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-1.5 font-medium">ระดับการศึกษาที่เปิดสอนในความรับผิดชอบ</span>
                  <div className="flex flex-wrap gap-2">
                    {person.academicLevels.map(lvl => {
                      let color = 'bg-sky-50 text-sky-700 border-sky-200';
                      if (lvl === 'ปริญญาโท') color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                      if (lvl === 'ปริญญาเอก') color = 'bg-purple-50 text-purple-700 border-purple-200';
                      if (lvl.includes('ประกาศนียบัตร')) color = 'bg-amber-50 text-amber-800 border-amber-200';
                      return (
                        <span key={lvl} className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${color}`}>
                          {lvl}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* รายการหลักสูตรที่ดูแลรับผิดชอบ */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 font-medium text-xs">
                    รายการหลักสูตรที่ดูแลรับผิดชอบ ({person.curricula?.length || 0} หลักสูตร):
                  </span>
                  {person.isMultiCurriculum && (
                    <span className="text-[11px] text-indigo-700 font-medium">
                      ภาระงานครอบคลุมหลายหลักสูตร
                    </span>
                  )}
                </div>

                {person.curricula && person.curricula.length > 0 ? (
                  <div className="space-y-1.5">
                    {person.curricula.map((curr, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white p-2.5 rounded-md border border-slate-200 flex items-start gap-2 text-slate-800 font-medium"
                      >
                        <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <span>{curr}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">ไม่ระบุหลักสูตรเฉพาะ (ดูแลภาพรวมส่วนงาน)</p>
                )}
              </div>

              {/* Multi-curriculum workload notice banner */}
              {person.isMultiCurriculum && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 text-indigo-900 flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <strong>ข้อสังเกตภาระงานหลายหลักสูตร:</strong> บุคลากรท่านนี้มีภาระงานรับผิดชอบครอบคลุม{' '}
                    <strong>{person.curricula?.length || 2} หลักสูตร</strong>
                    {person.academicLevels && person.academicLevels.length > 1 && (
                      <> และข้าม <strong>{person.academicLevels.length} ระดับการศึกษา</strong></>
                    )}
                    {' '}ซึ่งอาจส่งผลให้มีปริมาณงานเอกสาร งบประมาณ และการประสานงานสูงกว่าปกติ ควรพิจารณาสนับสนุนด้านเทคโนโลยีหรือบุคลากรช่วยงาน
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: วุฒิการศึกษาและระยะเวลาปฏิบัติงาน (Items 5-7) */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 text-pink-900 font-semibold text-sm">
              <GraduationCap className="w-4 h-4 text-pink-700" />
              <span>หมวดที่ 2: วุฒิการศึกษาและระยะเวลาปฏิบัติงาน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-body text-xs">
              {/* 5. ระดับการศึกษา */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">5. ระดับการศึกษา</span>
                <span className="text-slate-900 font-semibold text-sm block">{person.educationLevel}</span>
              </div>

              {/* 6. สาขาวิชา */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">6. สาขาวิชา</span>
                <span className="text-slate-900 font-semibold text-sm block">{person.major}</span>
                {person.graduationInstitution && (
                  <span className="text-slate-500 text-[11px]">สถาบัน: {person.graduationInstitution}</span>
                )}
              </div>

              {/* 7. วัน/เดือน/ปี ที่เริ่มปฏิบัติงาน */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 sm:col-span-3">
                <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">7. วัน/เดือน/ปี ที่เริ่มปฏิบัติงาน</span>
                <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
                  <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                    <Calendar className="w-4 h-4 text-pink-700" />
                    <span>{formatThaiDate(person.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-100 text-pink-900 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5 text-pink-700" />
                    <span>อายุงานรวม: {tenure.text}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Education to Duties Alignment Audit Assessment */}
            {(() => {
              const alignment = evaluatePersonnelAlignment(person);
              return (
                <div className="mt-3.5 bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-pink-700" />
                      <span className="text-xs font-bold text-slate-900">
                        ผลวิเคราะห์ความตรงสายงานของสาขาวิชาที่จบกับภาระหน้าที่ (Internal Audit Assessment)
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      alignment.level === 'direct'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : alignment.level === 'related'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-amber-50 text-amber-900 border-amber-300'
                    }`}>
                      {alignment.levelLabel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-body mb-2 leading-relaxed">
                    {alignment.reason}
                  </p>

                  <div className="bg-white p-3 rounded-md border border-slate-200 text-xs text-slate-700">
                    <strong className="text-pink-900 block mb-1">ข้อเสนอแนะในการกำกับดูแลและพัฒนา:</strong>
                    <p className="font-body leading-relaxed">{alignment.recommendation}</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Section 3: ข้อมูลการติดต่อ (Items 8-10) */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 text-pink-900 font-semibold text-sm">
              <Phone className="w-4 h-4 text-pink-700" />
              <span>หมวดที่ 3: ข้อมูลการติดต่อ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-body text-xs">
              {/* 8. E-mail */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-[11px] font-medium">8. E-mail</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(person.email, 'email')}
                    className="text-[10px] text-slate-500 hover:text-pink-800 flex items-center gap-0.5 cursor-pointer"
                  >
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <a 
                  href={`mailto:${person.email}`}
                  className="text-pink-800 hover:underline font-semibold block truncate"
                  title={person.email}
                >
                  {person.email}
                </a>
              </div>

              {/* 9. ID Line */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-[11px] font-medium">9. ID Line</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(person.lineId, 'line')}
                    className="text-[10px] text-slate-500 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    {copiedLine ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-slate-900 font-semibold font-mono text-sm">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{person.lineId}</span>
                </div>
              </div>

              {/* 10. โทรศัพท์ */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-[11px] font-medium">10. โทรศัพท์</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(person.phone, 'phone')}
                    className="text-[10px] text-slate-500 hover:text-pink-800 flex items-center gap-0.5 cursor-pointer"
                  >
                    {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <a 
                  href={`tel:${person.phone}`}
                  className="text-slate-900 font-semibold font-mono text-sm hover:text-pink-800 hover:underline block"
                >
                  {person.phone}
                </a>
                {person.internalPhone && (
                  <span className="text-slate-500 text-[11px]">เบอร์ต่อภายใน: {person.internalPhone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: ข้อมูลการเข้ารับการอบรมและพัฒนาบุคลากร (Training & Risk Mitigation Portfolio) */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-pink-900 font-semibold text-sm">
                <Award className="w-4 h-4 text-pink-700" />
                <span>หมวดที่ 4: ข้อมูลการเข้ารับการอบรมเพิ่มเติม (เพื่อพัฒนาบุคลากร และลดความเสี่ยงในอนาคต)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                  {trainings.length} หลักสูตร
                </span>
                {totalTrainingHours > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    รวม {totalTrainingHours} ชม.
                  </span>
                )}
              </div>
            </div>

            {/* If certified procurement flag is active */}
            {person.isCertifiedProcurement && (
              <div className="mb-3 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">ขึ้นทะเบียนผ่านการอบรม พ.ร.บ. จัดซื้อจัดจ้างฯ 2560 (Certificate กรมบัญชีกลาง)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium shrink-0">
                  รับรองแล้ว
                </span>
              </div>
            )}

            {trainings.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-medium text-slate-700">
                  ยังไม่มีประวัติการเข้ารับการอบรมเพิ่มเติมในระบบ
                </p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  ข้อแนะนำของผู้ตรวจสอบภายใน: ควรส่งเสริมให้บุคลากรเข้ารับการอบรมพัฒนาความรู้ในภาระหน้าที่หลัก เช่น กฎหมายการเงินพัสดุภาครัฐ เพื่อลดความเสี่ยงที่จะเกิดขึ้นในอนาคต
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(person);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-medium transition cursor-pointer shadow-xs mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มข้อมูลการอบรมตอนนี้</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {trainings.map((t, idx) => (
                  <div 
                    key={t.id || idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-pink-200 transition space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="font-bold text-slate-900 text-xs">{t.courseName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-pink-100 text-pink-800 border border-pink-200">
                            {t.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            t.status === 'มีวุฒิบัตร/ผ่านเกณฑ์' || t.status === 'ผ่านการอบรมแล้ว'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 font-body">
                          <span>🏢 ผู้จัด: {t.organizer}</span>
                          <span>📅 วันที่: {formatThaiDate(t.trainingDate)}</span>
                          <span>⏱️ {t.hours} ชั่วโมง</span>
                          {t.certificateNo && <span className="font-mono">📜 วุฒิบัตรเลขที่: {t.certificateNo}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Risk Mitigation Impact */}
                    {t.riskMitigationImpact && (
                      <div className="p-2.5 bg-white rounded-lg border border-emerald-200/90 text-[11px] text-slate-800 font-body flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-900 block font-semibold">ผลลัพธ์ต่อการพัฒนาและลดความเสี่ยงในอนาคต:</strong>
                          <p className="text-slate-700 mt-0.5">{t.riskMitigationImpact}</p>
                        </div>
                      </div>
                    )}

                    {t.notes && (
                      <div className="text-[11px] text-slate-500 font-body italic pl-2 border-l-2 border-slate-300">
                        หมายเหตุ: {t.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: ข้อสังเกตงานตรวจสอบภายใน (Audit Dossier Notes) */}
          <div className="bg-pink-50/70 border border-pink-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-pink-900 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-pink-700" />
                <span>หมวดที่ 5: บันทึกและข้อสังเกตงานตรวจสอบภายใน (Internal Audit Assessment)</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-pink-900 border border-pink-200">
                สถานะ: {person.auditStatus || 'ปกติ'}
              </span>
            </div>
            
            <p className="text-xs text-pink-950 font-body leading-relaxed">
              {person.auditNotes || 'ไม่พบข้อสังเกตที่มีนัยสำคัญด้านการควบคุมภายใน'}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-body">
            รหัสอ้างอิง: <span className="font-mono text-slate-600">{person.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(person.id);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition cursor-pointer"
                title="ลบข้อมูลผู้ปฏิบัติงานท่านนี้"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบข้อมูล</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(person);
              }}
              className="px-4 py-2 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-medium transition cursor-pointer shadow-xs"
            >
              แก้ไขข้อมูล
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
