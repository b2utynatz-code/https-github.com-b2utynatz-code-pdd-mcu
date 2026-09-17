import React, { useState } from 'react';
import { Personnel } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Building, 
  Search, 
  Filter, 
  ChevronRight,
  Info
} from 'lucide-react';

interface DutyMatrixProps {
  personnelList: Personnel[];
  onSelectPersonnel: (person: Personnel) => void;
}

export const DutyMatrix: React.FC<DutyMatrixProps> = ({
  personnelList,
  onSelectPersonnel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'conflict' | 'normal'>('all');

  // Group personnel by department
  const departmentMap = new Map<string, Personnel[]>();
  personnelList.forEach(p => {
    const list = departmentMap.get(p.department) || [];
    list.push(p);
    departmentMap.set(p.department, list);
  });

  const departmentRows = Array.from(departmentMap.entries()).map(([dept, staff]) => {
    // Check coverage of 4 duties
    const hasFinance = staff.some(p => p.primaryDuties.includes('การเงิน'));
    const hasAccounting = staff.some(p => p.primaryDuties.includes('บัญชี'));
    const hasSupplies = staff.some(p => p.primaryDuties.includes('พัสดุ'));
    const hasBudget = staff.some(p => p.primaryDuties.includes('งบประมาณ'));

    // Check for Segregation of Duties (SoD) conflict:
    // If ANY single person has both 'การเงิน' and 'พัสดุ'
    const conflictPerson = staff.find(
      p => p.primaryDuties.includes('การเงิน') && p.primaryDuties.includes('พัสดุ')
    );

    // If unit has only 1 person covering all 4 or multiple conflicting duties
    const isHighRisk = !!conflictPerson;
    const isModerateRisk = !isHighRisk && staff.some(p => p.primaryDuties.length >= 3);

    return {
      department: dept,
      category: staff[0]?.departmentCategory || 'ส่วนงาน',
      staff,
      hasFinance,
      hasAccounting,
      hasSupplies,
      hasBudget,
      isHighRisk,
      isModerateRisk,
      conflictPerson,
    };
  });

  // Filter rows
  const filteredRows = departmentRows.filter(row => {
    const matchSearch = row.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.staff.some(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;

    if (filterRisk === 'conflict') {
      return row.isHighRisk || row.isModerateRisk;
    }
    if (filterRisk === 'normal') {
      return !row.isHighRisk && !row.isModerateRisk;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="duty-matrix-component">
      {/* Header Description */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>ตารางเมทริกซ์การแบ่งแยกหน้าที่และความครอบคลุมภาระงาน (Segregation of Duties - SoD)</span>
            </h2>
            <p className="text-xs text-slate-600 font-body mt-1">
              เครื่องมือสำหรับนักวิชาการตรวจสอบภายใน ติดตามการแบ่งแยกหน้าที่ 4 ด้าน (การเงิน, บัญชี, พัสดุ, งบประมาณ) ของแต่ละส่วนงานย่อยใน มจร เพื่อความโปร่งใสและลดความเสี่ยง
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>การควบคุมภายในปกติ</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-300 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>ควรติดตาม / ควบหน้าที่</span>
            </span>
          </div>
        </div>

        {/* Search & Filter Bar for Matrix */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อส่วนงาน หรือชื่อผู้ปฏิบัติงาน..."
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 font-body"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterRisk}
              onChange={e => setFilterRisk(e.target.value as any)}
              className="text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 font-body cursor-pointer"
            >
              <option value="all">ทุกระดับการควบคุม ({departmentRows.length} ส่วนงาน)</option>
              <option value="conflict">เฉพาะส่วนงานที่ควรติดตาม ({departmentRows.filter(r => r.isHighRisk || r.isModerateRisk).length} ส่วนงาน)</option>
              <option value="normal">เฉพาะส่วนงานปกติ ({departmentRows.filter(r => !r.isHighRisk && !r.isModerateRisk).length} ส่วนงาน)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info notice about Segregation of Duties */}
      <div className="px-5 py-2.5 bg-pink-50/50 border-b border-pink-100 flex items-center gap-2 text-xs text-pink-900 font-body">
        <Info className="w-4 h-4 text-pink-700 shrink-0" />
        <span>
          <strong className="font-semibold">ข้อแนะนำงานตรวจสอบภายใน:</strong> หลักการควบคุมภายในที่ดีกำหนดให้ผู้ถือเงิน (การเงิน) และผู้จัดซื้อพัสดุ (พัสดุ) ต้องเป็นบุคคลคนละคน เพื่อป้องกันผลประโยชน์ทับซ้อนและการตรวจสอบถ่วงดุลที่มีประสิทธิภาพ
        </span>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-medium">
              <th className="py-3 px-4 w-1/4">ส่วนงานย่อย</th>
              <th className="py-3 px-4 w-1/4">ผู้ปฏิบัติงานในส่วนงาน</th>
              <th className="py-3 px-3 text-center">1. การเงิน</th>
              <th className="py-3 px-3 text-center">2. บัญชี</th>
              <th className="py-3 px-3 text-center">3. พัสดุ</th>
              <th className="py-3 px-3 text-center">4. งบประมาณ</th>
              <th className="py-3 px-4 text-center">สถานะการตรวจสอบ (Audit SoD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-body">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  ไม่พบส่วนงานที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            ) : (
              filteredRows.map(row => (
                <tr 
                  key={row.department}
                  className={`hover:bg-slate-50/80 transition ${
                    row.isHighRisk ? 'bg-rose-50/40' : ''
                  }`}
                >
                  {/* Subunit Name */}
                  <td className="py-3 px-4 align-top">
                    <div className="font-semibold text-slate-900 text-sm">{row.department}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{row.category}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">รวม {row.staff.length} คน</div>
                  </td>

                  {/* Staff Members List */}
                  <td className="py-3 px-4 align-top">
                    <div className="space-y-1.5">
                      {row.staff.map(person => (
                        <div
                          key={person.id}
                          onClick={() => onSelectPersonnel(person)}
                          className="flex items-center justify-between p-1.5 rounded-md hover:bg-white hover:border-slate-300 border border-transparent transition cursor-pointer group"
                        >
                          <div>
                            <div className="font-medium text-slate-800 text-xs group-hover:text-pink-700">
                              {person.fullName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {person.position}
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-pink-600 transition" />
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* 1. Finance Column */}
                  <td className="py-3 px-3 text-center align-middle">
                    {row.hasFinance ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <span className="text-slate-300 font-mono">-</span>
                    )}
                  </td>

                  {/* 2. Accounting Column */}
                  <td className="py-3 px-3 text-center align-middle">
                    {row.hasAccounting ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <span className="text-slate-300 font-mono">-</span>
                    )}
                  </td>

                  {/* 3. Supplies Column */}
                  <td className="py-3 px-3 text-center align-middle">
                    {row.hasSupplies ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-pink-100 text-pink-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <span className="text-slate-300 font-mono">-</span>
                    )}
                  </td>

                  {/* 4. Budget Column */}
                  <td className="py-3 px-3 text-center align-middle">
                    {row.hasBudget ? (
                      <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <span className="text-slate-300 font-mono">-</span>
                    )}
                  </td>

                  {/* Audit Evaluation Column */}
                  <td className="py-3 px-4 text-center align-middle">
                    {row.isHighRisk ? (
                      <div className="inline-flex flex-col items-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                          <span>พบควบการเงิน+พัสดุ</span>
                        </span>
                        {row.conflictPerson && (
                          <span className="text-[10px] text-rose-900 mt-1 max-w-[150px] truncate">
                            ({row.conflictPerson.fullName})
                          </span>
                        )}
                      </div>
                    ) : row.isModerateRisk ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200">
                        <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                        <span>ควบหลายหน้าที่</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>แบ่งแยกหน้าที่ดี</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
