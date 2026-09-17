import React, { useState } from 'react';
import { Personnel } from '../types';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  Copy, 
  Check, 
  Mail, 
  Phone
} from 'lucide-react';
import { formatThaiDate, calculateTenure } from '../utils/helpers';
import { evaluatePersonnelAlignment } from '../utils/educationAlignment';

interface PersonnelTableViewProps {
  personnelList: Personnel[];
  onViewDetail: (person: Personnel) => void;
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => void;
}

type SortField = 'fullName' | 'department' | 'position' | 'startDate' | 'educationLevel';

export const PersonnelTableView: React.FC<PersonnelTableViewProps> = ({
  personnelList,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const [sortField, setSortField] = useState<SortField>('department');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCopyLine = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sortedList = [...personnelList].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'fullName') {
      comparison = a.fullName.localeCompare(b.fullName, 'th');
    } else if (sortField === 'department') {
      comparison = a.department.localeCompare(b.department, 'th');
    } else if (sortField === 'position') {
      comparison = a.position.localeCompare(b.position, 'th');
    } else if (sortField === 'startDate') {
      comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    } else if (sortField === 'educationLevel') {
      comparison = a.educationLevel.localeCompare(b.educationLevel, 'th');
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="personnel-table-wrapper">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-medium">
              <th className="py-3 px-3 w-12 text-center">ลำดับ</th>
              
              {/* 1. ส่วนงาน */}
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center gap-1">
                  <span>1. ส่วนงาน</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* 2. ชื่อ-นามสกุล */}
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition"
                onClick={() => handleSort('fullName')}
              >
                <div className="flex items-center gap-1">
                  <span>2. ชื่อ-นามสกุล</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* 3. ตำแหน่ง */}
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition"
                onClick={() => handleSort('position')}
              >
                <div className="flex items-center gap-1">
                  <span>3. ตำแหน่ง</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* 4. ภาระหน้าที่ */}
              <th className="py-3 px-3">
                <span>4. ภาระหน้าที่</span>
              </th>

              {/* 5. ระดับการศึกษา */}
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition"
                onClick={() => handleSort('educationLevel')}
              >
                <div className="flex items-center gap-1">
                  <span>5. วุฒิ</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* 6. สาขาวิชา */}
              <th className="py-3 px-3">
                <span>6. สาขาวิชา</span>
              </th>

              {/* 7. วันเริ่มปฏิบัติงาน */}
              <th 
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition"
                onClick={() => handleSort('startDate')}
              >
                <div className="flex items-center gap-1">
                  <span>7. วันเริ่มงาน (อายุงาน)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              {/* 8. E-mail */}
              <th className="py-3 px-3">
                <span>8. E-mail</span>
              </th>

              {/* 9. ID Line */}
              <th className="py-3 px-3">
                <span>9. ID Line</span>
              </th>

              {/* 10. โทรศัพท์ */}
              <th className="py-3 px-3">
                <span>10. โทรศัพท์</span>
              </th>

              {/* จัดการ */}
              <th className="py-3 px-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-body">
            {sortedList.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-500">
                  ไม่พบข้อมูลผู้ปฏิบัติงานที่ตรงกับคำค้นหา
                </td>
              </tr>
            ) : (
              sortedList.map((person, index) => {
                const tenure = calculateTenure(person.startDate);

                return (
                  <tr 
                    key={person.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    {/* ลำดับ */}
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>

                    {/* 1. ส่วนงานและหลักสูตร */}
                    <td className="py-3 px-3 max-w-[220px]">
                      <div className="font-semibold text-slate-900 truncate" title={person.parentDepartment || person.department}>
                        {person.parentDepartment || person.department}
                      </div>
                      {person.subDepartment && (
                        <div className="text-[11px] text-slate-600 truncate" title={person.subDepartment}>
                          › {person.subDepartment}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {person.isMultiCurriculum && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200" title="ดูแลภาระงานหลายหลักสูตร">
                            ควบ {person.curricula?.length || 2} หลักสูตร
                          </span>
                        )}
                        {person.academicLevels?.map(lvl => (
                          <span key={lvl} className="px-1 py-0.2 rounded text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {lvl === 'ประกาศนียบัตร / ป.บัณฑิต' ? 'ป.บัณฑิต' : lvl}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* 2. ชื่อ-นามสกุล */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {person.fullName}
                      </div>
                    </td>

                    {/* 3. ตำแหน่ง */}
                    <td className="py-3 px-3 max-w-[160px]">
                      <div className="text-pink-800 font-medium truncate" title={person.position}>
                        {person.position}
                      </div>
                    </td>

                    {/* 4. ภาระหน้าที่ */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {person.primaryDuties.map(duty => {
                          let badgeClass = 'bg-slate-100 text-slate-700';
                          if (duty === 'การเงิน') badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          if (duty === 'บัญชี') badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                          if (duty === 'พัสดุ') badgeClass = 'bg-pink-50 text-pink-700 border-pink-200';
                          if (duty === 'งบประมาณ') badgeClass = 'bg-purple-50 text-purple-700 border-purple-200';

                          return (
                            <span 
                              key={duty} 
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${badgeClass}`}
                            >
                              {duty}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* 5. ระดับการศึกษา */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-800 font-medium">
                        {person.educationLevel}
                      </span>
                    </td>

                    {/* 6. สาขาวิชา */}
                    <td className="py-3 px-3 max-w-[150px]">
                      <div className="truncate text-slate-800 font-medium" title={person.major}>
                        {person.major}
                      </div>
                      {(() => {
                        const alignmentEval = evaluatePersonnelAlignment(person);
                        return (
                          <div className="mt-0.5">
                            <span 
                              className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium border ${
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
                        );
                      })()}
                    </td>

                    {/* 7. วันเริ่มงาน (อายุงาน) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-slate-800 font-medium">
                        {formatThaiDate(person.startDate, true)}
                      </div>
                      <div className="text-[10px] text-pink-800">
                        {tenure.text}
                      </div>
                    </td>

                    {/* 8. E-mail */}
                    <td className="py-3 px-3 max-w-[130px]">
                      <a 
                        href={`mailto:${person.email}`}
                        className="text-pink-800 hover:underline truncate block flex items-center gap-1"
                        title={person.email}
                      >
                        <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="truncate">{person.email}</span>
                      </a>
                    </td>

                    {/* 9. ID Line */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCopyLine(person.id, person.lineId)}
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-700 transition font-mono cursor-pointer"
                        title="คลิกเพื่อคัดลอก Line ID"
                      >
                        <span>{person.lineId}</span>
                        {copiedId === person.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400" />
                        )}
                      </button>
                    </td>

                    {/* 10. โทรศัพท์ */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <a 
                        href={`tel:${person.phone}`}
                        className="text-slate-800 hover:text-pink-800 hover:underline font-mono inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{person.phone}</span>
                        {person.internalPhone && <span className="text-slate-500">#{person.internalPhone}</span>}
                      </a>
                    </td>

                    {/* จัดการ */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewDetail(person)}
                          className="p-1.5 rounded text-slate-600 hover:text-pink-800 hover:bg-pink-50 transition cursor-pointer"
                          title="ดูรายละเอียดครบ 10 ข้อ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(person)}
                          className="p-1.5 rounded text-slate-600 hover:text-pink-800 hover:bg-pink-50 transition cursor-pointer"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(person.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="ลบข้อมูล"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
  );
};
