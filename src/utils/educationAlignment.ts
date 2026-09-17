import { Personnel, PrimaryDuty, AlignmentLevel, AlignmentEvaluation } from '../types';

/**
 * Evaluate if a person's educational major aligns with their assigned duties.
 * 
 * Standard audit categorization for Thai public universities (MCU):
 * - Direct (ตรงสายงานโดยตรง):
 *   - งานบัญชี: สาขาวิชาการบัญชี (Accounting), บช.บ., บช.ม., บธ.บ. (การบัญชี)
 *   - งานการเงิน: การเงิน, การธนาคาร, การบัญชี, เศรษฐศาสตร์การเงิน
 *   - งานพัสดุ: นิติศาสตร์ (กฎหมายการจัดซื้อจัดจ้าง), รัฐประศาสนศาสตร์ (พัสดุ), หรือผู้ผ่านการอบรมกฎหมายพัสดุ
 *   - งานงบประมาณ: เศรษฐศาสตร์, การวางแผนและนโยบาย, รัฐประศาสนศาสตร์, การคลัง
 * - Related (สายใกล้เคียง/ประยุกต์ได้):
 *   - บริหารธุรกิจ (ทั่วไป, การตลาด, การจัดการ), คอมพิวเตอร์ธุรกิจ, การจัดการทั่วไป, การบริหารรัฐกิจ, การบริหารงานยุติธรรม
 * - Non-aligned (ไม่ตรงสายงาน):
 *   - พระพุทธศาสนา, ปรัชญา, สังคมศาสตร์/พัฒนาสังคม, ศึกษาศาสตร์/ครุศาสตร์, ภาษาไทย/อังกฤษ, ศิลปศาสตร์, สถิติประยุกต์, สาธารณสุขศาสตร์ ฯลฯ
 */
export function evaluatePersonnelAlignment(person: Personnel): AlignmentEvaluation {
  const major = (person.major || '').trim();
  const majorLower = major.toLowerCase();
  const duties = person.primaryDuties || [];

  const isAccounting = duties.includes('บัญชี');
  const isFinance = duties.includes('การเงิน');
  const isSupplies = duties.includes('พัสดุ');
  const isBudget = duties.includes('งบประมาณ');

  // Direct criteria regex
  const accountingRegex = /บัญชี|account/i;
  const financeRegex = /การเงิน|การธนาคาร|finance|banking/i;
  const suppliesRegex = /นิติศาสต|กฎหมาย|พัสดุ|จัดซื้อ|procurement|law/i;
  const budgetRegex = /เศรษฐศาสต|งบประมาณ|นโยบายและแผน|เศรษฐกิจ|economic|fiscal/i;

  // Related criteria regex
  const relatedRegex = /บริหารธุรกิจ|การจัดการ|บริหารรัฐกิจ|รัฐประศาสนศาสต|การบริหารงานยุติธรรม|คอมพิวเตอร์ธุรกิจ|การตลาด|พาณิชยศาสต|business|management|public admin/i;

  const matchedDuties: PrimaryDuty[] = [];
  const unmatchedDuties: PrimaryDuty[] = [];

  // Check matching per duty
  if (isAccounting) {
    if (accountingRegex.test(majorLower)) {
      matchedDuties.push('บัญชี');
    } else {
      unmatchedDuties.push('บัญชี');
    }
  }

  if (isFinance) {
    if (financeRegex.test(majorLower) || accountingRegex.test(majorLower) || /เศรษฐศาสต/i.test(majorLower)) {
      matchedDuties.push('การเงิน');
    } else {
      unmatchedDuties.push('การเงิน');
    }
  }

  if (isSupplies) {
    if (suppliesRegex.test(majorLower) || (person.isCertifiedProcurement)) {
      matchedDuties.push('พัสดุ');
    } else {
      unmatchedDuties.push('พัสดุ');
    }
  }

  if (isBudget) {
    if (budgetRegex.test(majorLower) || accountingRegex.test(majorLower) || financeRegex.test(majorLower) || /รัฐประศาสนศาสต/i.test(majorLower)) {
      matchedDuties.push('งบประมาณ');
    } else {
      unmatchedDuties.push('งบประมาณ');
    }
  }

  let level: AlignmentLevel = 'non_aligned';
  let levelLabel = 'ไม่ตรงสายงาน';
  let isDirect = false;
  let reason = '';
  let recommendation = '';

  if (matchedDuties.length > 0 && unmatchedDuties.length === 0) {
    // All assigned duties have direct match
    level = 'direct';
    levelLabel = 'ตรงสายงานโดยตรง';
    isDirect = true;
    reason = `สำเร็จการศึกษาสาขา "${major}" ซึ่งตรงกับมาตรฐานวิชาชีพในภาระหน้าที่ ${matchedDuties.join(', ')}`;
    recommendation = 'รักษามาตรฐานการปฏิบัติงานและส่งเสริมเป็นพี่เลี้ยง (Mentor) ถ่ายทอดความรู้ให้แก่เพื่อนร่วมงานในส่วนงาน';
  } else if (matchedDuties.length > 0 && unmatchedDuties.length > 0) {
    // Partially direct, but has other duties not matching
    level = 'related';
    levelLabel = 'ตรงสายบางภาระงาน';
    isDirect = false;
    reason = `สาขา "${major}" ตรงกับงาน ${matchedDuties.join(', ')} แต่ได้รับมอบหมายงานควบ ${unmatchedDuties.join(', ')} เพิ่มเติม`;
    recommendation = `ควรส่งเสริมการอบรมเฉพาะทางในภาระงาน ${unmatchedDuties.join(', ')} และพิจารณาเกลี่ยภาระงานให้สอดคล้องกับความเชี่ยวชาญ`;
  } else if (relatedRegex.test(majorLower)) {
    // Related business/management field
    level = 'related';
    levelLabel = 'สายใกล้เคียง / ประยุกต์ได้';
    isDirect = false;
    reason = `สำเร็จการศึกษาสาขา "${major}" ซึ่งเป็นสาขาด้านการบริหารจัดการ สามารถประยุกต์ใช้กับงานเอกสารและกระบวนการได้`;
    recommendation = 'ควรจัดอบรมเชิงลึกด้านระเบียบการเงินการคลัง มจร และ พ.ร.บ. จัดซื้อจัดจ้างภาครัฐ 2560 อย่างต่อเนื่อง';
  } else {
    // Non-aligned
    level = 'non_aligned';
    levelLabel = 'ไม่ตรงสายงานที่ได้รับมอบหมาย';
    isDirect = false;
    reason = `สำเร็จการศึกษาสาขา "${major}" ซึ่งมิใช่สาขาด้านบัญชี การเงิน หรือกฎหมาย แต่ได้รับมอบหมายภาระงาน ${duties.join(', ')}`;
    recommendation = 'ควรให้เข้ารับการอบรมหลักสูตรมาตรฐานวิชาชีพเร่งด่วน จัดระบบพี่เลี้ยงคอยสอบทานเอกสาร และมีคู่มือ Checklist การปฏิบัติงานชัดเจน';
  }

  return {
    level,
    levelLabel,
    isDirect,
    matchedDuties,
    unmatchedDuties,
    reason,
    recommendation,
  };
}

export interface AlignmentSummaryStats {
  total: number;
  directCount: number;
  directPct: number;
  relatedCount: number;
  relatedPct: number;
  nonAlignedCount: number;
  nonAlignedPct: number;

  // Breakdown by primary duty
  dutyAlignment: {
    accounting: { total: number; direct: number; related: number; nonAligned: number; riskRate: number };
    finance: { total: number; direct: number; related: number; nonAligned: number; riskRate: number };
    supplies: { total: number; direct: number; related: number; nonAligned: number; riskRate: number };
    budget: { total: number; direct: number; related: number; nonAligned: number; riskRate: number };
  };
}

export function calculateAlignmentSummary(personnelList: Personnel[]): AlignmentSummaryStats {
  const total = personnelList.length || 1;
  let directCount = 0;
  let relatedCount = 0;
  let nonAlignedCount = 0;

  const dutyStats = {
    accounting: { total: 0, direct: 0, related: 0, nonAligned: 0, riskRate: 0 },
    finance: { total: 0, direct: 0, related: 0, nonAligned: 0, riskRate: 0 },
    supplies: { total: 0, direct: 0, related: 0, nonAligned: 0, riskRate: 0 },
    budget: { total: 0, direct: 0, related: 0, nonAligned: 0, riskRate: 0 },
  };

  personnelList.forEach(p => {
    const evalResult = evaluatePersonnelAlignment(p);
    if (evalResult.level === 'direct') directCount++;
    else if (evalResult.level === 'related') relatedCount++;
    else nonAlignedCount++;

    const duties = p.primaryDuties || [];
    if (duties.includes('บัญชี')) {
      dutyStats.accounting.total++;
      if (evalResult.level === 'direct') dutyStats.accounting.direct++;
      else if (evalResult.level === 'related') dutyStats.accounting.related++;
      else dutyStats.accounting.nonAligned++;
    }

    if (duties.includes('การเงิน')) {
      dutyStats.finance.total++;
      if (evalResult.level === 'direct') dutyStats.finance.direct++;
      else if (evalResult.level === 'related') dutyStats.finance.related++;
      else dutyStats.finance.nonAligned++;
    }

    if (duties.includes('พัสดุ')) {
      dutyStats.supplies.total++;
      if (evalResult.level === 'direct') dutyStats.supplies.direct++;
      else if (evalResult.level === 'related') dutyStats.supplies.related++;
      else dutyStats.supplies.nonAligned++;
    }

    if (duties.includes('งบประมาณ')) {
      dutyStats.budget.total++;
      if (evalResult.level === 'direct') dutyStats.budget.direct++;
      else if (evalResult.level === 'related') dutyStats.budget.related++;
      else dutyStats.budget.nonAligned++;
    }
  });

  // Calculate risk rate (% of non-aligned for each duty)
  dutyStats.accounting.riskRate = Math.round((dutyStats.accounting.nonAligned / (dutyStats.accounting.total || 1)) * 100);
  dutyStats.finance.riskRate = Math.round((dutyStats.finance.nonAligned / (dutyStats.finance.total || 1)) * 100);
  dutyStats.supplies.riskRate = Math.round((dutyStats.supplies.nonAligned / (dutyStats.supplies.total || 1)) * 100);
  dutyStats.budget.riskRate = Math.round((dutyStats.budget.nonAligned / (dutyStats.budget.total || 1)) * 100);

  return {
    total: personnelList.length,
    directCount,
    directPct: Math.round((directCount / total) * 100),
    relatedCount,
    relatedPct: Math.round((relatedCount / total) * 100),
    nonAlignedCount,
    nonAlignedPct: Math.round((nonAlignedCount / total) * 100),
    dutyAlignment: dutyStats,
  };
}

/**
 * Institutional Audit Recommendations for HR and Administrative Supervision
 */
export const INSTITUTIONAL_AUDIT_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    pillar: 'มาตรการอบรมและพัฒนาทักษะเฉพาะทาง (Targeted Upskilling)',
    priority: 'เร่งด่วนที่สุด (High Priority)',
    summary: 'จัดอบรมหลักสูตรประกาศนียบัตรวิชาชีพบัญชีภาครัฐ และกฎหมายพัสดุ พ.ร.บ. 2560',
    description: 'เนื่องจากมีบุคลากรที่สำเร็จการศึกษาไม่ตรงสายงานถึงร้อยละ 40+ ที่ต้องรับผิดชอบงานบัญชีและพัสดุ จึงควรจัดทำหลักสูตรฝึกอบรมเชิงปฏิบัติการ (Workshop) บังคับร่วมกับกรมบัญชีกลางและส่วนงานตรวจสอบภายใน โดยมุ่งเน้นการบันทึกบัญชี 3 มิติ และกระบวนการจัดซื้อจัดจ้าง e-GP',
    targetAudience: 'ผู้ปฏิบัติงานด้านบัญชีและพัสดุที่จบสาขาอื่น เช่น พระพุทธศาสนา, การศึกษา, ภาษา, สังคมศาสตร์',
    responsibleUnit: 'ส่วนงานตรวจสอบภายใน ร่วมกับ กองบริหารงานบุคคล (HR) มจร',
    followUpPeriod: 'ภายใน 3–6 เดือน',
  },
  {
    id: 'rec-2',
    pillar: 'ระบบพี่เลี้ยงและการสอบทานคู่ขนาน (Mentorship & Peer Review)',
    priority: 'สำคัญมาก (Medium-High Priority)',
    summary: 'สร้างเครือข่ายพี่เลี้ยงทางวิชาชีพบัญชีระหว่างส่วนกลางกับวิทยาเขต/วิทยาลัยสงฆ์',
    description: 'จับคู่บุคลากรที่มีวุฒิตรงสายการบัญชี (บช.บ./บช.ม.) หรือมีประสบการณ์มากกว่า 5 ปี ในส่วนกลางและคณะใหญ่ ให้ทำหน้าที่เป็น "พี่เลี้ยงทางบัญชี (Accounting Mentor)" คอยให้คำปรึกษาและช่วยสอบทานเอกสารการเงินการบัญชีก่อนส่งตรวจ',
    targetAudience: 'หลักสูตรและวิทยาลัยสงฆ์ที่มีบุคลากรจบไม่ตรงสายและปฏิบัติงานเดี่ยว',
    responsibleUnit: 'กองคลังและทรัพย์สิน / คณะครุศาสตร์และบัณฑิตวิทยาลัย',
    followUpPeriod: 'ติดตามผลรายไตรมาส (Quarterly)',
  },
  {
    id: 'rec-3',
    pillar: 'คู่มือปฏิบัติงานมาตรฐานและแบบฟอร์มตรวจสอบ (SOP & Audit Checklist)',
    priority: 'สำคัญ (Medium Priority)',
    summary: 'จัดทำคู่มือ SOP และ Checklist คัดกรองความถูกต้องก่อนเบิกจ่ายและตรวจรับพัสดุ',
    description: 'จัดทำ Checklist สรุปรายการเอกสารที่ต้องแนบสำหรับแต่ละประเภทเงิน (เงินงบประมาณแผ่นดิน, เงินรายได้ค่าธรรมเนียมการศึกษา, เงินบริจาค) ในรูปแบบที่เข้าใจง่าย เพื่อลดความผิดพลาดจากความไม่ชำนาญในระเบียบ',
    targetAudience: 'ผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ งบประมาณ ทุกส่วนงานย่อย',
    responsibleUnit: 'ส่วนงานตรวจสอบภายใน มจร',
    followUpPeriod: 'จัดทำและแจกจ่ายภายในภาคการศึกษาปัจจุบัน',
  },
  {
    id: 'rec-4',
    pillar: 'การบริหารอัตรากำลังและการสรรหาเชิงยุทธศาสตร์ (Workforce Planning)',
    priority: 'เชิงนโยบายระยะยาว (Strategic Long-term)',
    summary: 'กำหนดคุณสมบัติเฉพาะตำแหน่ง (Job Specification) ที่ตรงสายงานในการสรรหาบุคลากรใหม่',
    description: 'เสนอแนะต่อมหาวิทยาลัยให้กำหนดคุณวุฒิตรงสาย "การบัญชี" เป็นคุณสมบัติบังคับสำหรับตำแหน่งนักวิชาการเงินและบัญชีในทุกส่วนงานย่อย และพิจารณาเกลี่ยอัตรากำลังให้ส่วนงานที่มีภาระงานจัดซื้อจัดจ้างสูงมีบุคลากรที่มีความรู้ด้านนิติศาสตร์หรือการจัดการพัสดุ',
    targetAudience: 'คณะกรรมการบริหารงานบุคคล มจร (ก.บ.ม.) และผู้บริหารส่วนงาน',
    responsibleUnit: 'กองบริหารงานบุคคล (HR) มจร',
    followUpPeriod: 'การจัดทำกรอบอัตรากำลังรอบ 4 ปี',
  },
];
