import { Personnel, PrimaryDuty } from '../types';
import { calculateTenure } from './helpers';
import { evaluatePersonnelAlignment } from './educationAlignment';

export interface WorkingPaperRow {
  index: number;
  personId: string;
  department: string;
  departmentCategory: string;
  fullName: string;
  position: string;
  primaryDutiesText: string; // ระบุเฉพาะ: การเงิน, บัญชี, พัสดุ, หรือ งบประมาณ
  primaryDutiesList: PrimaryDuty[];
  tenureText: string;
  tenureYears: number;
  isNewStaff: boolean;
  educationText: string; // ระดับวุฒิ และ สาขาวิชา
  educationLevel: string;
  major: string;
  trainingText: string; // การอบรมเพิ่มเติมที่เกี่ยวข้อง
  hasTraining: boolean;
  auditRemarks: string; // หมายเหตุ (การวิเคราะห์ของผู้ตรวจสอบภายใน)
  riskLevel: 'วิกฤต' | 'สูง' | 'ปานกลาง' | 'ปกติ';
  riskScore: number; // For sorting
  isSodConflict: boolean;
  isMultiCurriculum: boolean;
  recommendedCourse: string;
}

/**
 * Generate Audit Working Paper Analysis for Personnel
 */
export function generateWorkingPaperRows(personnelList: Personnel[]): WorkingPaperRow[] {
  return personnelList.map((person, idx) => {
    const tenureInfo = calculateTenure(person.startDate);
    const tenureYears = tenureInfo.years;
    const isNewStaff = tenureYears < 2 || tenureInfo.text.includes('เดือน') || tenureInfo.text.includes('เพิ่งเริ่ม');

    // หน้าที่หลัก: ระบุเฉพาะ การเงิน, บัญชี, พัสดุ, หรืองบประมาณ
    const primaryDuties: PrimaryDuty[] = person.primaryDuties && person.primaryDuties.length > 0
      ? person.primaryDuties
      : ['การเงิน'];
    const primaryDutiesText = primaryDuties.join(', ');

    // อายุงาน text: แสดงเฉพาะจำนวนอายุงาน เช่น "X ปี Y เดือน", "X ปี", หรือ "Y เดือน" (ไม่ใส่คำว่าบรรจุใหม่)
    const tenureText = tenureInfo.text;

    // การศึกษา
    const educationText = `${person.educationLevel} (${person.major || 'ไม่ระบุสาขา'})`;

    // การอบรมเพิ่มเติมที่เกี่ยวข้อง
    const hasTraining = Boolean(person.isCertifiedProcurement);
    const trainingText = hasTraining
      ? 'ผ่านการอบรม พ.ร.บ. การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560 (มี Certificate กรมบัญชีกลาง)'
      : 'ไม่มีข้อมูลการเข้ารับการอบรม';

    // การประเมินความสอดคล้องของวุฒิ
    const alignment = evaluatePersonnelAlignment(person);

    // ตรวจสอบการขัดหลักการแบ่งแยกหน้าที่ (SoD Conflict)
    const dutiesList = person.duties || [];
    const hasCashIn = dutiesList.some(d => d.includes('รับ'));
    const hasCashOut = dutiesList.some(d => d.includes('จ่าย') || d.includes('เบิก'));
    const hasSupplies = primaryDuties.includes('พัสดุ');
    const hasAccounting = primaryDuties.includes('บัญชี');
    const hasFinance = primaryDuties.includes('การเงิน');
    const hasBudget = primaryDuties.includes('งบประมาณ');

    const hasCashInOutConflict = hasCashIn && hasCashOut;
    const hasTotalSodConflict = primaryDuties.length >= 3;
    const hasProcurementAndFinanceConflict = hasSupplies && (hasFinance || hasAccounting);

    const isSodConflict = hasCashInOutConflict || hasTotalSodConflict || hasProcurementAndFinanceConflict;

    // การวิเคราะห์และข้อเสนอแนะของผู้ตรวจสอบภายใน (Audit Remarks)
    let riskLevel: 'วิกฤต' | 'สูง' | 'ปานกลาง' | 'ปกติ' = 'ปกติ';
    let riskScore = 1;
    let remarks = '';
    let recommendedCourse = '';

    if (hasTraining) {
      // กรณีมีข้อมูลการอบรม: ระบุว่าความรู้ความสามารถสอดคล้องกับหน้าที่หรือไม่ หรือควรต่อยอดทักษะด้านใด
      if (hasSupplies && primaryDuties.length === 1) {
        riskLevel = 'ปกติ';
        riskScore = 1;
        recommendedCourse = 'หลักสูตรการบริหารสัญญา การควบคุมงานจ้าง และการจัดทำราคากลางงานก่อสร้างขั้นสูง (Advanced e-GP)';
        remarks = `[สอดคล้องกับหน้าที่โดยตรง] บุคลากรผ่านการอบรมกฎหมายจัดซื้อจัดจ้างฯ มี Certificate กรมบัญชีกลาง มีความรู้ความสามารถตรงกับภาระงานพัสดุที่รับผิดชอบ ควรส่งเสริมต่อยอดทักษะด้าน "${recommendedCourse}" และพัฒนาเป็นพี่เลี้ยง (Mentor) ถ่ายทอดความรู้ภายในส่วนงาน`;
      } else if (hasSupplies && (hasFinance || hasAccounting)) {
        riskLevel = 'สูง';
        riskScore = 3;
        recommendedCourse = 'หลักสูตรระบบการควบคุมภายในและการบริหารความเสี่ยงด้านการเงินการพัสดุสำหรับสถาบันอุดมศึกษา';
        remarks = `[สอดคล้องบางส่วน - ควรระวัง SoD] มีความรู้ด้านพัสดุจาก Certificate แต่ปฏิบัติหน้าที่ควบงานการเงิน/บัญชี จึงมีความเสี่ยงด้านการควบคุมภายใน ควรต่อยอดทักษะด้าน "${recommendedCourse}" และเสนอให้ส่วนงานจัดแบ่งหน้าที่พัสดุและการเงินออกจากกัน`;
      } else {
        riskLevel = 'ปานกลาง';
        riskScore = 2;
        recommendedCourse = 'หลักสูตรมาตรฐานการบัญชีภาครัฐและการรายงานทางการเงินระบบ New GFMIS Thai';
        remarks = `[สอดคล้องบางส่วน] มีพื้นฐานการอบรมพัสดุ แต่ควรเสริมองค์ความรู้ในภาระหน้าที่หลักด้านอื่นเพิ่มเติมอย่างต่อเนื่อง โดยเฉพาะ "${recommendedCourse}"`;
      }
    } else {
      // กรณี "ไม่มีข้อมูลการเข้ารับการอบรม": ประเมินความเสี่ยงและระบุหลักสูตรเร่งด่วน/จำเป็นพร้อมเหตุผล
      if (hasTotalSodConflict) {
        // ควบ 3-4 ด้าน
        riskLevel = 'วิกฤต';
        riskScore = 4;
        recommendedCourse = 'หลักสูตรการควบคุมภายในและการประเมินการควบคุมด้วยตนเอง (Control Self-Assessment: CSA) และการบริหารความเสี่ยงทางการเงินการพัสดุ';
        remarks = `[ความเสี่ยงวิกฤต - ปฏิบัติงานควบ ${primaryDutiesText} รวม ${primaryDuties.length} ด้าน] บุคลากรต้องรับผิดชอบหลายกระบวนการเสี่ยงสูงในคนเดียว และไม่มีประวัติการอบรม จึงเสี่ยงต่อข้อผิดพลาดและการขาดการสอบยันยอด ควรเข้ารับการอบรมเร่งด่วนที่สุด: "${recommendedCourse}" ทั้งนี้ ผู้บริหารส่วนงานควรจัดกลไกการสอบทานข้ามสายงาน (Compensating Control) ทดแทน`;
      } else if (hasCashInOutConflict) {
        // เงินรับ + เงินจ่าย
        riskLevel = 'สูง';
        riskScore = 3.8;
        recommendedCourse = 'หลักสูตรระเบียบการเงินการคลัง มจร การควบคุมเงินสดในมือ และการแบ่งแยกหน้าที่เพื่อป้องกันข้อผิดพลาดและการทุจริต';
        remarks = `[ความเสี่ยงสูง - ขัดหลักการแบ่งแยกหน้าที่ (SoD: เงินรับคู่เงินจ่าย)] ปฏิบัติหน้าที่ทั้งการรับเงินและการเบิกจ่ายเงินร่วมกัน เสี่ยงต่อการตรวจยันยอดเงินไม่ครบถ้วนและไม่มีบันทึกการอบรม ควรเข้ารับการอบรมเร่งด่วน: "${recommendedCourse}" พร้อมจัดทำทะเบียนคุมและกระทบยอดเงินฝากธนาคารทุกสิ้นเดือน`;
      } else if (person.isMultiCurriculum) {
        // ควบหลายหลักสูตร
        riskLevel = 'สูง';
        riskScore = 3.5;
        recommendedCourse = 'หลักสูตรการบริหารงบประมาณรายหลักสูตร การคำนวณต้นทุนต่อหน่วยผลผลิต (Unit Cost) และการบริหารสัญญาพัสดุเพื่องานวิจัย';
        remarks = `[ความเสี่ยงสูง - แบกรับภาระงานควบหลายหลักสูตร] ต้องดูแลงานการเงินและพัสดุควบตั้งแต่ 4–8 หลักสูตร ปริมาณเอกสารสูง เสี่ยงต่อการเบิกจ่ายข้ามงบประมาณหรือล่าช้า ควรเข้ารับการอบรมเร่งด่วน: "${recommendedCourse}" เพื่อเพิ่มประสิทธิภาพและลดความผิดพลาดจากภาระงานล้นมือ`;
      } else if (isNewStaff && alignment.level === 'non_aligned') {
        // บรรจุใหม่ + วุฒิไม่ตรงสาย
        riskLevel = 'สูง';
        riskScore = 3.7;
        if (hasSupplies) {
          recommendedCourse = 'หลักสูตรระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560 และการจัดทำราคากลาง e-GP (ภาคบังคับ)';
          remarks = `[ความเสี่ยงสูง - บรรจุใหม่ (${tenureText}) & วุฒิไม่ตรงสาย (${person.educationLevel} ${person.major})] รับผิดชอบงานพัสดุซึ่งมีระเบียบและข้อกฎหมายเคร่งครัด แต่ไม่มีพื้นฐานตรงและยังไม่ได้รับการอบรม เสี่ยงต่อการจัดทำสัญญาและตรวจรับผิดระเบียบ ต้องส่งเข้ารับการอบรมเร่งด่วน: "${recommendedCourse}"`;
        } else if (hasAccounting || hasFinance) {
          recommendedCourse = 'หลักสูตรมาตรฐานการบัญชีภาครัฐ ระเบียบการรับ-จ่ายเงิน มจร และระบบสารสนเทศบัญชีมหาวิทยาลัย (MIS-Finance)';
          remarks = `[ความเสี่ยงสูง - บรรจุใหม่ (${tenureText}) & วุฒิไม่ตรงสาย (${person.educationLevel} ${person.major})] ปฏิบัติงานด้านการเงิน/บัญชีโดยไม่มีพื้นฐานวิชาชีพบัญชีและไม่มีประวัติการอบรม เสี่ยงต่องบการเงินคลาดเคลื่อน ต้องส่งเข้ารับการอบรมเร่งด่วน: "${recommendedCourse}"`;
        } else {
          recommendedCourse = 'หลักสูตรการวางแผนงบประมาณเชิงยุทธศาสตร์และการติดตามประเมินผลโครงการ มจร';
          remarks = `[ความเสี่ยงสูง - บรรจุใหม่ & วุฒิไม่ตรงสาย] ควรส่งเข้ารับการอบรมเร่งด่วน: "${recommendedCourse}" เพื่อสร้างความเข้าใจในระบบงบประมาณมหาวิทยาลัย`;
        }
      } else if (isNewStaff) {
        // บรรจุใหม่ แม้วุฒิตรงสาย
        riskLevel = 'ปานกลาง';
        riskScore = 2.5;
        if (hasSupplies) {
          recommendedCourse = 'หลักสูตรฝึกอบรมเพื่อขอรับหนังสือรับรองความรู้ความชำนาญการจัดซื้อจัดจ้างภาครัฐ (Certificate) กรมบัญชีกลาง';
          remarks = `[ความเสี่ยงปานกลาง - บุคลากรบรรจุใหม่ (${tenureText})] แม้มีพื้นฐานการศึกษา แต่เพิ่งเริ่มปฏิบัติงานและยังไม่มีข้อมูลการอบรม ควรเข้ารับการอบรมเร่งด่วน: "${recommendedCourse}" เพื่อให้มีคุณสมบัติครบถ้วนตามเกณฑ์มาตรฐาน`;
        } else {
          recommendedCourse = 'หลักสูตรข้อบังคับการเงินและทรัพย์สิน มจร และแนวปฏิบัติการตรวจสอบเอกสารเบิกจ่าย';
          remarks = `[ความเสี่ยงปานกลาง - บุคลากรบรรจุใหม่ (${tenureText})] วุฒิการศึกษาเอื้อต่อการทำงาน แต่ยังขาดประสบการณ์ภาคปฏิบัติในสถาบันอุดมศึกษา ควรเข้ารับการอบรมจำเป็น: "${recommendedCourse}"`;
        }
      } else if (alignment.level === 'non_aligned') {
        // วุฒิไม่ตรงสาย แม้อายุงานนาน
        riskLevel = 'ปานกลาง';
        riskScore = 2.8;
        if (hasSupplies) {
          recommendedCourse = 'หลักสูตรทบทวนแนววินิจฉัยและข้อหารือของคณะกรรมการวินิจฉัยปัญหาการจัดซื้อจัดจ้าง (กวจ.) และข้อสังเกตจาก สตง.';
          remarks = `[ความเสี่ยงปานกลาง - วุฒิไม่ตรงสายงานพัสดุ (${person.major})] ปฏิบัติงานด้วยประสบการณ์เดิม (${tenureText}) แต่ไม่มีประวัติการอบรมหลักสูตรมาตรฐาน เสี่ยงต่อการใช้ระเบียบเก่า ควรเข้ารับการอบรมจำเป็น: "${recommendedCourse}"`;
        } else if (hasAccounting) {
          recommendedCourse = 'หลักสูตรมาตรฐานการบัญชีภาครัฐและนโยบายการบัญชีสำหรับหน่วยงานในกำกับของรัฐ';
          remarks = `[ความเสี่ยงปานกลาง - วุฒิไม่ตรงสายงานบัญชี (${person.major})] ปฏิบัติงานบัญชีโดยไม่มีวุฒิบัญชีบัณฑิตและไม่มีข้อมูลการอบรม ควรเข้ารับการอบรมจำเป็น: "${recommendedCourse}" เพื่อความถูกต้องในการจัดทำงบการเงิน`;
        } else {
          recommendedCourse = 'หลักสูตรการบริหารการเงินการคลังและการควบคุมภายในสำหรับผู้ปฏิบัติงาน';
          remarks = `[ความเสี่ยงปานกลาง - ควร Up-skill] สำเร็จการศึกษาสาขา ${person.major} ปฏิบัติหน้าที่ ${primaryDutiesText} ควรเข้ารับการอบรมจำเป็น: "${recommendedCourse}"`;
        }
      } else {
        // วุฒิตรงสายและมีประสบการณ์
        riskLevel = 'ปกติ';
        riskScore = 1.5;
        if (hasSupplies) {
          recommendedCourse = 'หลักสูตรการบริหารสัญญาและการจัดซื้อจัดจ้างที่เป็นมิตรกับสิ่งแวดล้อม (Green Procurement)';
          remarks = `[ความเสี่ยงต่ำ - วุฒิตรงสายงาน] มีวุฒิสอดคล้องกับงานพัสดุและมีอายุงาน ${tenureText} แม้ไม่พบประวัติอบรมในระบบ แต่มีสมรรถนะพื้นฐานดี ควรเข้ารับการอบรมเพื่อพัฒนาทักษะขั้นสูง: "${recommendedCourse}"`;
        } else if (hasAccounting || hasFinance) {
          recommendedCourse = 'หลักสูตรการวิเคราะห์รายงานทางการเงินเพื่อการตัดสินใจเชิงบริหารและระบบตรวจสอบเอกสารอิเล็กทรอนิกส์';
          remarks = `[ความเสี่ยงต่ำ - วุฒิตรงสายงาน] สำเร็จการศึกษาสาขาวิชาตรงกับงาน (${person.major}) มีอายุงาน ${tenureText} ควรเข้ารับการอบรมพัฒนาทักษะเพิ่มเติม: "${recommendedCourse}" เพื่อเตรียมรองรับระบบดิจิทัล`;
        } else {
          recommendedCourse = 'หลักสูตรการวางแผนงบประมาณเชิงกลยุทธ์และการบริหารผลงาน (Strategic Budgeting & OKRs)';
          remarks = `[ความเสี่ยงต่ำ - ควร Up-skill] วุฒิการศึกษาและอายุงานสอดคล้องกับงานงบประมาณ ควรเข้ารับการอบรมต่อยอด: "${recommendedCourse}"`;
        }
      }
    }

    return {
      index: idx + 1,
      personId: person.id,
      department: person.department,
      departmentCategory: person.departmentCategory,
      fullName: person.fullName,
      position: person.position,
      primaryDutiesText,
      primaryDutiesList: primaryDuties,
      tenureText,
      tenureYears,
      isNewStaff,
      educationText,
      educationLevel: person.educationLevel,
      major: person.major,
      trainingText,
      hasTraining,
      auditRemarks: remarks,
      riskLevel,
      riskScore,
      isSodConflict,
      isMultiCurriculum: Boolean(person.isMultiCurriculum),
      recommendedCourse,
    };
  });
}

/**
 * Export working paper rows to CSV format
 */
export function exportWorkingPaperToCSV(rows: WorkingPaperRow[], filename = 'Audit_Working_Paper_MCU_2569.csv') {
  const headers = [
    'ลำดับที่',
    'ชื่อส่วนงาน',
    'ตำแหน่ง',
    'หน้าที่หลัก',
    'อายุงาน',
    'การศึกษา',
    'การอบรมเพิ่มเติมที่เกี่ยวข้อง',
    'หมายเหตุ (การวิเคราะห์ของผู้ตรวจสอบภายใน)'
  ];

  const csvData = rows.map(r => [
    r.index,
    `"${r.department.replace(/"/g, '""')}"`,
    `"${r.position.replace(/"/g, '""')}"`,
    `"${r.primaryDutiesText.replace(/"/g, '""')}"`,
    `"${r.tenureText.replace(/"/g, '""')}"`,
    `"${r.educationText.replace(/"/g, '""')}"`,
    `"${r.trainingText.replace(/"/g, '""')}"`,
    `"${r.auditRemarks.replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...csvData.map(line => line.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
