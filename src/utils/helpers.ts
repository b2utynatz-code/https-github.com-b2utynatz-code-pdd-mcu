import { Personnel } from '../types';

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

/**
 * Format YYYY-MM-DD to Thai Date (พ.ศ.)
 * Example: '2018-09-15' -> '15 กันยายน 2561'
 */
export function formatThaiDate(dateStr: string, isShort = false): string {
  if (!dateStr) return '-';
  try {
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

    const buddhistYear = year + 543;
    const monthName = isShort ? THAI_MONTHS_SHORT[month] : THAI_MONTHS[month];
    return `${day} ${monthName} ${buddhistYear}`;
  } catch {
    return dateStr;
  }
}

/**
 * Calculate tenure in years and months
 */
export function calculateTenure(startDateStr: string): { years: number; months: number; text: string } {
  if (!startDateStr) return { years: 0, months: 0, text: '-' };
  try {
    const start = new Date(startDateStr);
    const now = new Date();

    if (isNaN(start.getTime())) return { years: 0, months: 0, text: '-' };

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years < 0) return { years: 0, months: 0, text: 'น้อยกว่า 1 เดือน' };

    let text = '';
    if (years > 0 && months > 0) {
      text = `${years} ปี ${months} เดือน`;
    } else if (years > 0) {
      text = `${years} ปี`;
    } else if (months > 0) {
      text = `${months} เดือน`;
    } else {
      text = 'น้อยกว่า 1 เดือน';
    }

    return { years, months, text };
  } catch {
    return { years: 0, months: 0, text: '-' };
  }
}

/**
 * Export personnel data to CSV with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportToCSV(data: Personnel[], filename = 'MCU_Personnel_Audit_Data.csv') {
  const headers = [
    'ลำดับ',
    'ส่วนงาน',
    'หน่วยงานหลัก',
    'ส่วนงานย่อย',
    'ประเภทส่วนงาน',
    'หลักสูตรที่รับผิดชอบ',
    'ระดับการศึกษาที่เปิดสอน',
    'ดูแลหลายหลักสูตร',
    'ชื่อ-นามสกุล',
    'ตำแหน่ง',
    'ภาระหน้าที่หลัก',
    'ภาระหน้าที่เฉพาะ',
    'รายละเอียดภาระหน้าที่',
    'ระดับการศึกษา',
    'สาขาวิชา',
    'วันเริ่มปฏิบัติงาน',
    'อายุงาน',
    'E-mail',
    'ID Line',
    'โทรศัพท์',
    'เบอร์ต่อ',
    'สถานะงานตรวจสอบ'
  ];

  const rows = data.map((p, index) => {
    const tenure = calculateTenure(p.startDate).text;
    const thaiDate = formatThaiDate(p.startDate);
    const primaryDuties = p.primaryDuties.join(', ');
    const specificDuties = (p.duties || []).join(', ');
    const curriculaStr = (p.curricula || []).join('; ');
    const levelsStr = (p.academicLevels || []).join('; ');

    return [
      index + 1,
      `"${p.department.replace(/"/g, '""')}"`,
      `"${(p.parentDepartment || '').replace(/"/g, '""')}"`,
      `"${(p.subDepartment || '').replace(/"/g, '""')}"`,
      `"${p.departmentCategory.replace(/"/g, '""')}"`,
      `"${curriculaStr.replace(/"/g, '""')}"`,
      `"${levelsStr.replace(/"/g, '""')}"`,
      `"${p.isMultiCurriculum ? 'ใช่' : 'ไม่ใช่'}"`,
      `"${p.fullName.replace(/"/g, '""')}"`,
      `"${p.position.replace(/"/g, '""')}"`,
      `"${primaryDuties.replace(/"/g, '""')}"`,
      `"${specificDuties.replace(/"/g, '""')}"`,
      `"${(p.dutyDescription || '').replace(/"/g, '""')}"`,
      `"${p.educationLevel.replace(/"/g, '""')}"`,
      `"${p.major.replace(/"/g, '""')}"`,
      `"${thaiDate}"`,
      `"${tenure}"`,
      `"${p.email}"`,
      `"${p.lineId}"`,
      `"${p.phone}"`,
      `"${p.internalPhone || '-'}"`,
      `"${p.auditStatus || 'ปกติ'}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
