import fs from 'fs';
import path from 'path';

// Convert Thai numerals to Arabic
function normalizeThaiDigits(str) {
  if (!str) return '';
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  let res = str;
  thaiDigits.forEach((d, i) => {
    res = res.replaceAll(d, String(i));
  });
  return res;
}

// Extract Title & Gender
function getTitleAndGender(fullName) {
  const clean = fullName.trim();
  let titlePrefix = '';
  let gender = 'male';

  const monkPrefixes = ['พระครูปลัด', 'พระครูกัลยาณปริยัติบัณฑิต', 'พระครูสมุห์', 'พระครู', 'เจ้าอธิการ', 'พระสมุห์', 'พระปลัด', 'พระมหา', 'พระ'];
  for (const mp of monkPrefixes) {
    if (clean.startsWith(mp)) {
      return { titlePrefix: mp, gender: 'monk' };
    }
  }

  if (clean.startsWith('นางสาว')) return { titlePrefix: 'นางสาว', gender: 'female' };
  if (clean.startsWith('น.ส.')) return { titlePrefix: 'น.ส.', gender: 'female' };
  if (clean.startsWith('นาง')) return { titlePrefix: 'นาง', gender: 'female' };
  if (clean.startsWith('ว่าที่ ร.ต.หญิง') || clean.startsWith('ว่าที่ร้อยตรีหญิง')) return { titlePrefix: 'ว่าที่ ร.ต.หญิง', gender: 'female' };
  if (clean.startsWith('นาย')) return { titlePrefix: 'นาย', gender: 'male' };
  if (clean.startsWith('ดร.') || clean.startsWith('ผศ.ดร.')) {
    titlePrefix = clean.startsWith('ผศ.ดร.') ? 'ผศ.ดร.' : 'ดร.';
    if (clean.includes('ศิริประภา') || clean.includes('วารี') || clean.includes('มณฑกานต์') || clean.includes('กรรณิการ์') || clean.includes('สุพิชฌาย์')) {
      gender = 'female';
    } else {
      gender = 'male';
    }
    return { titlePrefix, gender };
  }

  return { titlePrefix, gender };
}

// Convert Date to ISO YYYY-MM-DD
function parseThaiDate(dateStr) {
  if (!dateStr || !dateStr.trim()) return '2019-10-01';
  let s = normalizeThaiDigits(dateStr.trim());

  const thaiMonths = {
    'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
    'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
    'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
  };

  for (const [mName, mNum] of Object.entries(thaiMonths)) {
    if (s.includes(mName)) {
      const parts = s.split(/\s+/).filter(Boolean);
      const day = parts[0]?.padStart(2, '0') || '01';
      let year = parseInt(parts[2] || '2560', 10);
      if (year > 2400) year -= 543;
      return `${year}-${mNum}-${day}`;
    }
  }

  // formats like 10/5/2548 or 1/12/2016
  const parts = s.split(/[\/\-\.]/);
  if (parts.length >= 3) {
    let day = parts[0].trim().padStart(2, '0');
    let month = parts[1].trim();
    if (month.length === 3 && month.startsWith('10')) month = month.slice(1);
    month = month.padStart(2, '0');
    let year = parseInt(parts[2].trim(), 10);
    if (year > 2400) year -= 543;
    if (year < 1950) year = 2018;
    return `${year}-${month}-${day}`;
  }

  return '2020-01-01';
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

// Analyze Primary Duties and Detailed Duties
function analyzeDuties(dutyText, positionText) {
  const t = `${dutyText || ''} ${positionText || ''}`.toLowerCase();
  const primaryDuties = [];
  const duties = [];

  const hasFinance = t.includes('การเงิน') || t.includes('เงินรับ') || t.includes('เงินจ่าย') || t.includes('คลัง') || t.includes('คุมเงิน') || t.includes('สดย่อย') || t.includes('เช็ค') || t.includes('รับ-จ่ายเงิน');
  const hasAccount = t.includes('บัญชี') || t.includes('ปิดบัญชี') || t.includes('ลงรายวัน') || t.includes('บันทึกบัญชี');
  const hasParcel = t.includes('พัสดุ') || t.includes('จัดซื้อ') || t.includes('ตรวจรับ');
  const hasBudget = t.includes('งบประมาณ') || t.includes('แผน') || t.includes('นโยบาย') || t.includes('แผนปฏิบัติการ');

  if (hasFinance) primaryDuties.push('การเงิน');
  if (hasAccount) primaryDuties.push('บัญชี');
  if (hasParcel) primaryDuties.push('พัสดุ');
  if (hasBudget) primaryDuties.push('งบประมาณ');

  if (primaryDuties.length === 0) {
    primaryDuties.push('การเงิน');
  }

  // Detailed duty labels
  if (t.includes('รับ') && (t.includes('เงิน') || t.includes('การเงิน') || t.includes('รายรับ'))) duties.push('การเงินรับ');
  if (t.includes('จ่าย') && (t.includes('เงิน') || t.includes('การเงิน') || t.includes('เช็ค') || t.includes('รายจ่าย'))) duties.push('การเงินจ่าย');
  if (hasFinance && !duties.includes('การเงินรับ') && !duties.includes('การเงินจ่าย')) duties.push('งานการเงินและเบิกจ่าย');
  if (hasAccount) duties.push('งานบัญชีและทะเบียนคุม');
  if (hasParcel) duties.push('งานจัดซื้อจัดจ้างและบริหารพัสดุ');
  if (hasBudget) duties.push('งานแผนงานและงบประมาณ');

  return { primaryDuties, duties: duties.length ? duties : [dutyText || 'งานบริหารทั่วไป'] };
}

// Standardize Education Level
function standardizeEducationLevel(levelStr, majorStr) {
  const str = `${levelStr || ''} ${majorStr || ''}`.trim();
  if (str.includes('เอก') || str.includes('ดุษฎี') || str.includes('Ph.D.') || str.includes('ปร.ด.') || str.includes('พธ.ด.') || str.includes('ค.ด.')) return 'ปริญญาเอก';
  if (str.includes('โท') || str.includes('มหาบัณฑิต') || str.includes('M.A.') || str.includes('MBA') || str.includes('บช.ม.') || str.includes('บธ.ม.') || str.includes('ร.ม.') || str.includes('ศษ.ม.') || str.includes('รป.ม.') || str.includes('ศศ.ม.')) return 'ปริญญาโท';
  if (str.includes('ปวส') || str.includes('ประกาศนียบัตรวิชาชีพชั้นสูง')) return 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)';
  if (str.includes('ตรี') || str.includes('บัณฑิต') || str.includes('B.A.') || str.includes('บช.บ.') || str.includes('บธ.บ.') || str.includes('ทล.บ.') || str.includes('ศศ.บ.') || str.includes('ร.บ.') || str.includes('รป.บ.') || str.includes('วท.บ.')) return 'ปริญญาตรี';
  return 'ปริญญาตรี';
}

function run() {
  const csvPath = path.resolve('data/survey_2569.csv');
  const fileData = fs.readFileSync(csvPath, 'utf-8');
  const lines = fileData.split('\n');

  let currentSection = 'วิทยาเขต';
  let currentCategory = 'วิทยาเขต / วิทยาลัยสงฆ์';
  let currentDept = '';
  let currentCurriculum = '';

  const rawRecords = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Detect section header
    if (rawLine.includes('ส่วนงาน :')) {
      const secMatch = rawLine.match(/ส่วนงาน\s*:\s*([^,]+)/);
      if (secMatch) {
        currentSection = secMatch[1].trim();
        if (currentSection.includes('วิทยาเขต') || currentSection.includes('วิทยาลัยสงฆ์') || currentSection.includes('หน่วยวิทยบริการ')) {
          currentCategory = 'วิทยาเขต / วิทยาลัยสงฆ์';
        } else if (currentSection.includes('รัฐวิสาหกิจ')) {
          currentCategory = 'สำนักงานอธิการบดี / ส่วนกลาง';
        } else {
          currentCategory = 'คณะ / บัณฑิตวิทยาลัย';
        }
      }
      currentDept = '';
      currentCurriculum = '';
      continue;
    }

    // Skip table titles and column headers
    if (rawLine.includes('ตารางสำรวจ') || rawLine.includes('สำนักงานตรวจสอบ') || rawLine.includes('ลำดับที่') || rawLine.includes('ระดับการศึกษา,สาขาวิชา')) {
      continue;
    }

    const cols = parseCSVLine(rawLine);
    if (cols.length < 3) continue;

    const col0 = cols[0]?.trim(); // index or empty
    const col1 = cols[1]?.trim(); // dept or curriculum
    const col2 = cols[2]?.trim(); // full name
    const col3 = cols[3]?.trim(); // position
    const col4 = cols[4]?.trim(); // duties
    const col5 = cols[5]?.trim(); // edu level
    const col6 = cols[6]?.trim(); // major
    const col7 = cols[7]?.trim(); // start date
    const col8 = cols[8]?.trim(); // email
    const col9 = cols[9]?.trim(); // lineId
    const col10 = cols[10]?.trim(); // phone

    // Update department / curriculum
    if (col1) {
      if (currentSection.includes('คณะ') || currentSection.includes('บัณฑิตวิทยาลัย') || currentSection.includes('วิทยาลัยพุทธศาสตร์นานาชาติ')) {
        currentDept = currentSection;
        currentCurriculum = col1;
      } else {
        currentDept = col1;
        currentCurriculum = '';
      }
    }

    // Check if col2 has a person name (not empty, doesn't look like a curriculum header)
    if (!col2 || col2.startsWith('ระดับ') || col2.startsWith('หลักสูตร') || col2.startsWith('พธ.ม.') || col2.startsWith('พธ.ด.') || col2.startsWith('ค.บ.') || col2.startsWith('ค.ม.')) {
      if (col1 && (col1.startsWith('หลักสูตร') || col1.startsWith('ค.บ.') || col1.startsWith('ค.ม.') || col1.startsWith('พธ.ม.') || col1.startsWith('พธ.ด.') || col1.startsWith('B.A.') || col1.startsWith('M.A.') || col1.startsWith('Ph.D.'))) {
        currentCurriculum = col1;
      }
      continue;
    }

    // We have a person!
    const fullName = col2.replace(/^\d+\.\s*/, '').trim();
    if (!fullName || fullName.length < 3) continue;

    rawRecords.push({
      section: currentSection,
      category: currentCategory,
      dept: currentDept || currentSection,
      curriculum: currentCurriculum,
      fullName,
      position: col3 || 'เจ้าหน้าที่ผู้ปฏิบัติงาน',
      dutyText: col4 || '',
      eduLevel: col5 || '',
      major: col6 || '',
      startDateStr: col7 || '',
      email: col8 || '',
      lineId: col9 || '',
      phone: col10 || ''
    });
  }

  // Deduplicate and merge multiple curricula for same person in same department
  const personMap = new Map();

  rawRecords.forEach((rec, idx) => {
    // Unique key: fullName + dept
    const key = `${rec.fullName}::${rec.dept}`;
    const existing = personMap.get(key);

    const { primaryDuties, duties } = analyzeDuties(rec.dutyText, rec.position);
    const eduLevel = standardizeEducationLevel(rec.eduLevel, rec.major);
    const { titlePrefix, gender } = getTitleAndGender(rec.fullName);
    const startDate = parseThaiDate(rec.startDateStr);

    let academicLevel = '';
    if (rec.curriculum) {
      if (rec.curriculum.includes('เอก') || rec.curriculum.includes('Ph.D.') || rec.curriculum.includes('ดุษฎี') || rec.curriculum.includes('ปร.ด.') || rec.curriculum.includes('พธ.ด.') || rec.curriculum.includes('ค.ด.')) academicLevel = 'ปริญญาเอก';
      else if (rec.curriculum.includes('โท') || rec.curriculum.includes('มหาบัณฑิต') || rec.curriculum.includes('M.A.') || rec.curriculum.includes('พธ.ม.') || rec.curriculum.includes('ค.ม.') || rec.curriculum.includes('ศศ.ม.')) academicLevel = 'ปริญญาโท';
      else if (rec.curriculum.includes('บัณฑิต') || rec.curriculum.includes('ค.บ.') || rec.curriculum.includes('B.A.') || rec.curriculum.includes('ศศ.บ.') || rec.curriculum.includes('ตรี')) academicLevel = 'ปริญญาตรี';
      else if (rec.curriculum.includes('ประกาศนียบัตร') || rec.curriculum.includes('ป.บัณฑิต') || rec.curriculum.includes('ป.อค.') || rec.curriculum.includes('ป.ทศ.')) academicLevel = 'ประกาศนียบัตร / ป.บัณฑิต';
    }

    if (!existing) {
      personMap.set(key, {
        id: `p-${String(idx + 1).padStart(3, '0')}`,
        department: rec.dept,
        departmentCategory: rec.category,
        fullName: rec.fullName,
        titlePrefix,
        position: rec.position,
        primaryDuties,
        duties,
        dutyDescription: rec.dutyText ? `รับผิดชอบงาน${rec.dutyText}` : `ปฏิบัติหน้าที่ ณ ${rec.dept}`,
        educationLevel: eduLevel,
        major: rec.major || 'การบริหารจัดการทั่วไป',
        startDate,
        email: rec.email || `${rec.fullName.replace(/\s+/g, '.')}@mcu.ac.th`,
        lineId: rec.lineId || '-',
        phone: normalizeThaiDigits(rec.phone) || '-',
        parentDepartment: rec.dept,
        subDepartment: rec.curriculum || '',
        curricula: rec.curriculum ? [rec.curriculum] : [],
        academicLevels: academicLevel ? [academicLevel] : [],
        gender,
        isCertifiedProcurement: primaryDuties.includes('พัสดุ'),
      });
    } else {
      // Merge curricula
      if (rec.curriculum && !existing.curricula.includes(rec.curriculum)) {
        existing.curricula.push(rec.curriculum);
      }
      if (academicLevel && !existing.academicLevels.includes(academicLevel)) {
        existing.academicLevels.push(academicLevel);
      }
      // Merge duties
      primaryDuties.forEach(pd => {
        if (!existing.primaryDuties.includes(pd)) existing.primaryDuties.push(pd);
      });
      duties.forEach(d => {
        if (!existing.duties.includes(d)) existing.duties.push(d);
      });
      // Prefer non-empty contact info
      if (!existing.email && rec.email) existing.email = rec.email;
      if ((!existing.phone || existing.phone === '-') && rec.phone) existing.phone = normalizeThaiDigits(rec.phone);
      if ((!existing.lineId || existing.lineId === '-') && rec.lineId) existing.lineId = rec.lineId;
    }
  });

  const finalPersonnel = Array.from(personMap.values()).map((p, index) => {
    p.id = `mcu-audit-p${String(index + 1).padStart(3, '0')}`;
    p.isMultiCurriculum = p.curricula.length > 1;

    // Assess Audit Status & SoD Risks
    const hasReceive = p.duties.some(d => d.includes('การเงินรับ'));
    const hasDisburse = p.duties.some(d => d.includes('การเงินจ่าย') || d.includes('เช็ค') || d.includes('สดย่อย'));
    const hasBothFinance = hasReceive && hasDisburse;
    const isMultiDuty = p.primaryDuties.length >= 3;

    if (hasBothFinance) {
      p.auditStatus = 'ควรติดตาม';
      p.auditNotes = 'ปฏิบัติหน้าที่ทั้งการเงินรับและการเงินจ่ายร่วมกัน (ขัดหลักการแบ่งแยกหน้าที่ SoD ควรกำกับดูแลเป็นพิเศษ)';
    } else if (isMultiDuty) {
      p.auditStatus = 'ควรติดตาม';
      p.auditNotes = `ปฏิบัติหน้าที่ควบ ${p.primaryDuties.length} ด้าน (${p.primaryDuties.join(', ')}) และมีภาระงานค่อนข้างสูง`;
    } else if (p.isMultiCurriculum) {
      p.auditStatus = 'ควรติดตาม';
      p.auditNotes = `รับผิดชอบดูแลงานด้านการเงิน/พัสดุควบ ${p.curricula.length} หลักสูตรพร้อมกัน`;
    } else {
      p.auditStatus = 'ปกติ';
      p.auditNotes = 'โครงสร้างการแบ่งแยกหน้าที่และภาระงานเป็นไปตามมาตรฐานการควบคุมภายใน';
    }

    return p;
  });

  console.log(`Successfully processed ${finalPersonnel.length} personnel records!`);
  
  // Write output
  const fileContent = `import { Personnel } from '../types';

/**
 * ฐานข้อมูลผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ มจร ประจำปีงบประมาณ พ.ศ. 2569
 * ประมวลผลจากข้อมูลสำรวจจริงของหน่วยตรวจสอบภายใน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย
 * ครอบคลุม: วิทยาเขต, วิทยาลัยสงฆ์, หน่วยวิทยบริการ, รัฐวิสาหกิจ, คณะ และ บัณฑิตวิทยาลัย
 * จำนวนรวมทั้งสิ้น: ${finalPersonnel.length} รายการ
 */
export const REAL_SURVEY_PERSONNEL: Personnel[] = ${JSON.stringify(finalPersonnel, null, 2)};
`;

  fs.writeFileSync('src/data/surveyData.ts', fileContent, 'utf-8');
  console.log('Saved to src/data/surveyData.ts');
}

run();
