export type PrimaryDuty = 'การเงิน' | 'บัญชี' | 'พัสดุ' | 'งบประมาณ';

export type EducationLevel = 'ปริญญาตรี' | 'ปริญญาโท' | 'ปริญญาเอก' | 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)' | 'อื่นๆ';

export type SubunitCategory = 
  | 'สำนักงานอธิการบดี / ส่วนกลาง'
  | 'คณะ / บัณฑิตวิทยาลัย'
  | 'วิทยาเขต / วิทยาลัยสงฆ์'
  | 'สถาบัน / สำนัก';

export interface TrainingRecord {
  id: string;
  courseName: string; // ชื่อหลักสูตร / หัวข้อการอบรม
  organizer: string; // หน่วยงานผู้จัดฝึกอบรม เช่น สำนักงานตรวจสอบภายใน มจร, กรมบัญชีกลาง, สตง.
  trainingDate: string; // วันที่เข้ารับการอบรม (YYYY-MM-DD หรือ พ.ศ.)
  hours: number; // จำนวนชั่วโมงอบรม
  category: 'การเงิน' | 'บัญชี' | 'พัสดุ' | 'งบประมาณ' | 'การควบคุมภายในและการบริหารความเสี่ยง' | 'ระบบสารสนเทศและดิจิทัล' | 'อื่นๆ';
  riskMitigationImpact: string; // ผลลัพธ์การลดความเสี่ยงที่จะเกิดขึ้นในอนาคตและการพัฒนาบุคลากร
  status: 'ผ่านการอบรมแล้ว' | 'มีวุฒิบัตร/ผ่านเกณฑ์' | 'กำลังเข้ารับการอบรม' | 'แผนพัฒนาบุคลากร';
  certificateNo?: string; // เลขที่วุฒิบัตร หรือเลขที่หนังสือรับรอง
  notes?: string; // หมายเหตุเพิ่มเติม
}

export interface Personnel {
  id: string;
  // 1. ส่วนงาน
  department: string;
  departmentCategory: SubunitCategory;
  // 2. ชื่อ-นามสกุล
  fullName: string;
  titlePrefix?: string; // เช่น พระมหา, นาย, นาง, นางสาว, ผศ.
  // 3. ตำแหน่ง
  position: string;
  // 4. ภาระหน้าที่
  duties: string[]; // รายการภาระหน้าที่ เช่น ['การเงิน', 'เบิกจ่ายเงินงบประมาณ']
  primaryDuties: PrimaryDuty[]; // ภาระงานหลัก 4 ด้าน: การเงิน, บัญชี, พัสดุ, งบประมาณ
  dutyDescription: string; // รายละเอียดภาระหน้าที่ความรับผิดชอบ
  // 5. ระดับการศึกษา
  educationLevel: EducationLevel;
  // 6. สาขาวิชา
  major: string;
  graduationInstitution?: string; // สถาบันที่จบการศึกษา
  // 7. วัน/เดือน/ปี ที่เริ่มปฏิบัติงาน
  startDate: string; // Format: YYYY-MM-DD (e.g. 2018-06-01)
  // 8. E-mail
  email: string;
  // 9. ID Line
  lineId: string;
  // 10. โทรศัพท์
  phone: string;
  internalPhone?: string; // เบอร์ต่อภายใน

  // Subunit breakdown, curricula & academic levels
  parentDepartment?: string; // หน่วยงานหลัก เช่น คณะครุศาสตร์, บัณฑิตวิทยาลัย, วิทยาลัยสงฆ์เลย
  subDepartment?: string; // ส่วนงานย่อย เช่น ภาควิชาบริหารการศึกษา, สำนักงานคณบดี
  curricula?: string[]; // รายการหลักสูตรที่ดูแลรับผิดชอบ เช่น ['ค.ม. พุทธบริหารการศึกษา', 'ค.ด. พุทธบริหารการศึกษา']
  academicLevels?: string[]; // ระดับการศึกษาที่เปิดสอน/รับผิดชอบ เช่น ['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก', 'ประกาศนียบัตร / ป.บัณฑิต']
  isMultiCurriculum?: boolean; // ดูแลภาระงานหลายหลักสูตร / หลายระดับชั้น

  // Audit-specific metadata for internal auditing transparency
  isCertifiedProcurement?: boolean; // ผ่านการอบรม พ.ร.บ. จัดซื้อจัดจ้าง 2560 หรือไม่
  trainings?: TrainingRecord[]; // ข้อมูลการเข้ารับการอบรมและพัฒนาบุคลากร เพื่อพัฒนาและลดความเสี่ยงในอนาคต
  auditStatus?: 'ปกติ' | 'ควรติดตาม' | 'ต้องการบุคลากรเพิ่ม';
  auditNotes?: string;
  avatarUrl?: string;
  gender?: 'monk' | 'male' | 'female';
}

export interface FilterState {
  searchQuery: string;
  department: string;
  parentDepartment?: string;
  primaryDuty: string;
  educationLevel: string; // วุฒิการศึกษาของบุคลากร
  academicLevel?: string; // ระดับชั้นที่เปิดสอน (ป.ตรี, ป.โท, ป.เอก, ป.บัณฑิต)
  departmentCategory: string;
  tenureRange: string; // all, <1, 1-3, 3-5, >5
  auditStatus: string;
  multiDutyOnly?: boolean; // กรองเฉพาะผู้ปฏิบัติหน้าที่ควบตั้งแต่ 3 ด้านขึ้นไป
  multiCurriculumOnly?: boolean; // กรองเฉพาะผู้ดูแลภาระงานหลายหลักสูตร
  alignmentFilter?: string; // all, direct, related, non_aligned
}

export type AlignmentLevel = 'direct' | 'related' | 'non_aligned';

export interface AlignmentEvaluation {
  level: AlignmentLevel;
  levelLabel: string;
  isDirect: boolean;
  matchedDuties: PrimaryDuty[];
  unmatchedDuties: PrimaryDuty[];
  reason: string;
  recommendation: string;
}

export type UserRole = 'auditor' | 'staff' | 'executive';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  email: string;
  avatar?: string;
}

