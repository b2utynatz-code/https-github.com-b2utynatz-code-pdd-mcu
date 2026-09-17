// Script to parse the user's uploaded survey CSV text into structured Personnel records
import fs from 'fs';

// Helper to sanitize title prefix and gender
function extractTitleAndGender(fullName) {
  let titlePrefix = '';
  let gender = 'male';

  const clean = fullName.trim();
  if (clean.startsWith('พระครูปลัด')) {
    titlePrefix = 'พระครูปลัด';
    gender = 'monk';
  } else if (clean.startsWith('พระครู')) {
    titlePrefix = 'พระครู';
    gender = 'monk';
  } else if (clean.startsWith('เจ้าอธิการ')) {
    titlePrefix = 'เจ้าอธิการ';
    gender = 'monk';
  } else if (clean.startsWith('พระสมุห์')) {
    titlePrefix = 'พระสมุห์';
    gender = 'monk';
  } else if (clean.startsWith('พระปลัด')) {
    titlePrefix = 'พระปลัด';
    gender = 'monk';
  } else if (clean.startsWith('พระมหา')) {
    titlePrefix = 'พระมหา';
    gender = 'monk';
  } else if (clean.startsWith('พระ')) {
    titlePrefix = 'พระ';
    gender = 'monk';
  } else if (clean.startsWith('นางสาว') || clean.startsWith('น.ส.')) {
    titlePrefix = clean.startsWith('นางสาว') ? 'นางสาว' : 'น.ส.';
    gender = 'female';
  } else if (clean.startsWith('นาง')) {
    titlePrefix = 'นาง';
    gender = 'female';
  } else if (clean.startsWith('ว่าที่ ร.ต.หญิง') || clean.startsWith('ว่าที่ร้อยตรีหญิง')) {
    titlePrefix = 'ว่าที่ ร.ต.หญิง';
    gender = 'female';
  } else if (clean.startsWith('นาย')) {
    titlePrefix = 'นาย';
    gender = 'male';
  } else if (clean.startsWith('ดร.') || clean.startsWith('ผศ.ดร.') || clean.startsWith('รศ.ดร.')) {
    if (clean.includes('หญิง') || clean.includes('วารี') || clean.includes('ศิริประภา') || clean.includes('มณฑกานต์') || clean.includes('กรรณิการ์')) {
      gender = 'female';
    } else {
      gender = 'male';
    }
  }

  return { titlePrefix, gender };
}

// Convert Thai Buddhist year date to ISO string
function parseThaiDateToISO(dateStr) {
  if (!dateStr || !dateStr.trim()) return '2020-01-01';
  let d = dateStr.trim();
  // Thai numerals convert
  const thaiNums = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'];
  thaiNums.forEach((t, i) => {
    d = d.replaceAll(t, String(i));
  });

  // Check text format like "๑ พฤษภาคม ๒๕๕๕"
  const thaiMonths = {
    'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
    'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
    'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
  };
  for (const [mName, mNum] of Object.entries(thaiMonths)) {
    if (d.includes(mName)) {
      const parts = d.split(/\s+/).filter(Boolean);
      const day = parts[0]?.padStart(2, '0') || '01';
      let year = parseInt(parts[2] || '2560', 10);
      if (year > 2400) year -= 543;
      return `${year}-${mNum}-${day}`;
    }
  }

  // format D/M/YYYY or DD/MM/YYYY
  const parts = d.split(/[\/\-\.]/);
  if (parts.length >= 3) {
    const day = parts[0].padStart(2, '0');
    let month = parts[1].padStart(2, '0');
    // Fix typo like 106/2554 -> month 06
    if (month.length === 3 && month.startsWith('10')) month = month.slice(1);
    let year = parseInt(parts[2], 10);
    if (year > 2400) year -= 543;
    if (year < 1950) year = 2020;
    return `${year}-${month.slice(-2)}-${day.slice(-2)}`;
  }
  return '2020-01-01';
}

// Extract primary duties
function extractDuties(dutyText) {
  const primaryDuties = [];
  const duties = [];
  const text = (dutyText || '').toLowerCase();

  if (text.includes('การเงิน') || text.includes('เงินรับ') || text.includes('เงินจ่าย') || text.includes('การเงินรับ') || text.includes('การเงินจ่าย') || text.includes('คลัง') || text.includes('คุมเงิน')) {
    primaryDuties.push('การเงิน');
    if (text.includes('รับ')) duties.push('การเงินรับ');
    if (text.includes('จ่าย') || text.includes('เช็ค')) duties.push('การเงินจ่าย');
    if (!duties.includes('การเงินรับ') && !duties.includes('การเงินจ่าย')) duties.push('การเงินและเบิกจ่าย');
  }

  if (text.includes('บัญชี') || text.includes('ลงรายวัน') || text.includes('ปิดบัญชี')) {
    if (!primaryDuties.includes('บัญชี')) primaryDuties.push('บัญชี');
    duties.push('จัดทำบัญชีและรายงานการเงิน');
  }

  if (text.includes('พัสดุ') || text.includes('จัดซื้อ') || text.includes('ตรวจรับ')) {
    if (!primaryDuties.includes('พัสดุ')) primaryDuties.push('พัสดุ');
    duties.push('จัดซื้อจัดจ้างและบริหารพัสดุ');
  }

  if (text.includes('งบประมาณ') || text.includes('แผน') || text.includes('นโยบาย')) {
    if (!primaryDuties.includes('งบประมาณ')) primaryDuties.push('งบประมาณ');
    duties.push('จัดทำแผนและบริหารงบประมาณ');
  }

  if (primaryDuties.length === 0) {
    primaryDuties.push('การเงิน');
    duties.push(dutyText || 'บริหารงานทั่วไป');
  }

  return { primaryDuties, duties };
}

// Standardize Education Level
function standardizeEduLevel(levelStr) {
  const l = (levelStr || '').trim();
  if (l.includes('เอก') || l.includes('Ph.D.') || l.includes('ปร.ด.') || l.includes('พธ.ด.') || l.includes('ค.ด.')) return 'ปริญญาเอก';
  if (l.includes('โท') || l.includes('มหาบัณฑิต') || l.includes('M.A.') || l.includes('MBA') || l.includes('บช.ม.') || l.includes('บธ.ม.') || l.includes('ร.ม.') || l.includes('ศษ.ม.') || l.includes('รป.ม.') || l.includes('ศศ.ม.')) return 'ปริญญาโท';
  if (l.includes('ตรี') || l.includes('บัณฑิต') || l.includes('B.A.') || l.includes('บช.บ.') || l.includes('บธ.บ.') || l.includes('ทล.บ.') || l.includes('ศศ.บ.') || l.includes('ร.บ.') || l.includes('รป.บ.')) return 'ปริญญาตรี';
  if (l.includes('ปวส') || l.includes('วิชาชีพชั้นสูง')) return 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)';
  return 'ปริญญาตรี';
}

console.log("Helper loaded");
