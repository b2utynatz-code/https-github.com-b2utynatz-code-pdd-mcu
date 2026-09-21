import React, { useState } from 'react';
import { Personnel } from '../types';
import { 
  Building2, 
  GraduationCap, 
  Calendar, 
  Mail, 
  Phone, 
  MessageSquare, 
  Copy, 
  Check, 
  Eye, 
  Edit, 
  Trash2,
  Award,
  AlertTriangle,
  BookOpen,
  Layers
} from 'lucide-react';
import { formatThaiDate, calculateTenure } from '../utils/helpers';
import { evaluatePersonnelAlignment } from '../utils/educationAlignment';

interface PersonnelCardProps {
  person: Personnel;
  onViewDetail: (person: Personnel) => void;
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => void;
}

export const PersonnelCard: React.FC<PersonnelCardProps> = ({
  person,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const [copiedLine, setCopiedLine] = useState(false);
  const tenure = calculateTenure(person.startDate);
  const alignmentEval = evaluatePersonnelAlignment(person);

  const handleCopyLine = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(person.lineId);
    setCopiedLine(true);
    setTimeout(() => setCopiedLine(false), 2000);
  };

  // Avatar representation
  const isMonk = person.gender === 'monk' || person.fullName.startsWith('พระ') || person.titlePrefix?.startsWith('พระ');

  const getAcademicLevelColor = (level: string) => {
    switch (level) {
      case 'ปริญญาตรี': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'ปริญญาโท': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ปริญญาเอก': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ประกาศนียบัตร / ป.บัณฑิต': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div 
      id={`person-card-${person.id}`}
      className="bg-white rounded-xl border border-slate-200 hover:border-pink-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
    >
      {/* Card Header: Department & Hierarchy & Audit Status */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold truncate">
              <Building2 className="w-3.5 h-3.5 text-pink-700 shrink-0" />
              <span className="truncate" title={person.parentDepartment || person.department}>
                {person.parentDepartment || person.department}
              </span>
            </div>
            {person.subDepartment && (
              <div className="text-[11px] text-slate-500 truncate pl-5 mt-0.5" title={person.subDepartment}>
                › {person.subDepartment}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {person.isMultiCurriculum && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0" title={`ดูแลควบ ${person.curricula?.length || 2} หลักสูตร`}>
                <Layers className="w-2.5 h-2.5 text-indigo-600" />
                <span>ควบ {person.curricula?.length || 2} หลักสูตร</span>
              </span>
            )}

            {person.auditStatus === 'ควรติดตาม' || person.auditStatus === 'ต้องการบุคลากรเพิ่ม' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>{person.auditStatus}</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                ปกติ
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Body: General Info & Responsibilities */}
      <div className="p-4 sm:p-5 flex-1 space-y-3.5">
        {/* Name & Title */}
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
            isMonk 
              ? 'bg-pink-100 text-pink-800 border border-pink-300' 
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            {isMonk ? 'มจร' : person.fullName.slice(0, 2)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-pink-800 transition truncate" title={person.fullName}>
              {person.fullName}
            </h3>
            <p className="text-xs font-medium text-pink-800 mt-0.5 truncate">
              {person.position}
            </p>
          </div>
        </div>

        {/* 4 Core Duty Badges */}
        <div>
          <div className="text-[11px] font-medium text-slate-400 mb-1.5">ภาระหน้าที่รับผิดชอบ:</div>
          <div className="flex flex-wrap gap-1.5">
            {person.primaryDuties.map(duty => {
              let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
              if (duty === 'การเงิน') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              if (duty === 'บัญชี') badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
              if (duty === 'พัสดุ') badgeColor = 'bg-pink-50 text-pink-700 border-pink-200';
              if (duty === 'งบประมาณ') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';

              return (
                <span
                  key={duty}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${badgeColor}`}
                >
                  {duty}
                </span>
              );
            })}

            {person.isCertifiedProcurement && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200" title="ผ่านการอบรม พ.ร.บ.จัดซื้อจัดจ้างฯ 2560">
                <Award className="w-3 h-3" />
                <span>e-GP / กฎหมายพัสดุ</span>
              </span>
            )}
          </div>

          {person.dutyDescription && (
            <p className="text-xs text-slate-600 font-body mt-2 line-clamp-2">
              {person.dutyDescription}
            </p>
          )}
        </div>

        {/* Granular Curricula & Academic Levels Section */}
        {((person.academicLevels && person.academicLevels.length > 0) || (person.curricula && person.curricula.length > 0)) && (
          <div className="bg-slate-50/90 rounded-lg p-2.5 border border-slate-200/80 space-y-1.5">
            {/* Academic Levels */}
            {person.academicLevels && person.academicLevels.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">ระดับการศึกษา:</span>
                {person.academicLevels.map(lvl => (
                  <span
                    key={lvl}
                    className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${getAcademicLevelColor(lvl)}`}
                  >
                    {lvl}
                  </span>
                ))}
              </div>
            )}

            {/* Curricula list */}
            {person.curricula && person.curricula.length > 0 && (
              <div className="pt-1">
                <div className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <BookOpen className="w-2.5 h-2.5 text-pink-700" />
                  <span>หลักสูตรที่ดูแล ({person.curricula.length}):</span>
                </div>
                <div className="space-y-0.5">
                  {person.curricula.slice(0, 2).map((c, i) => (
                    <div key={i} className="text-[11px] text-slate-700 font-body truncate flex items-center gap-1">
                      <span className="text-pink-600 font-bold">•</span>
                      <span className="truncate">{c}</span>
                    </div>
                  ))}
                  {person.curricula.length > 2 && (
                    <div className="text-[10px] text-indigo-700 font-medium pl-2.5">
                      + อีก {person.curricula.length - 2} หลักสูตร (คลิกดูรายละเอียด)
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Education & Tenure Block */}
        <div className="bg-slate-50/80 rounded-lg p-3 text-xs space-y-2 border border-slate-100 font-body">
          {/* Education */}
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-slate-700 flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1 flex-wrap">
                <div>
                  <span className="font-semibold text-slate-900">{person.educationLevel}</span>
                  <span className="text-slate-600 ml-1">สาขา{person.major}</span>
                </div>
                <span 
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0 ${
                    alignmentEval.level === 'direct'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : alignmentEval.level === 'related'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                  title={alignmentEval.reason}
                >
                  {alignmentEval.levelLabel}
                </span>
              </div>
              {person.graduationInstitution && (
                <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                  ({person.graduationInstitution})
                </span>
              )}
            </div>
          </div>

          {/* Start date & Tenure */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>เริ่มงาน: <strong className="text-slate-800">{formatThaiDate(person.startDate, true)}</strong></span>
            <span className="text-slate-300">•</span>
            <span>อายุงาน: <strong className="text-pink-800">{tenure.text}</strong></span>
          </div>
        </div>

        {/* Training & Development Indicator */}
        {person.trainings && person.trainings.length > 0 && (
          <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg bg-pink-50/80 border border-pink-200 text-[11px] text-pink-950 font-body">
            <div className="flex items-center gap-1.5 truncate">
              <Award className="w-3.5 h-3.5 text-pink-700 shrink-0" />
              <span className="truncate">
                อบรมแล้ว <strong>{person.trainings.length} หลักสูตร</strong>
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-white text-pink-800 font-semibold text-[10px] border border-pink-200 shrink-0">
              {person.trainings.reduce((a, t) => a + (Number(t.hours) || 0), 0)} ชม.
            </span>
          </div>
        )}

        {/* Contact Info (Items 8, 9, 10) */}
        <div className="space-y-1.5 text-xs font-body pt-1">
          {/* Phone */}
          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2 truncate">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a 
                href={`tel:${person.phone}`}
                className="hover:text-pink-800 hover:underline font-mono"
              >
                {person.phone}
                {person.internalPhone && ` ต่อ ${person.internalPhone}`}
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 text-slate-700 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <a 
              href={`mailto:${person.email}`}
              className="hover:text-pink-800 hover:underline truncate"
              title={person.email}
            >
              {person.email}
            </a>
          </div>

          {/* Line ID */}
          <div className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-slate-500">Line:</span>
              <span className="font-mono font-medium text-slate-900">{person.lineId}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyLine}
              className="text-[11px] text-slate-600 hover:text-emerald-700 inline-flex items-center gap-1 p-1 rounded hover:bg-slate-100 transition cursor-pointer"
              title="คัดลอก Line ID"
            >
              {copiedLine ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card Footer: Action Buttons */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetail(person)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white hover:bg-pink-50 hover:text-pink-900 hover:border-pink-200 text-slate-700 text-xs font-medium border border-slate-200 transition cursor-pointer shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5 text-pink-700" />
          <span>ดูข้อมูลครบ 10 ข้อ</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(person)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-pink-800 hover:bg-white border border-transparent hover:border-slate-200 transition cursor-pointer"
            title="แก้ไขข้อมูล"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(person.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="ลบข้อมูล"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
