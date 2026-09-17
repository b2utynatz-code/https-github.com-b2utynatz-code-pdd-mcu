import React, { useState } from 'react';
import { Personnel, PrimaryDuty, EducationLevel, SubunitCategory } from '../types';
import { X, Download, Upload, FileSpreadsheet, RotateCcw, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { exportToCSV } from '../utils/helpers';
import { REAL_SURVEY_PERSONNEL } from '../data/surveyData';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnelList: Personnel[];
  onImportPersonnel: (imported: Personnel[]) => void;
  onResetToDefault: () => void;
  onClearAllData?: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  personnelList,
  onImportPersonnel,
  onResetToDefault,
  onClearAllData,
}) => {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<'clear' | 'reset' | null>(null);
  const [activeImportMode, setActiveImportMode] = useState<'upload' | 'paste'>('upload');
  const [pastedCSVText, setPastedCSVText] = useState('');
  const [encodingDetected, setEncodingDetected] = useState<string>('');
  const [hasQuestionMarkWarning, setHasQuestionMarkWarning] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    exportToCSV(personnelList, `MCU_Personnel_Data_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleDownloadTemplate = () => {
    // Generate empty sample template with 1 example row
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
    exportToCSV(sampleRow, 'MCU_Personnel_Template_แม่แบบนำเข้า.csv');
  };

  // Common CSV Parser supporting both standard template and MCU survey format
  const parseCSVLinesToPersonnel = (text: string): Personnel[] => {
    if (!text || !text.trim()) throw new Error('ไม่พบข้อความข้อมูล');

    // Check for excessive question marks indicating lost Thai encoding
    const questionMarkCount = (text.match(/\?{4,}/g) || []).length;
    if (questionMarkCount > 3) {
      setHasQuestionMarkWarning(true);
    } else {
      setHasQuestionMarkWarning(false);
    }

    // Parse CSV lines
    const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) throw new Error('ไฟล์ไม่มีแถวข้อมูล (ต้องมีแถวหัวตารางและแถวข้อมูลอย่างน้อย 1 แถว)');

    // Simple CSV parser supporting quotes and commas inside quotes
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    // Find header row (it could be line 0, or preceded by title headers)
    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const rowText = lines[i];
      if (
        rowText.includes('ชื่อ') || 
        rowText.includes('ตำแหน่ง') || 
        rowText.includes('ส่วนงาน') || 
        rowText.includes('ภาระหน้าที่') || 
        rowText.includes('ลำดับ') ||
        rowText.includes('E-mail') ||
        rowText.includes('Email') ||
        rowText.includes('ID Line')
      ) {
        headerRowIdx = i;
        break;
      }
    }

    if (headerRowIdx === -1) {
      headerRowIdx = 0;
    }

    const headerCols = parseCSVLine(lines[headerRowIdx]).map(h => h.replace(/^["']|["']$/g, '').trim());

    // Helper to find column index by potential keywords
    const findColIdx = (keywords: string[], fallbackIdx: number): number => {
      const found = headerCols.findIndex(h => keywords.some(k => h.toLowerCase().includes(k.toLowerCase())));
      return found !== -1 ? found : fallbackIdx;
    };

    let deptIdx = findColIdx(['ส่วนงาน', 'คณะ', 'หน่วยงาน', 'สังกัด'], 1);
    const catIdx = findColIdx(['ประเภทส่วนงาน', 'ประเภทหน่วยงาน'], -1);
    let nameIdx = findColIdx(['ชื่อ-นามสกุล', 'ชื่อ - นามสกุล', 'ชื่อ', 'นามสกุล', 'ผู้ปฏิบัติงาน'], 2);
    let posIdx = findColIdx(['ตำแหน่ง'], 3);
    let primaryDutyIdx = findColIdx(['ภาระหน้าที่หลัก', 'หน้าที่หลัก', 'ภาระหน้าที่', 'ด้าน'], -1);
    let specificDutyIdx = findColIdx(['ภาระหน้าที่เฉพาะ', 'หน้าที่เฉพาะ'], -1);
    let descIdx = findColIdx(['รายละเอียด', 'คำอธิบาย'], -1);
    let eduIdx = findColIdx(['ระดับการศึกษา', 'วุฒิการศึกษา', 'การศึกษา'], 4);
    let majorIdx = findColIdx(['สาขาวิชา', 'สาขา', 'วิชาเอก'], 5);
    let dateIdx = findColIdx(['วันเริ่ม', 'วันที่เริ่ม', 'เริ่มปฏิบัติงาน', 'วันบรรจุ', 'วันที่บรรจุ'], 7);
    let emailIdx = findColIdx(['email', 'e-mail', 'อีเมล', 'e_mail'], 8);
    let lineIdx = findColIdx(['line', 'ไลน์', 'id line', 'line id'], 9);
    let phoneIdx = findColIdx(['โทรศัพท์', 'เบอร์โทร', 'มือถือ', 'tel'], 10);
    let internalPhoneIdx = findColIdx(['เบอร์ต่อ', 'ภายใน', 'เบอร์ภายใน'], -1);
    let auditStatusIdx = findColIdx(['สถานะงานตรวจสอบ', 'สถานะการตรวจสอบ', 'สถานะ'], -1);

    // Date parser helper supporting YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, Buddhist Era years (25xx)
    const parseDateString = (rawDateStr?: string): string => {
      if (!rawDateStr) return '2020-01-01';
      const trimmed = rawDateStr.replace(/^["']|["']$/g, '').trim();
      
      // Pattern YYYY-MM-DD
      const matchIso = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
      if (matchIso) {
        let year = parseInt(matchIso[1], 10);
        if (year > 2400) year -= 543; // Buddhist Era to CE
        const month = matchIso[2].padStart(2, '0');
        const day = matchIso[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      // Pattern DD/MM/YYYY or DD-MM-YYYY
      const matchDmY = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (matchDmY) {
        let year = parseInt(matchDmY[3], 10);
        if (year > 2400) year -= 543; // Buddhist Era to CE
        const day = matchDmY[1].padStart(2, '0');
        const month = matchDmY[2].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      return '2020-01-01';
    };

    const newPersonnel: Personnel[] = [];
    let currentDept = 'ส่วนงานย่อย มจร';
    let currentDeptCategory: SubunitCategory = 'คณะ / บัณฑิตวิทยาลัย';

    // Parse data rows
    for (let i = 0; i < lines.length; i++) {
      if (i === headerRowIdx) continue;
      const rawLine = lines[i].trim();
      if (!rawLine) continue;

      const cols = parseCSVLine(rawLine).map(c => c.replace(/^["']|["']$/g, '').trim());
      if (cols.length < 2) continue;

      // Check if line is a unit header, e.g. "ส่วนงาน : วิทยาเขตหนองคาย" or "คณะพุทธศาสตร์"
      const lineCombined = cols.join(' ');
      if (lineCombined.includes(':') && (lineCombined.includes('ส่วนงาน') || lineCombined.includes('วิทยาเขต') || lineCombined.includes('วิทยาลัย') || lineCombined.includes('คณะ'))) {
        const parts = lineCombined.split(':');
        if (parts.length > 1 && parts[1].trim().length > 0) {
          currentDept = parts[1].trim().replace(/^[,]+|[,]+$/g, '');
        }
        if (currentDept.includes('วิทยาเขต') || currentDept.includes('วิทยาลัยสงฆ์')) {
          currentDeptCategory = 'วิทยาเขต / วิทยาลัยสงฆ์';
        } else if (currentDept.includes('สถาบัน') || currentDept.includes('สำนัก')) {
          currentDeptCategory = 'สถาบัน / สำนัก';
        } else {
          currentDeptCategory = 'คณะ / บัณฑิตวิทยาลัย';
        }
        continue;
      }

      // Detect rows that have emails or phones
      const rowEmailCol = cols.findIndex(c => /\S+@\S+\.\S+/.test(c));
      const rowPhoneCol = cols.findIndex(c => /(0\d{1,2}[-\s]?\d{3}[-\s]?\d{4}|\b0\d{8,9}\b)/.test(c));
      const rowDateCol = cols.findIndex(c => /\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b/.test(c));

      // Dynamic adjustment if not matching header exactly
      const effEmailIdx = rowEmailCol !== -1 ? rowEmailCol : emailIdx;
      const effPhoneIdx = rowPhoneCol !== -1 ? rowPhoneCol : phoneIdx;
      const effDateIdx = rowDateCol !== -1 ? rowDateCol : dateIdx;

      // Look for full name (starts with title or has space)
      let rawName = cols[nameIdx] || '';
      if (!rawName && cols.length > 2 && cols[2].length > 3) {
        rawName = cols[2];
      }

      // If no name found but row has email, try column 2 or 1
      if (!rawName && effEmailIdx !== -1) {
        if (cols[2] && cols[2].length > 2) rawName = cols[2];
        else if (cols[1] && cols[1].length > 2 && !cols[1].match(/^\d+$/)) rawName = cols[1];
      }

      if (!rawName || rawName === 'ชื่อ - นามสกุล' || rawName === 'ชื่อ' || rawName === 'ผู้ปฏิบัติงาน') {
        // Maybe this line is a department header
        if (cols[1] && cols[1].length > 3 && !cols[posIdx] && effEmailIdx === -1) {
          currentDept = cols[1];
          if (currentDept.includes('วิทยาเขต') || currentDept.includes('วิทยาลัยสงฆ์')) {
            currentDeptCategory = 'วิทยาเขต / วิทยาลัยสงฆ์';
          }
        }
        continue;
      }

      let department = (deptIdx !== -1 && cols[deptIdx] && cols[deptIdx].length > 2 && cols[deptIdx] !== rawName) 
        ? cols[deptIdx] 
        : currentDept;

      let departmentCategory = (catIdx !== -1 && cols[catIdx]) ? (cols[catIdx] as SubunitCategory) : currentDeptCategory;
      if (!departmentCategory) {
        if (department.includes('วิทยาเขต') || department.includes('วิทยาลัยสงฆ์')) {
          departmentCategory = 'วิทยาเขต / วิทยาลัยสงฆ์';
        } else if (department.includes('สำนัก') || department.includes('สถาบัน')) {
          departmentCategory = 'สถาบัน / สำนัก';
        } else if (department.includes('สำนักงานอธิการบดี') || department.includes('กอง')) {
          departmentCategory = 'สำนักงานอธิการบดี / ส่วนกลาง';
        } else {
          departmentCategory = currentDeptCategory;
        }
      }

      const position = (posIdx !== -1 && cols[posIdx]) ? cols[posIdx] : 'ผู้ปฏิบัติงาน';
      
      const rawDuties = (primaryDutyIdx !== -1 && cols[primaryDutyIdx]) ? cols[primaryDutyIdx].split(/[,/|;+]/).map(d => d.trim()) : [];
      const primaryDuties: PrimaryDuty[] = [];
      if (rawDuties.some(d => d.includes('การเงิน') || d.includes('เงิน'))) primaryDuties.push('การเงิน');
      if (rawDuties.some(d => d.includes('บัญชี'))) primaryDuties.push('บัญชี');
      if (rawDuties.some(d => d.includes('พัสดุ'))) primaryDuties.push('พัสดุ');
      if (rawDuties.some(d => d.includes('งบประมาณ') || d.includes('แผน'))) primaryDuties.push('งบประมาณ');
      
      // If no duty matched, infer from position or default to การเงิน
      if (primaryDuties.length === 0) {
        if (position.includes('พัสดุ')) primaryDuties.push('พัสดุ');
        else if (position.includes('แผน') || position.includes('งบประมาณ')) primaryDuties.push('งบประมาณ');
        else if (position.includes('บัญชี')) primaryDuties.push('บัญชี');
        else primaryDuties.push('การเงิน');
      }

      const duties = (specificDutyIdx !== -1 && cols[specificDutyIdx]) 
        ? cols[specificDutyIdx].split(/[,/|;]/).map(d => d.trim()) 
        : [`ปฏิบัติงานด้าน${primaryDuties.join(' ')}`];
      
      const dutyDescription = (descIdx !== -1 && cols[descIdx]) ? cols[descIdx] : `รับผิดชอบงาน${primaryDuties.join(' ')} ${department}`;
      
      let educationLevel: EducationLevel = 'ปริญญาตรี';
      const rawEdu = (eduIdx !== -1 && cols[eduIdx]) ? cols[eduIdx] : '';
      if (rawEdu.includes('เอก') || rawEdu.includes('ดร.') || rawEdu.toLowerCase().includes('ph.d')) educationLevel = 'ปริญญาเอก';
      else if (rawEdu.includes('โท') || rawEdu.toLowerCase().includes('m.a') || rawEdu.toLowerCase().includes('mba')) educationLevel = 'ปริญญาโท';
      else if (rawEdu.includes('ตรี') || rawEdu.toLowerCase().includes('b.a')) educationLevel = 'ปริญญาตรี';
      else if (rawEdu.includes('ปวส')) educationLevel = 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)';
      else if (rawEdu.length > 0 && !rawEdu.includes('ตรี')) educationLevel = 'อื่นๆ';

      // Major from col 5 or 6 (e.g. Ph.D. Public Administration)
      let major = (majorIdx !== -1 && cols[majorIdx]) ? cols[majorIdx] : '';
      if (!major && cols[6] && cols[6].length > 2) {
        major = cols[6];
      }
      if (!major) major = 'การเงิน บัญชี และการจัดการ';

      const startDate = effDateIdx !== -1 ? parseDateString(cols[effDateIdx]) : '2020-01-01';
      const email = effEmailIdx !== -1 ? (cols[effEmailIdx] || '').trim() : '';
      const lineId = lineIdx !== -1 ? (cols[lineIdx] || '-').trim() : '-';
      const phone = effPhoneIdx !== -1 ? (cols[effPhoneIdx] || '035-248-000').trim() : '035-248-000';
      const internalPhone = (internalPhoneIdx !== -1 && cols[internalPhoneIdx]) ? cols[internalPhoneIdx].trim() : '';
      
      const rawStatus = (auditStatusIdx !== -1 && cols[auditStatusIdx]) ? cols[auditStatusIdx] : '';
      let auditStatus: 'ปกติ' | 'ควรติดตาม' | 'ต้องการบุคลากรเพิ่ม' = 'ปกติ';
      if (rawStatus === 'ควรติดตาม' || rawStatus === 'ต้องการบุคลากรเพิ่ม') {
        auditStatus = rawStatus;
      } else if (primaryDuties.length >= 3 || (primaryDuties.includes('การเงิน') && primaryDuties.includes('พัสดุ'))) {
        auditStatus = 'ควรติดตาม';
      }

      let gender: 'male' | 'female' | 'monk' | undefined = undefined;
      if (rawName.startsWith('พระ') || rawName.startsWith('สามเณร')) gender = 'monk';
      else if (rawName.startsWith('นางสาว') || rawName.startsWith('นาง')) gender = 'female';
      else if (rawName.startsWith('นาย')) gender = 'male';

      newPersonnel.push({
        id: `import-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        department,
        departmentCategory,
        fullName: rawName || 'ไม่ระบุชื่อ',
        position,
        primaryDuties,
        duties,
        dutyDescription,
        educationLevel,
        major,
        startDate,
        email,
        lineId,
        phone,
        internalPhone,
        auditStatus,
        gender,
        isCertifiedProcurement: primaryDuties.includes('พัสดุ'),
      });
    }

    return newPersonnel;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        if (!buffer || buffer.byteLength === 0) throw new Error('ไฟล์ว่างเปล่า');

        const bytes = new Uint8Array(buffer);
        let text = '';
        let detected = 'UTF-8';

        // Check for UTF-8 BOM
        if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
          text = new TextDecoder('utf-8').decode(bytes);
          detected = 'UTF-8 (BOM)';
        } else {
          // Attempt strict UTF-8 decoding
          try {
            const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
            text = utf8Decoder.decode(bytes);
            detected = 'UTF-8';
          } catch {
            // Windows-874 / CP874 / TIS-620 fallback for Thai Excel CSV files
            try {
              const thaiDecoder = new TextDecoder('windows-874');
              text = thaiDecoder.decode(bytes);
              detected = 'Windows-874 (Thai Excel)';
            } catch {
              text = new TextDecoder('utf-8').decode(bytes);
            }
          }
        }

        setEncodingDetected(detected);

        const newPersonnel = parseCSVLinesToPersonnel(text);
        if (newPersonnel.length === 0) {
          throw new Error('ไม่พบข้อมูลแถวผู้ปฏิบัติงานที่ถูกต้องในไฟล์ กรุณาตรวจสอบหัวตารางและเนื้อหา');
        }

        onImportPersonnel(newPersonnel);
        setImportStatus({
          type: 'success',
          message: `นำเข้าข้อมูลสำเร็จจำนวน ${newPersonnel.length} ท่าน (เข้ารหัส: ${detected})`,
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: `เกิดข้อผิดพลาดในการอ่านไฟล์: ${err.message || 'รูปแบบไม่ถูกต้อง'}`,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleProcessPastedText = () => {
    try {
      if (!pastedCSVText.trim()) {
        throw new Error('กรุณาวางข้อความ CSV ในช่องด้านล่างก่อนกดประมวลผล');
      }

      const newPersonnel = parseCSVLinesToPersonnel(pastedCSVText);
      if (newPersonnel.length === 0) {
        throw new Error('ไม่สามารถประมวลผลข้อมูลได้ กรุณาตรวจสอบรูปแบบข้อความ CSV');
      }

      onImportPersonnel(newPersonnel);
      setImportStatus({
        type: 'success',
        message: `ประมวลผลและนำเข้าข้อมูลสำเร็จ ${newPersonnel.length} รายการ`,
      });
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `ข้อผิดพลาด: ${err.message || 'ไม่สามารถประมวลผลข้อความได้'}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div 
        id="import-export-modal"
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="bg-pink-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <FileSpreadsheet className="w-5 h-5 text-pink-300" />
            <span>นำเข้า / ส่งออก ข้อมูลผู้ปฏิบัติงาน (CSV / Excel)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 font-body text-xs text-slate-700">
          {/* Notification status */}
          {importStatus && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              importStatus.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Section 1: Import CSV / Text */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-pink-700" />
                <span>1. นำข้อมูลชุดใหม่ขึ้นระบบ</span>
              </h3>
              {encodingDetected && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  {encodingDetected}
                </span>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-lg bg-slate-200 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveImportMode('upload')}
                className={`flex-1 py-1.5 px-3 rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeImportMode === 'upload'
                    ? 'bg-white text-pink-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>อัปโหลดไฟล์ .CSV (แนะนำ)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveImportMode('paste')}
                className={`flex-1 py-1.5 px-3 rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeImportMode === 'paste'
                    ? 'bg-white text-pink-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>วางข้อความ CSV (Direct Paste)</span>
              </button>
            </div>

            {hasQuestionMarkWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>ตรวจพบเครื่องหมายคำถาม '?' แทนตัวอักษรภาษาไทยในข้อความ</span>
                </div>
                <p>
                  เกิดจากการคัดลอกไฟล์ภาษาไทยจาก Excel แบบ ANSI/Windows-874 มาวาง ทำให้ข้อความภาษาไทยกลายเป็นเครื่องหมายคำถาม <strong>แนะนำให้อัปโหลดเป็นไฟล์ .CSV โดยตรงที่แท็บ 'อัปโหลดไฟล์ .CSV'</strong> ระบบจะถอดรหัสภาษาไทยของไฟล์ให้ถูกต้องสมบูรณ์ 100%
                </p>
              </div>
            )}

            {activeImportMode === 'upload' ? (
              <div className="space-y-2">
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  รองรับไฟล์ CSV จาก Microsoft Excel หรือ Google Sheets ทั้งรหัสภาษาไทย <strong>Windows-874, TIS-620</strong> และ <strong>UTF-8</strong> (ไม่ต้องกังวลเรื่องภาษาไทยเป็นภาษาต่างดาว)
                </p>
                <div className="pt-1">
                  <label className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-pink-700 hover:bg-pink-800 text-white font-medium cursor-pointer transition shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>เลือกไฟล์ CSV เพื่อนำเข้าข้อมูลทันที</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  คัดลอกข้อความ CSV มาวางในช่องด้านล่าง แล้วกดประมวลผล:
                </p>
                <textarea
                  value={pastedCSVText}
                  onChange={(e) => setPastedCSVText(e.target.value)}
                  placeholder="ลำดับ,ส่วนงาน,ชื่อ - นามสกุล,ตำแหน่ง,การศึกษา,สาขาวิชา,วันบรรจุ,Email,ID Line,เบอร์โทร&#10;1,วิทยาเขตหนองคาย,นายสมชาย ใจดี,นักวิชาการการเงิน,ปริญญาตรี,การบัญชี,10/5/2555,somchai@mcu.ac.th,-,089-xxx-xxxx"
                  rows={5}
                  className="w-full p-2.5 text-[11px] font-mono border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
                <button
                  type="button"
                  onClick={handleProcessPastedText}
                  disabled={!pastedCSVText.trim()}
                  className="w-full py-2 px-4 rounded-lg bg-pink-700 hover:bg-pink-800 disabled:bg-slate-300 text-white font-medium transition cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ประมวลผลข้อความและนำเข้า ({pastedCSVText.split(/\r?\n/).filter(l => l.trim()).length} บรรทัด)</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Download Template & Export */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Download Template */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-900 block">แม่แบบสำหรับเตรียมข้อมูล</span>
              <p className="text-[11px] text-slate-500">
                ดาวน์โหลดไฟล์ตัวอย่างที่มี 10 หัวคอลัมน์มาตรฐาน
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium transition cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>โหลดไฟล์แม่แบบ</span>
              </button>
            </div>

            {/* Export Current Data */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-900 block">ส่งออกข้อมูลในระบบ</span>
              <p className="text-[11px] text-slate-500">
                ดาวน์โหลดข้อมูล {personnelList.length} รายการเป็นไฟล์ Excel CSV (รองรับภาษาไทย)
              </p>
              <button
                type="button"
                onClick={handleExport}
                className="w-full py-2 px-3 rounded-lg bg-pink-700 hover:bg-pink-800 text-white font-medium transition cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ส่งออก CSV</span>
              </button>
            </div>
          </div>

          {/* Section 3: Data Management (Clear Data or Reset) */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">การจัดการข้อมูลในระบบ</span>
              <span className="text-slate-500 font-medium">ปัจจุบันมีข้อมูล: {personnelList.length} ท่าน</span>
            </div>

            {confirmAction === 'clear' ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-fadeIn">
                <p className="text-xs font-semibold text-rose-900">
                  ยืนยันการล้างข้อมูลผู้ปฏิบัติงานทั้งหมด {personnelList.length} ท่าน ใช่หรือไม่?
                </p>
                <p className="text-[11px] text-rose-700 font-body">
                  ข้อมูลจะถูกล้างเพื่อให้ท่านนำเข้าไฟล์ CSV ใหม่ (สามารถกดคืนค่าตัวอย่าง มจร ได้ในภายหลัง)
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onClearAllData) onClearAllData();
                      setConfirmAction(null);
                      setImportStatus({
                        type: 'success',
                        message: 'ล้างข้อมูลเรียบร้อยแล้ว ระบบว่างเปล่าพร้อมสำหรับการนำเข้าไฟล์ CSV ใหม่',
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    ใช่, ล้างข้อมูลทันที
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : confirmAction === 'reset' ? (
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl space-y-2 animate-fadeIn">
                <p className="text-xs font-semibold text-pink-900">
                  ต้องการโหลดชุดข้อมูลสำรวจจริง มจร ({REAL_SURVEY_PERSONNEL.length} ท่าน) หรือไม่?
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onResetToDefault();
                      setConfirmAction(null);
                      setImportStatus({ type: 'success', message: `โหลดชุดข้อมูลสำรวจจริง มจร สำเร็จ (${REAL_SURVEY_PERSONNEL.length} ท่าน)` });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    ยืนยันโหลดข้อมูลสำรวจ
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {onClearAllData && (
                  <button
                    type="button"
                    onClick={() => setConfirmAction('clear')}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>ล้างข้อมูลทั้งหมด (เริ่มจากระบบว่างเปล่า)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setConfirmAction('reset')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-600" />
                  <span>โหลดข้อมูลสำรวจ มจร ({REAL_SURVEY_PERSONNEL.length} ท่าน)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
