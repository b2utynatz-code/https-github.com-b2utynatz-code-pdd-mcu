import React, { useState, useEffect } from 'react';
import { Personnel, PrimaryDuty, EducationLevel, SubunitCategory, TrainingRecord } from '../types';
import { 
  X, 
  Save, 
  AlertCircle, 
  Building2, 
  User, 
  GraduationCap, 
  Phone, 
  ShieldCheck, 
  BookOpen, 
  Layers, 
  Plus, 
  Award, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { DEPARTMENTS, SUBUNIT_CATEGORIES } from '../data/mockData';

interface PersonnelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Personnel) => void;
  initialData?: Personnel | null;
}

const DEFAULT_PERSONNEL: Omit<Personnel, 'id'> = {
  department: '',
  parentDepartment: '',
  subDepartment: '',
  curricula: [],
  academicLevels: ['ปริญญาตรี'],
  isMultiCurriculum: false,
  departmentCategory: 'คณะ / บัณฑิตวิทยาลัย',
  fullName: '',
  titlePrefix: 'นาย',
  position: 'นักวิชาการเงินและบัญชีปฏิบัติการ',
  primaryDuties: ['การเงิน', 'บัญชี'],
  duties: ['ควบคุมการเบิกจ่ายเงิน', 'จัดทำรายงานการเงิน'],
  dutyDescription: '',
  educationLevel: 'ปริญญาตรี',
  major: 'การบัญชี',
  graduationInstitution: '',
  startDate: new Date().toISOString().split('T')[0],
  email: '',
  lineId: '',
  phone: '035-248-000',
  internalPhone: '',
  isCertifiedProcurement: false,
  trainings: [],
  auditStatus: 'ปกติ',
  auditNotes: '',
};

const SUGGESTED_COURSES: Array<{
  courseName: string;
  organizer: string;
  category: TrainingRecord['category'];
  hours: number;
  riskMitigationImpact: string;
}> = [
  {
    courseName: 'พ.ร.บ. การจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560 และระบบ e-GP',
    organizer: 'กรมบัญชีกลาง กระทรวงการคลัง',
    category: 'พัสดุ',
    hours: 18,
    riskMitigationImpact: 'ลดความเสี่ยงการจัดซื้อจัดจ้างผิดระเบียบ ป้องกันข้อทักท้วง สตง. และเพิ่มความโปร่งใสในการบริหารสัญญา',
  },
  {
    courseName: 'ระบบ New GFMIS Thai และระบบสารสนเทศบัญชีมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย',
    organizer: 'กองคลังและทรัพย์สิน สำนักงานอธิการบดี มจร',
    category: 'บัญชี',
    hours: 12,
    riskMitigationImpact: 'ลดความเสี่ยงการบันทึกบัญชีผิดหมวด เพิ่มความถูกต้องของรายงานงบการเงินและตรวจยันยอดเงินฝาก',
  },
  {
    courseName: 'การควบคุมภายใน การประเมินความเสี่ยง (CSA) และการแบ่งแยกหน้าที่ (SoD)',
    organizer: 'สำนักงานตรวจสอบภายใน มจร',
    category: 'การควบคุมภายในและการบริหารความเสี่ยง',
    hours: 12,
    riskMitigationImpact: 'ชดเชยและลดความเสี่ยงจากการปฏิบัติงานควบหน้าที่หลายด้าน ป้องกันข้อบกพร่องทางการเงิน',
  },
  {
    courseName: 'ระเบียบการเบิกจ่ายเงินงบประมาณแผ่นดินและเงินรายได้มหาวิทยาลัยสงฆ์',
    organizer: 'สำนักงานตรวจสอบภายใน มจร',
    category: 'การเงิน',
    hours: 6,
    riskMitigationImpact: 'ลดความเสี่ยงการเบิกจ่ายเงินผิดหมวด ป้องกันเอกสารหลักฐานตกหล่นและเพิ่มความถูกต้องตามเกณฑ์',
  },
  {
    courseName: 'การบริหารงบประมาณรายหลักสูตร การคำนวณต้นทุนต่อหน่วยผลผลิต และแผนยุทธศาสตร์',
    organizer: 'กองแผนงาน สำนักงานอธิการบดี มจร',
    category: 'งบประมาณ',
    hours: 12,
    riskMitigationImpact: 'เพิ่มประสิทธิภาพการจัดสรรและติดตามการใช้จ่ายงบประมาณ ป้องกันการเบิกจ่ายล่าช้าหรือซ้ำซ้อน',
  },
  {
    courseName: 'เทคนิคการจัดทำเอกสารและตรวจรับพัสดุเพื่องานวิจัยและโครงการบริการวิชาการ',
    organizer: 'สถาบันวิจัยพุทธศาสตร์ มจร',
    category: 'พัสดุ',
    hours: 6,
    riskMitigationImpact: 'ลดข้อบกพร่องในการตรวจรับพัสดุงานวิจัย และเพิ่มความรัดกุมของเอกสารหลักฐานประกอบการเบิกจ่าย',
  },
];

const QUICK_RISK_MITIGATIONS = [
  'ลดความเสี่ยงการจัดซื้อจัดจ้างผิดระเบียบ พ.ร.บ. 2560 และข้อทักท้วง สตง.',
  'ลดข้อผิดพลาดในการบันทึกบัญชีและจัดทำรายงานงบการเงินประจำเดือน',
  'ชดเชยและลดความเสี่ยงจากการปฏิบัติหน้าที่ควบหลายด้าน (Compensating Control for SoD)',
  'เพิ่มความถูกต้องรวดเร็วในการเบิกจ่ายงบประมาณแผ่นดินและเงินรายได้',
  'ป้องกันความล่าช้าและข้อบกพร่องในการบริหารสัญญาพัสดุและตรวจรับ',
  'เสริมสร้างระบบการควบคุมภายในและความโปร่งใสในการตรวจสอบ',
];

export const PersonnelFormModal: React.FC<PersonnelFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Omit<Personnel, 'id'>>(DEFAULT_PERSONNEL);
  const [customDuty, setCustomDuty] = useState('');
  const [customCurriculum, setCustomCurriculum] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Training Sub-form State
  const [isAddingTraining, setIsAddingTraining] = useState(false);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [trainingForm, setTrainingForm] = useState<TrainingRecord>({
    id: '',
    courseName: '',
    organizer: 'สำนักงานตรวจสอบภายใน มจร',
    trainingDate: new Date().toISOString().split('T')[0],
    hours: 12,
    category: 'การเงิน',
    riskMitigationImpact: 'ลดความเสี่ยงข้อผิดพลาดในการปฏิบัติงานและป้องกันข้อทักท้วงจากการตรวจสอบ',
    status: 'ผ่านการอบรมแล้ว',
    certificateNo: '',
    notes: '',
  });
  const [trainingError, setTrainingError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        parentDepartment: initialData.parentDepartment || initialData.department,
        subDepartment: initialData.subDepartment || '',
        curricula: initialData.curricula || [],
        academicLevels: initialData.academicLevels || ['ปริญญาตรี'],
        isMultiCurriculum: initialData.isMultiCurriculum ?? (initialData.curricula ? initialData.curricula.length > 1 : false),
        trainings: initialData.trainings || [],
      });
    } else {
      setFormData(DEFAULT_PERSONNEL);
    }
    setErrors({});
    setIsAddingTraining(false);
    setEditingTrainingId(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.department.trim()) newErrors.department = 'กรุณาระบุส่วนงาน';
    if (!formData.fullName.trim()) newErrors.fullName = 'กรุณาระบุชื่อ-นามสกุล';
    if (!formData.position.trim()) newErrors.position = 'กรุณาระบุตำแหน่ง';
    if (formData.primaryDuties.length === 0) newErrors.primaryDuties = 'กรุณาเลือกภาระหน้าที่หลักอย่างน้อย 1 ด้าน';
    if (!formData.major.trim()) newErrors.major = 'กรุณาระบุสาขาวิชา';
    if (!formData.startDate) newErrors.startDate = 'กรุณาระบุวันเริ่มปฏิบัติงาน';
    if (!formData.phone.trim()) newErrors.phone = 'กรุณาระบุหมายเลขโทรศัพท์';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const curriculaCount = formData.curricula?.length || 0;
    const academicLevelsCount = formData.academicLevels?.length || 0;
    const isMulti = curriculaCount > 1 || academicLevelsCount > 1 || Boolean(formData.isMultiCurriculum);

    const personToSave: Personnel = {
      ...formData,
      parentDepartment: formData.parentDepartment || formData.department,
      isMultiCurriculum: isMulti,
      id: initialData ? initialData.id : `mcu-${Date.now()}`,
    };

    onSave(personToSave);
    onClose();
  };

  const togglePrimaryDuty = (duty: PrimaryDuty) => {
    setFormData(prev => {
      const exists = prev.primaryDuties.includes(duty);
      const updated = exists 
        ? prev.primaryDuties.filter(d => d !== duty)
        : [...prev.primaryDuties, duty];
      return { ...prev, primaryDuties: updated };
    });
  };

  const toggleAcademicLevel = (level: string) => {
    setFormData(prev => {
      const current = prev.academicLevels || [];
      const updated = current.includes(level)
        ? current.filter(l => l !== level)
        : [...current, level];
      return { ...prev, academicLevels: updated };
    });
  };

  const handleAddCurriculum = () => {
    if (!customCurriculum.trim()) return;
    const val = customCurriculum.trim();
    if (!formData.curricula?.includes(val)) {
      setFormData(prev => ({
        ...prev,
        curricula: [...(prev.curricula || []), val],
      }));
    }
    setCustomCurriculum('');
  };

  const handleRemoveCurriculum = (curr: string) => {
    setFormData(prev => ({
      ...prev,
      curricula: (prev.curricula || []).filter(c => c !== curr),
    }));
  };

  const handleAddDutyTag = () => {
    if (!customDuty.trim()) return;
    if (!formData.duties.includes(customDuty.trim())) {
      setFormData(prev => ({ ...prev, duties: [...prev.duties, customDuty.trim()] }));
    }
    setCustomDuty('');
  };

  const handleRemoveDutyTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      duties: prev.duties.filter(d => d !== tag),
    }));
  };

  // Training Handlers
  const handleOpenAddTraining = () => {
    setEditingTrainingId(null);
    setTrainingForm({
      id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      courseName: '',
      organizer: 'สำนักงานตรวจสอบภายใน มจร',
      trainingDate: new Date().toISOString().split('T')[0],
      hours: 12,
      category: 'การเงิน',
      riskMitigationImpact: 'ลดความเสี่ยงข้อผิดพลาดในการปฏิบัติงานและป้องกันข้อทักท้วงจากการตรวจสอบ',
      status: 'ผ่านการอบรมแล้ว',
      certificateNo: '',
      notes: '',
    });
    setTrainingError('');
    setIsAddingTraining(true);
  };

  const handleEditTraining = (record: TrainingRecord) => {
    setEditingTrainingId(record.id);
    setTrainingForm({ ...record });
    setTrainingError('');
    setIsAddingTraining(true);
  };

  const handleApplySuggestedCourse = (template: typeof SUGGESTED_COURSES[0]) => {
    setTrainingForm(prev => ({
      ...prev,
      courseName: template.courseName,
      organizer: template.organizer,
      category: template.category,
      hours: template.hours,
      riskMitigationImpact: template.riskMitigationImpact,
    }));
  };

  const handleSaveTrainingRecord = () => {
    if (!trainingForm.courseName.trim()) {
      setTrainingError('กรุณาระบุชื่อหลักสูตร / หัวข้อการอบรม');
      return;
    }

    const currentTrainings = formData.trainings || [];
    let updatedTrainings: TrainingRecord[];

    if (editingTrainingId) {
      updatedTrainings = currentTrainings.map(t => t.id === editingTrainingId ? trainingForm : t);
    } else {
      updatedTrainings = [...currentTrainings, { ...trainingForm, id: trainingForm.id || `tr-${Date.now()}` }];
    }

    // Auto-check procurement certified if they took procurement course and passed
    const isProcurement = trainingForm.category === 'พัสดุ' || 
      /พัสดุ|จัดซื้อ|e-gp|พ.ร.บ./i.test(trainingForm.courseName);
    const passed = trainingForm.status === 'ผ่านการอบรมแล้ว' || trainingForm.status === 'มีวุฒิบัตร/ผ่านเกณฑ์';

    setFormData(prev => ({
      ...prev,
      trainings: updatedTrainings,
      isCertifiedProcurement: (isProcurement && passed) ? true : prev.isCertifiedProcurement,
    }));

    setIsAddingTraining(false);
    setEditingTrainingId(null);
    setTrainingError('');
  };

  const handleDeleteTrainingRecord = (id: string) => {
    setFormData(prev => ({
      ...prev,
      trainings: (prev.trainings || []).filter(t => t.id !== id),
    }));
    if (editingTrainingId === id) {
      setIsAddingTraining(false);
      setEditingTrainingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div 
        id="personnel-form-modal"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Form Header */}
        <div className="bg-pink-800 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold">
              {initialData ? 'แก้ไขข้อมูลผู้ปฏิบัติงาน' : 'เพิ่มข้อมูลผู้ปฏิบัติงานใหม่'}
            </h2>
            <p className="text-xs text-pink-200 font-body mt-0.5">
              บันทึกข้อมูลครบทั้ง 10 หมวดรายการ สำหรับระบบสืบค้นและงานตรวจสอบภายใน มจร
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Group 1: ข้อมูลทั่วไป (1-4) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 text-pink-900 font-semibold text-sm">
              <User className="w-4 h-4 text-pink-700" />
              <span>ข้อมูลทั่วไป (ข้อ 1 - 4)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
              {/* 1. ส่วนงานหลัก */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  1. ส่วนงานหลัก / คณะ / วิทยาเขต <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  list="departments-list"
                  value={formData.parentDepartment || formData.department}
                  onChange={e => setFormData({ 
                    ...formData, 
                    department: e.target.value,
                    parentDepartment: e.target.value 
                  })}
                  placeholder="เช่น คณะพุทธศาสตร์, คณะครุศาสตร์, วิทยาเขตขอนแก่น"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                />
                <datalist id="departments-list">
                  {DEPARTMENTS.map(d => <option key={d} value={d} />)}
                </datalist>
                {errors.department && <p className="text-rose-500 text-[11px] mt-1">{errors.department}</p>}
              </div>

              {/* ส่วนงานย่อย / ภาควิชา */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ส่วนงานย่อย / ภาควิชา / สาขาวิชา
                </label>
                <input
                  type="text"
                  value={formData.subDepartment || ''}
                  onChange={e => setFormData({ ...formData, subDepartment: e.target.value })}
                  placeholder="เช่น ภาควิชาศาสนาและปรัชญา, สำนักงานคณบดี"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                />
              </div>

              {/* ประเภทส่วนงาน */}
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  กลุ่มประเภทส่วนงาน
                </label>
                <select
                  value={formData.departmentCategory}
                  onChange={e => setFormData({ ...formData, departmentCategory: e.target.value as SubunitCategory })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none cursor-pointer"
                >
                  {SUBUNIT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* คำนำหน้า & 2. ชื่อ-นามสกุล */}
              <div className="sm:col-span-2 grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block font-medium text-slate-700 mb-1">
                    คำนำหน้า
                  </label>
                  <select
                    value={formData.titlePrefix || 'นาย'}
                    onChange={e => setFormData({ ...formData, titlePrefix: e.target.value })}
                    className="w-full px-2 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none cursor-pointer"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="พระมหา">พระมหา</option>
                    <option value="พระครู">พระครู</option>
                    <option value="พระปลัด">พระปลัด</option>
                    <option value="พระใบฎีกา">พระใบฎีกา</option>
                    <option value="ผศ.">ผศ.</option>
                    <option value="รศ.">รศ.</option>
                    <option value="ดร.">ดร.</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-medium text-slate-700 mb-1">
                    2. ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="เช่น นายธีรภัทร์ วงศ์สุวรรณ หรือ พระมหาวิศิษฐ์ ธีรวํโส"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                  />
                  {errors.fullName && <p className="text-rose-500 text-[11px] mt-1">{errors.fullName}</p>}
                </div>
              </div>

              {/* 3. ตำแหน่ง */}
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  3. ตำแหน่ง <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  placeholder="เช่น นักวิชาการเงินและบัญชีปฏิบัติการ, นักวิชาการพัสดุชำนาญการ"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                />
                {errors.position && <p className="text-rose-500 text-[11px] mt-1">{errors.position}</p>}
              </div>

              {/* 4. ภาระหน้าที่ (4 ภาระงานหลัก) */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block font-medium text-slate-700">
                  4. ภาระหน้าที่หลัก (เลือกได้มากกว่า 1 ข้อ) <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {(['การเงิน', 'บัญชี', 'พัสดุ', 'งบประมาณ'] as PrimaryDuty[]).map(duty => (
                    <label key={duty} className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.primaryDuties.includes(duty)}
                        onChange={() => togglePrimaryDuty(duty)}
                        className="rounded border-slate-300 text-pink-700 focus:ring-pink-500"
                      />
                      <span className="text-xs text-slate-800 font-medium">งาน{duty}</span>
                    </label>
                  ))}
                </div>
                {errors.primaryDuties && <p className="text-rose-500 text-[11px]">{errors.primaryDuties}</p>}

                {/* รายละเอียดภาระหน้าที่ */}
                <div className="mt-2">
                  <label className="block text-[11px] text-slate-500 mb-1">
                    รายละเอียดภาระหน้าที่และความรับผิดชอบ
                  </label>
                  <textarea
                    rows={2}
                    value={formData.dutyDescription}
                    onChange={e => setFormData({ ...formData, dutyDescription: e.target.value })}
                    placeholder="อธิบายลักษณะงานที่รับผิดชอบ เช่น ตรวจสอบและอนุมัติใบสำคัญเบิกจ่าย, จัดทำระบบบัญชี 3 มิติ..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* New Group: หลักสูตรและระดับการศึกษาที่ดูแล */}
          <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 text-pink-900 font-semibold text-sm">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-pink-700" />
                <span>หลักสูตรและระดับการศึกษาในความรับผิดชอบ</span>
              </div>
              <span className="text-[11px] text-slate-500 font-normal">
                (เพื่อติดตามภาระงานหลายหลักสูตร / Cross-curriculum)
              </span>
            </div>

            <div className="space-y-4 text-xs font-body">
              {/* ระดับการศึกษาที่เปิดสอน/รับผิดชอบ */}
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">
                  ระดับการศึกษาที่เปิดสอนในความรับผิดชอบ (เลือกได้มากกว่า 1 ระดับ)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {['ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก', 'ประกาศนียบัตร / ป.บัณฑิต'].map(level => {
                    const isChecked = (formData.academicLevels || []).includes(level);
                    return (
                      <label 
                        key={level} 
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition ${
                          isChecked 
                            ? 'bg-pink-50 border-pink-300 text-pink-900 font-medium' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAcademicLevel(level)}
                          className="rounded border-slate-300 text-pink-700 focus:ring-pink-500"
                        />
                        <span>{level}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* รายการหลักสูตรที่ดูแล */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  รายการหลักสูตรที่ดูแลรับผิดชอบ (พิมพ์ชื่อหลักสูตรแล้วกดเพิ่ม)
                </label>
                
                {/* Input and Add button */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customCurriculum}
                    onChange={e => setCustomCurriculum(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCurriculum();
                      }
                    }}
                    placeholder="เช่น พธ.บ. พระพุทธศาสนา, พธ.ม. รัฐประศาสนศาสตร์..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCurriculum}
                    className="px-3 py-2 bg-pink-700 hover:bg-pink-800 text-white rounded-lg flex items-center gap-1 font-medium transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มหลักสูตร</span>
                  </button>
                </div>

                {/* Tag Pills List */}
                <div className="flex flex-wrap gap-1.5 mt-2.5 min-h-[30px] p-2 bg-white rounded-lg border border-slate-200">
                  {formData.curricula && formData.curricula.length > 0 ? (
                    formData.curricula.map((curr, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pink-50 text-pink-900 border border-pink-200 text-xs font-medium"
                      >
                        <span>{curr}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCurriculum(curr)}
                          className="text-pink-600 hover:text-rose-600 cursor-pointer"
                          title="ลบหลักสูตรนี้"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">
                      ยังไม่ได้ระบุหลักสูตรเฉพาะ (สามารถเพิ่มหลักสูตรที่บุคลากรดูแลด้านการเงิน/บัญชี/พัสดุได้)
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-curriculum manual override toggle */}
              <div className="pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isMultiCurriculum || (formData.curricula && formData.curricula.length > 1))}
                    onChange={e => setFormData({ ...formData, isMultiCurriculum: e.target.checked })}
                    className="rounded border-slate-300 text-pink-700 focus:ring-pink-500"
                  />
                  <span className="text-xs text-slate-800 font-medium">
                    กำหนดให้เป็นผู้มีภาระงานดูแลหลายหลักสูตร (Multi-curriculum Workload)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Group 2: วุฒิการศึกษาและเริ่มงาน (5-7) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 text-pink-900 font-semibold text-sm">
              <GraduationCap className="w-4 h-4 text-pink-700" />
              <span>วุฒิการศึกษาและระยะเวลาปฏิบัติงาน (ข้อ 5 - 7)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
              {/* 5. ระดับการศึกษา */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  5. ระดับการศึกษา <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.educationLevel}
                  onChange={e => setFormData({ ...formData, educationLevel: e.target.value as EducationLevel })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none cursor-pointer"
                >
                  <option value="ปริญญาตรี">ปริญญาตรี</option>
                  <option value="ปริญญาโท">ปริญญาโท</option>
                  <option value="ปริญญาเอก">ปริญญาเอก</option>
                  <option value="ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)">ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* 6. สาขาวิชา */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  6. สาขาวิชา <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={e => setFormData({ ...formData, major: e.target.value })}
                  placeholder="เช่น การบัญชี (บช.บ.), บริหารธุรกิจ, รัฐประศาสนศาสตร์"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                />
                {errors.major && <p className="text-rose-500 text-[11px] mt-1">{errors.major}</p>}
              </div>

              {/* สถาบันที่จบ */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  สถาบันที่สำเร็จการศึกษา (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={formData.graduationInstitution || ''}
                  onChange={e => setFormData({ ...formData, graduationInstitution: e.target.value })}
                  placeholder="เช่น มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย, ม.ธรรมศาสตร์"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                />
              </div>

              {/* 7. วัน/เดือน/ปี ที่เริ่มปฏิบัติงาน */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  7. วัน/เดือน/ปี ที่เริ่มปฏิบัติงาน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none cursor-pointer"
                />
                {errors.startDate && <p className="text-rose-500 text-[11px] mt-1">{errors.startDate}</p>}
              </div>
            </div>
          </div>

          {/* Group 3: ข้อมูลการติดต่อ (8-10) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200 text-pink-900 font-semibold text-sm">
              <Phone className="w-4 h-4 text-pink-700" />
              <span>ข้อมูลการติดต่อ (ข้อ 8 - 10)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-body">
              {/* 8. E-mail */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  8. E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="username@mcu.ac.th"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                />
              </div>

              {/* 9. ID Line */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  9. ID Line
                </label>
                <input
                  type="text"
                  value={formData.lineId}
                  onChange={e => setFormData({ ...formData, lineId: e.target.value })}
                  placeholder="เช่น mcu_finance_1"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                />
              </div>

              {/* 10. โทรศัพท์ */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  10. โทรศัพท์ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="เช่น 035-248-000 หรือ 081-xxx-xxxx"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                />
                {errors.phone && <p className="text-rose-500 text-[11px] mt-1">{errors.phone}</p>}
              </div>

              {/* เบอร์ต่อภายใน */}
              <div className="sm:col-span-3">
                <label className="block font-medium text-slate-700 mb-1">
                  เบอร์ต่อภายใน (Internal Extension)
                </label>
                <input
                  type="text"
                  value={formData.internalPhone || ''}
                  onChange={e => setFormData({ ...formData, internalPhone: e.target.value })}
                  placeholder="เช่น 8021, 8025"
                  className="w-full sm:w-1/3 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Group 4: ข้อมูลการเข้ารับการอบรมและพัฒนาบุคลากร (เพื่อพัฒนาบุคลากร และลดความเสี่ยงที่จะเกิดขึ้นในอนาคต) */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 text-pink-900 font-semibold text-sm">
                <GraduationCap className="w-4 h-4 text-pink-700" />
                <span>ข้อมูลการเข้ารับการอบรมเพิ่มเติม (เพื่อพัฒนาบุคลากร และลดความเสี่ยงในอนาคต)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-pink-100 text-pink-800">
                  {formData.trainings?.length || 0} หลักสูตร
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-200 text-slate-700">
                  รวม {(formData.trainings || []).reduce((acc, t) => acc + (Number(t.hours) || 0), 0)} ชม.
                </span>
                {!isAddingTraining && (
                  <button
                    type="button"
                    onClick={handleOpenAddTraining}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-medium transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มการอบรม</span>
                  </button>
                )}
              </div>
            </div>

            {/* Training Sub-Form (Add/Edit) */}
            {isAddingTraining && (
              <div className="bg-white p-4 rounded-xl border-2 border-pink-300 shadow-sm space-y-3.5 text-xs font-body">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-pink-900">
                    <Sparkles className="w-4 h-4 text-pink-600" />
                    <span>{editingTrainingId ? 'แก้ไขข้อมูลการอบรม' : 'เพิ่มประวัติการเข้ารับการอบรมใหม่'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTraining(false);
                      setEditingTrainingId(null);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Templates Selection */}
                <div className="bg-pink-50/50 p-2.5 rounded-lg border border-pink-100 space-y-1.5">
                  <span className="text-[11px] font-medium text-pink-900 block">
                    ⚡ เลือกหลักสูตรแนะนำตามเกณฑ์ มจร เพื่อกรอกข้อมูลอัตโนมัติ:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_COURSES.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplySuggestedCourse(tpl)}
                        className="text-[11px] px-2 py-1 rounded-md bg-white border border-pink-200 hover:bg-pink-100/70 hover:border-pink-300 text-slate-700 text-left transition cursor-pointer flex items-center gap-1"
                        title={tpl.courseName}
                      >
                        <Award className="w-3 h-3 text-pink-600 shrink-0" />
                        <span className="truncate max-w-[200px]">{tpl.courseName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course Name */}
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ชื่อหลักสูตร / หัวข้อการอบรม <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={trainingForm.courseName}
                    onChange={e => setTrainingForm({ ...trainingForm, courseName: e.target.value })}
                    placeholder="เช่น พระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                  />
                  {trainingError && <p className="text-rose-500 text-[11px] mt-1">{trainingError}</p>}
                </div>

                {/* Organizer & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      หน่วยงานผู้จัดฝึกอบรม
                    </label>
                    <input
                      type="text"
                      value={trainingForm.organizer}
                      onChange={e => setTrainingForm({ ...trainingForm, organizer: e.target.value })}
                      placeholder="เช่น กรมบัญชีกลาง, สำนักงานตรวจสอบภายใน มจร, สตง."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      หมวดหมู่ / ด้านภาระงาน
                    </label>
                    <select
                      value={trainingForm.category}
                      onChange={e => setTrainingForm({ ...trainingForm, category: e.target.value as any })}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                    >
                      <option value="การเงิน">การเงิน (Finance)</option>
                      <option value="บัญชี">บัญชี (Accounting)</option>
                      <option value="พัสดุ">พัสดุ (Procurement)</option>
                      <option value="งบประมาณ">งบประมาณ (Budget)</option>
                      <option value="การควบคุมภายในและการบริหารความเสี่ยง">การควบคุมภายในและการบริหารความเสี่ยง</option>
                      <option value="ระบบสารสนเทศและดิจิทัล">ระบบสารสนเทศและดิจิทัล (e-GP, GFMIS)</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>
                </div>

                {/* Date, Hours, Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      วันที่เข้ารับการอบรม
                    </label>
                    <input
                      type="date"
                      value={trainingForm.trainingDate}
                      onChange={e => setTrainingForm({ ...trainingForm, trainingDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      จำนวนชั่วโมงอบรม (ชม.)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={trainingForm.hours}
                      onChange={e => setTrainingForm({ ...trainingForm, hours: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      สถานะการอบรม
                    </label>
                    <select
                      value={trainingForm.status}
                      onChange={e => setTrainingForm({ ...trainingForm, status: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                    >
                      <option value="ผ่านการอบรมแล้ว">ผ่านการอบรมแล้ว</option>
                      <option value="มีวุฒิบัตร/ผ่านเกณฑ์">มีวุฒิบัตร / Certificate</option>
                      <option value="กำลังเข้ารับการอบรม">กำลังเข้ารับการอบรม</option>
                      <option value="แผนพัฒนาบุคลากร">อยู่ในแผนพัฒนาบุคลากร</option>
                    </select>
                  </div>
                </div>

                {/* Risk Mitigation Impact */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-medium text-slate-700">
                      🛡️ ผลลัพธ์ต่อการพัฒนาและลดความเสี่ยงที่จะเกิดขึ้นในอนาคต (Risk Mitigation Impact)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={trainingForm.riskMitigationImpact}
                    onChange={e => setTrainingForm({ ...trainingForm, riskMitigationImpact: e.target.value })}
                    placeholder="ระบุว่าการอบรมนี้ช่วยพัฒนาบุคลากรและลดความเสี่ยงในอนาคตอย่างไร"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                  />
                  {/* Quick Pill options */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {QUICK_RISK_MITIGATIONS.map((text, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTrainingForm({ ...trainingForm, riskMitigationImpact: text })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                      >
                        + {text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Certificate No & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      เลขที่วุฒิบัตร / ใบรับรอง (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      value={trainingForm.certificateNo || ''}
                      onChange={e => setTrainingForm({ ...trainingForm, certificateNo: e.target.value })}
                      placeholder="เช่น บก. 67/0123"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      หมายเหตุเพิ่มเติม
                    </label>
                    <input
                      type="text"
                      value={trainingForm.notes || ''}
                      onChange={e => setTrainingForm({ ...trainingForm, notes: e.target.value })}
                      placeholder="เช่น สามารถเป็นวิทยากรถ่ายทอดความรู้ภายในส่วนงานได้"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                    />
                  </div>
                </div>

                {/* Sub-form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingTraining(false);
                      setEditingTrainingId(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTrainingRecord}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{editingTrainingId ? 'บันทึกการแก้ไข' : 'บันทึกประวัติการอบรม'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Added Trainings */}
            {(!formData.trainings || formData.trainings.length === 0) ? (
              <div className="text-center py-5 px-4 bg-white rounded-xl border border-dashed border-slate-300">
                <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-700">ยังไม่มีข้อมูลการอบรมเพิ่มเติม</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  คลิกปุ่ม &quot;เพิ่มการอบรม&quot; ด้านบนเพื่อบันทึกประวัติการอบรมพัฒนาบุคลากร และลดความเสี่ยงในการปฏิบัติงาน
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {formData.trainings.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className="bg-white p-3 rounded-xl border border-slate-200 hover:border-pink-200 transition shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-slate-800 text-xs">{t.courseName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-pink-50 text-pink-700 border border-pink-200">
                            {t.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            t.status === 'มีวุฒิบัตร/ผ่านเกณฑ์' || t.status === 'ผ่านการอบรมแล้ว'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                          <span>🏢 ผู้จัด: {t.organizer}</span>
                          <span>📅 วันที่: {t.trainingDate}</span>
                          <span>⏱️ {t.hours} ชั่วโมง</span>
                          {t.certificateNo && <span>📜 วุฒิบัตร: {t.certificateNo}</span>}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditTraining(t)}
                          className="p-1 rounded text-slate-400 hover:text-pink-700 hover:bg-pink-50 transition cursor-pointer"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrainingRecord(t.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Risk mitigation impact note */}
                    {t.riskMitigationImpact && (
                      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5 text-[11px] text-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>ผลลัพธ์ลดความเสี่ยง:</strong> {t.riskMitigationImpact}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group 5: ข้อมูลงานตรวจสอบภายใน (Audit Specifics) */}
          <div className="bg-pink-50/60 p-4 rounded-xl border border-pink-200 space-y-3">
            <div className="flex items-center gap-2 text-pink-900 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-pink-700" />
              <span>ข้อมูลเพิ่มเติมสำหรับงานตรวจสอบภายใน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
              {/* อบรม พ.ร.บ. พัสดุฯ 2560 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCertifiedProcurement || false}
                  onChange={e => setFormData({ ...formData, isCertifiedProcurement: e.target.checked })}
                  className="rounded border-slate-300 text-pink-700 focus:ring-pink-500"
                />
                <span className="text-slate-800">ผ่านการอบรม พ.ร.บ. จัดซื้อจัดจ้างฯ 2560 / e-GP (Certificate กรมบัญชีกลาง)</span>
              </label>

              {/* สถานะการตรวจสอบ */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  สถานะการกำกับติดตาม
                </label>
                <select
                  value={formData.auditStatus || 'ปกติ'}
                  onChange={e => setFormData({ ...formData, auditStatus: e.target.value as any })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                >
                  <option value="ปกติ">ปกติ (ไม่มีข้อสังเกต)</option>
                  <option value="ควรติดตาม">ควรติดตาม (มีภาระงานควบซ้ำซ้อน)</option>
                  <option value="ต้องการบุคลากรเพิ่ม">ต้องการบุคลากรเพิ่ม</option>
                </select>
              </div>

              {/* บันทึกข้อสังเกต */}
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">
                  บันทึกข้อสังเกตของผู้ตรวจสอบภายใน
                </label>
                <input
                  type="text"
                  value={formData.auditNotes || ''}
                  onChange={e => setFormData({ ...formData, auditNotes: e.target.value })}
                  placeholder="เช่น เอกสารเบิกจ่ายครบถ้วน, ควรแบ่งแยกหน้าที่งานพัสดุออกจากการเงิน"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600 outline-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Form Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-pink-700 hover:bg-pink-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกข้อมูล</span>
          </button>
        </div>
      </div>
    </div>
  );
};
