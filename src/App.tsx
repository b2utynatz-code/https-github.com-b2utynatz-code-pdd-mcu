import React, { useState, useEffect, useMemo } from 'react';
import { Personnel, FilterState, PrimaryDuty, AuthUser } from './types';
import { INITIAL_PERSONNEL, SAMPLE_MOCK_PERSONNEL } from './data/mockData';
import { REAL_SURVEY_PERSONNEL } from './data/surveyData';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { DashboardStats } from './components/DashboardStats';
import { SearchAndFilter } from './components/SearchAndFilter';
import { PersonnelCard } from './components/PersonnelCard';
import { PersonnelTableView } from './components/PersonnelTableView';
import { DutyMatrix } from './components/DutyMatrix';
import { PersonnelDetailModal } from './components/PersonnelDetailModal';
import { PersonnelFormModal } from './components/PersonnelFormModal';
import { AuditReportModal } from './components/AuditReportModal';
import { ImportExportModal } from './components/ImportExportModal';
import { ConfirmModal } from './components/ConfirmModal';
import { MultiDutyModal } from './components/MultiDutyModal';
import { EducationAlignmentModal } from './components/EducationAlignmentModal';
import { AuditWorkingPaperView } from './components/AuditWorkingPaperView';
import { calculateTenure } from './utils/helpers';
import { evaluatePersonnelAlignment } from './utils/educationAlignment';
import { Users, AlertCircle, Plus, CheckCircle2, FileSpreadsheet, RotateCcw, Trash2, Upload } from 'lucide-react';

const STORAGE_KEY = 'mcu_audit_personnel_dataset_2569_v3';
const AUTH_STORAGE_KEY = 'mcu_audit_current_user_v1';

export default function App() {
  // Authentication state for system access control
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch {
      // Fallback
    }
    return null;
  });

  // Load the newly processed survey dataset (191 records from MCU survey 2569)
  const [personnelList, setPersonnelList] = useState<Personnel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    // Default to the processed real survey dataset
    return REAL_SURVEY_PERSONNEL;
  });

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(personnelList));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [personnelList]);

  // Active top navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'matrix' | 'working-paper'>('dashboard');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    department: '',
    primaryDuty: '',
    educationLevel: '',
    departmentCategory: '',
    tenureRange: '',
    auditStatus: '',
    multiDutyOnly: false,
    alignmentFilter: '',
  });

  // View mode in directory: grid or table
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [selectedPersonForDetail, setSelectedPersonForDetail] = useState<Personnel | null>(null);
  const [personForEdit, setPersonForEdit] = useState<Personnel | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Personnel | null>(null);
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isMultiDutyModalOpen, setIsMultiDutyModalOpen] = useState(false);
  const [isAlignmentModalOpen, setIsAlignmentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // URL query parameters handling for navigation shortcuts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'directory' || tabParam === 'matrix' || tabParam === 'dashboard' || tabParam === 'working-paper') {
        setActiveTab(tabParam);
      }

      const viewParam = params.get('view');
      if (viewParam === 'working-paper' || viewParam === 'wp') {
        setActiveTab('working-paper');
      } else if (viewParam === 'report') {
        setIsReportModalOpen(true);
      } else if (viewParam === 'alignment') {
        setIsAlignmentModalOpen(true);
      } else if (viewParam === 'multiduty') {
        setIsMultiDutyModalOpen(true);
      }

      const searchParam = params.get('search');
      const deptParam = params.get('dept');
      const alignParam = params.get('alignment');
      if (searchParam || deptParam || alignParam) {
        setFilters(prev => ({
          ...prev,
          searchQuery: searchParam || prev.searchQuery,
          department: deptParam || prev.department,
          alignmentFilter: alignParam || prev.alignmentFilter,
        }));
        if (tabParam !== 'matrix' && tabParam !== 'dashboard') {
          setActiveTab('directory');
        }
      }
    } catch (e) {
      console.error('Failed to parse URL query parameters:', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Distinct list of departments
  const departments = useMemo(() => {
    const list = Array.from(new Set(personnelList.map(p => p.department)));
    return list.sort((a: string, b: string) => a.localeCompare(b, 'th'));
  }, [personnelList]);

  // Filtered personnel calculation
  const filteredPersonnel = useMemo(() => {
    return personnelList.filter(person => {
      // 1. Search Query across all fields
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesQuery = 
          person.fullName.toLowerCase().includes(query) ||
          person.department.toLowerCase().includes(query) ||
          (person.parentDepartment && person.parentDepartment.toLowerCase().includes(query)) ||
          (person.subDepartment && person.subDepartment.toLowerCase().includes(query)) ||
          (person.curricula && person.curricula.some(c => c.toLowerCase().includes(query))) ||
          (person.academicLevels && person.academicLevels.some(l => l.toLowerCase().includes(query))) ||
          person.position.toLowerCase().includes(query) ||
          person.major.toLowerCase().includes(query) ||
          person.phone.toLowerCase().includes(query) ||
          person.email.toLowerCase().includes(query) ||
          person.lineId.toLowerCase().includes(query) ||
          person.primaryDuties.some(d => d.toLowerCase().includes(query)) ||
          (person.duties && person.duties.some(d => d.toLowerCase().includes(query))) ||
          (person.dutyDescription && person.dutyDescription.toLowerCase().includes(query));

        if (!matchesQuery) return false;
      }

      // 2. Department filter
      if (filters.department && person.department !== filters.department) {
        return false;
      }

      // 3. Primary duty filter
      if (filters.primaryDuty && !person.primaryDuties.includes(filters.primaryDuty as PrimaryDuty)) {
        return false;
      }

      // 4. Education level
      if (filters.educationLevel && person.educationLevel !== filters.educationLevel) {
        return false;
      }

      // 5. Department category
      if (filters.departmentCategory && person.departmentCategory !== filters.departmentCategory) {
        return false;
      }

      // 6. Tenure range
      if (filters.tenureRange) {
        const { years } = calculateTenure(person.startDate);
        if (filters.tenureRange === '<1' && years >= 1) return false;
        if (filters.tenureRange === '1-3' && (years < 1 || years > 3)) return false;
        if (filters.tenureRange === '3-5' && (years < 3 || years > 5)) return false;
        if (filters.tenureRange === '>5' && years <= 5) return false;
      }

      // 7. Multi-duty filter (>= 3 duties)
      if (filters.multiDutyOnly && person.primaryDuties.length < 3) {
        return false;
      }

      // 8. Audit status
      if (filters.auditStatus) {
        if (filters.auditStatus === 'ควรติดตาม' || filters.auditStatus === 'ปฏิบัติควบ 3 ด้านขึ้นไป') {
          // Matches if person has >= 3 duties OR person.auditStatus === 'ควรติดตาม'
          if (person.primaryDuties.length < 3 && person.auditStatus !== 'ควรติดตาม') {
            return false;
          }
        } else if (person.auditStatus !== filters.auditStatus) {
          return false;
        }
      }

      // 9. Educational major to duty alignment filter
      if (filters.alignmentFilter && filters.alignmentFilter !== 'all') {
        const evalRes = evaluatePersonnelAlignment(person);
        if (evalRes.level !== filters.alignmentFilter) {
          return false;
        }
      }

      return true;
    });
  }, [personnelList, filters]);

  // Handlers for CRUD operations
  const handleSavePersonnel = (person: Personnel) => {
    const exists = personnelList.some(p => p.id === person.id);
    if (exists) {
      setPersonnelList(prev => prev.map(p => (p.id === person.id ? person : p)));
      showToast(`บันทึกการแก้ไขข้อมูล "${person.fullName}" เรียบร้อยแล้ว`);
    } else {
      setPersonnelList(prev => [person, ...prev]);
      showToast(`เพิ่มข้อมูล "${person.fullName}" เข้าสู่ระบบเรียบร้อยแล้ว`);
    }
  };

  const handleDeletePersonnel = (id: string) => {
    const target = personnelList.find(p => p.id === id);
    if (!target) return;
    setPersonToDelete(target);
  };

  const handleOpenAddModal = () => {
    setPersonForEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditPerson = (person: Personnel) => {
    setPersonForEdit(person);
    setIsFormModalOpen(true);
  };

  const handleImportPersonnel = (imported: Personnel[]) => {
    setPersonnelList(imported);
    showToast(`นำเข้าข้อมูลใหม่สำเร็จ ${imported.length} รายการ`);
    setIsImportExportModalOpen(false);
  };

  const handleResetToDefault = () => {
    setPersonnelList(REAL_SURVEY_PERSONNEL);
    showToast(`โหลดชุดข้อมูลสำรวจจริงจากไฟล์ CSV สำเร็จ (${REAL_SURVEY_PERSONNEL.length} ท่าน)`);
  };

  const handleClearAllPersonnel = () => {
    setIsConfirmClearAllOpen(true);
  };

  const handleLogin = (user: AuthUser, remember: boolean) => {
    setCurrentUser(user);
    if (remember) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error('Failed to persist auth state:', e);
      }
    } else {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        // Fallback
      }
    }
    showToast(`ยินดีต้อนรับ ${user.fullName} (${user.roleLabel}) เข้าสู่ระบบ`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Fallback
    }
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  // If user is not authenticated, display login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        <LoginPage onLogin={handleLogin} />
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5 text-xs font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-pink-100 selection:text-pink-900">
      {/* Institutional Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenImportExportModal={() => setIsImportExportModalOpen(true)}
        onClearAllData={personnelList.length > 0 ? handleClearAllPersonnel : undefined}
        onReloadSurveyData={handleResetToDefault}
        totalPersonnel={personnelList.length}
        totalDepartments={departments.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2.5 text-xs font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Official Publication Banner */}
            <div className="bg-gradient-to-r from-pink-900 via-pink-800 to-rose-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-pink-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-pink-500/30 text-pink-200 border border-pink-400/30 text-xs font-semibold">
                    เผยแพร่ข้อมูลอย่างเป็นทางการ • ส่วนงานตรวจสอบภายใน มจร
                  </span>
                  <span className="text-xs text-pink-200/80">• ฐานข้อมูลบุคลากร {personnelList.length} ท่าน (39 ส่วนงานย่อย)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  ระบบสารสนเทศผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ ส่วนงานย่อย มจร
                </h2>
                <p className="text-xs sm:text-sm text-pink-100/90 max-w-2xl font-body">
                  ฐานข้อมูลทำเนียบผู้ปฏิบัติงานสำหรับงานตรวจสอบภายในและการกำกับติดตามตามหลักธรรมาภิบาล ครอบคลุมคณะ บัณฑิตวิทยาลัย วิทยาเขต และวิทยาลัยสงฆ์ทั่วประเทศ
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white border border-pink-400/40 text-xs sm:text-sm font-semibold transition cursor-pointer"
                  title="ดูรายงานผลการตรวจสอบอัตรากำลัง"
                >
                  <FileSpreadsheet className="w-4 h-4 text-pink-300" />
                  <span>รายงานตรวจสอบ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportExportModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white border border-pink-400/40 text-xs sm:text-sm font-semibold transition cursor-pointer"
                  title="นำเข้าหรือส่งออกไฟล์ CSV เพิ่มเติม"
                >
                  <Upload className="w-4 h-4 text-pink-300" />
                  <span>นำเข้า / ส่งออก CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white text-pink-900 hover:bg-pink-50 text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
                  title="บันทึกข้อมูลผู้ปฏิบัติงานใหม่"
                >
                  <Plus className="w-4 h-4 text-pink-700" />
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </div>

            {personnelList.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-pink-300 p-8 sm:p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center mx-auto shadow-inner">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    ยังไม่มีข้อมูลผู้ปฏิบัติงานในระบบ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto font-body mt-1">
                    ระบบพร้อมให้ท่านเริ่มต้นบันทึกข้อมูลบุคลากรด้านการเงิน บัญชี พัสดุ และงบประมาณ ส่วนงานย่อย มจร ได้ทันที
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-700 hover:bg-pink-800 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>บันทึกข้อมูลผู้ปฏิบัติงานคนแรก</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImportExportModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-medium transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-pink-300" />
                    <span>นำเข้าไฟล์ CSV / Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-600" />
                    <span>โหลดข้อมูลสำรวจจริง มจร ({REAL_SURVEY_PERSONNEL.length} ท่าน)</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <DashboardStats
                  personnelList={personnelList}
                  onSelectDutyFilter={(duty) => {
                    setFilters(prev => ({ ...prev, primaryDuty: duty }));
                    setActiveTab('directory');
                  }}
                  onSelectCategoryFilter={(category) => {
                    setFilters(prev => ({ ...prev, departmentCategory: category }));
                    setActiveTab('directory');
                  }}
                  onSelectAuditFilter={(status) => {
                    setFilters(prev => ({
                      ...prev,
                      auditStatus: status,
                      multiDutyOnly: status === 'ควรติดตาม',
                    }));
                    setActiveTab('directory');
                  }}
                  onOpenMultiDutyModal={() => setIsMultiDutyModalOpen(true)}
                  onOpenAlignmentModal={() => setIsAlignmentModalOpen(true)}
                  onFilterNonAligned={() => {
                    setFilters({
                      searchQuery: '',
                      department: '',
                      primaryDuty: '',
                      educationLevel: '',
                      departmentCategory: '',
                      tenureRange: '',
                      auditStatus: '',
                      multiDutyOnly: false,
                      alignmentFilter: 'non_aligned',
                    });
                    setActiveTab('directory');
                  }}
                  onNavigateToDirectory={() => setActiveTab('directory')}
                  onNavigateToMatrix={() => setActiveTab('matrix')}
                  onNavigateToWorkingPaper={() => setActiveTab('working-paper')}
                />

                {/* Quick Preview of Recent Personnel */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        รายการผู้ปฏิบัติงานล่าสุดในระบบ
                      </h3>
                      <p className="text-xs text-slate-500 font-body">
                        ข้อมูลผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ ส่วนงานย่อย มจร
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('directory')}
                      className="text-xs font-semibold text-pink-700 hover:text-pink-800 cursor-pointer"
                    >
                      ดูทำเนียบทั้งหมด ({personnelList.length} คน) &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {personnelList.slice(0, 3).map(person => (
                      <PersonnelCard
                        key={person.id}
                        person={person}
                        onViewDetail={setSelectedPersonForDetail}
                        onEdit={handleEditPerson}
                        onDelete={handleDeletePersonnel}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Directory & Search View */}
        {activeTab === 'directory' && (
          <div className="space-y-5">
            {/* Search and Filters Controller */}
            <SearchAndFilter
              filters={filters}
              setFilters={setFilters}
              viewMode={viewMode}
              setViewMode={setViewMode}
              departments={departments}
              totalResults={filteredPersonnel.length}
              totalPersonnel={personnelList.length}
            />

            {/* Content Results Display */}
            {personnelList.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-pink-300 p-8 sm:p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center mx-auto shadow-inner">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    ยังไม่มีข้อมูลผู้ปฏิบัติงานในระบบ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto font-body mt-1">
                    เริ่มต้นบันทึกข้อมูลบุคลากรเพื่อแสดงในทำเนียบผู้ปฏิบัติงาน
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-700 hover:bg-pink-800 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>บันทึกข้อมูลผู้ปฏิบัติงานคนแรก</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsImportExportModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-medium transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-pink-300" />
                    <span>นำเข้าไฟล์ CSV / Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-600" />
                    <span>โหลดข้อมูลสำรวจ มจร ({REAL_SURVEY_PERSONNEL.length} ท่าน)</span>
                  </button>
                </div>
              </div>
            ) : filteredPersonnel.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-700 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  ไม่พบข้อมูลผู้ปฏิบัติงานตามเงื่อนไขที่ระบุ
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto font-body">
                  ลองล้างตัวกรอง หรือค้นหาด้วยคำค้นอื่น เช่น นามสกุล, ส่วนงาน หรือตำแหน่งงาน
                </p>
                <button
                  type="button"
                  onClick={() => setFilters({
                    searchQuery: '',
                    department: '',
                    primaryDuty: '',
                    educationLevel: '',
                    departmentCategory: '',
                    tenureRange: '',
                    auditStatus: '',
                  })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPersonnel.map(person => (
                  <PersonnelCard
                    key={person.id}
                    person={person}
                    onViewDetail={setSelectedPersonForDetail}
                    onEdit={handleEditPerson}
                    onDelete={handleDeletePersonnel}
                  />
                ))}
              </div>
            ) : (
              <PersonnelTableView
                personnelList={filteredPersonnel}
                onViewDetail={setSelectedPersonForDetail}
                onEdit={handleEditPerson}
                onDelete={handleDeletePersonnel}
              />
            )}
          </div>
        )}

        {/* Tab 3: Segregation of Duties (SoD) Matrix */}
        {activeTab === 'matrix' && (
          <DutyMatrix
            personnelList={personnelList}
            onSelectPersonnel={setSelectedPersonForDetail}
          />
        )}

        {/* Tab 4: Audit Working Paper (WP-HR-01/2569) */}
        {activeTab === 'working-paper' && (
          <AuditWorkingPaperView
            personnelList={personnelList}
            onSelectPerson={setSelectedPersonForDetail}
          />
        )}
      </main>

      {/* University Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 font-body mt-12">
        <div className="max-w-7xl mx-auto space-y-1">
          <p className="font-semibold text-slate-700 font-sans">
            ระบบสารสนเทศผู้ปฏิบัติงานด้านการเงิน บัญชี พัสดุ และงบประมาณ (MCU Internal Audit & Financial Staff Registry)
          </p>
          <p>
            ส่วนงานตรวจสอบภายใน มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย (MCU) • 79 หมู่ 1 ต.ลำไทร อ.วังน้อย จ.พระนครศรีอยุธยา 13170
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            ออกแบบและจัดสร้างเพื่อสนับสนุนการกำกับติดตามความโปร่งใสและระบบการควบคุมภายในภาครัฐ
          </p>
        </div>
      </footer>

      {/* Modals */}
      <PersonnelDetailModal
        person={selectedPersonForDetail}
        onClose={() => setSelectedPersonForDetail(null)}
        onEdit={(p) => {
          setSelectedPersonForDetail(null);
          handleEditPerson(p);
        }}
        onDelete={(id) => {
          setSelectedPersonForDetail(null);
          handleDeletePersonnel(id);
        }}
      />

      <PersonnelFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSavePersonnel}
        initialData={personForEdit}
      />

      <AuditReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        personnelList={personnelList}
        onOpenWorkingPaper={() => setActiveTab('working-paper')}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        personnelList={personnelList}
        onImportPersonnel={handleImportPersonnel}
        onResetToDefault={handleResetToDefault}
        onClearAllData={handleClearAllPersonnel}
      />

      {/* Modal displaying complete dataset of personnel handling 3+ duties */}
      <MultiDutyModal
        isOpen={isMultiDutyModalOpen}
        onClose={() => setIsMultiDutyModalOpen(false)}
        personnelList={personnelList}
        onSelectPerson={(person) => setSelectedPersonForDetail(person)}
        onNavigateToDirectoryWithFilter={() => {
          setFilters({
            searchQuery: '',
            department: '',
            primaryDuty: '',
            educationLevel: '',
            departmentCategory: '',
            tenureRange: '',
            auditStatus: '',
            multiDutyOnly: true,
          });
          setActiveTab('directory');
        }}
      />

      {/* Modal displaying Education Alignment Analysis and Audit Recommendations */}
      <EducationAlignmentModal
        isOpen={isAlignmentModalOpen}
        onClose={() => setIsAlignmentModalOpen(false)}
        personnelList={personnelList}
        onSelectPerson={(person) => setSelectedPersonForDetail(person)}
        onNavigateToDirectoryWithFilter={(filterLevel) => {
          setFilters({
            searchQuery: '',
            department: '',
            primaryDuty: '',
            educationLevel: '',
            departmentCategory: '',
            tenureRange: '',
            auditStatus: '',
            multiDutyOnly: false,
            alignmentFilter: filterLevel,
          });
          setActiveTab('directory');
        }}
      />

      {/* Confirmation Modal for deleting individual personnel */}
      <ConfirmModal
        isOpen={!!personToDelete}
        title="ยืนยันการลบข้อมูลผู้ปฏิบัติงาน"
        message={`ท่านต้องการลบข้อมูลของ "${personToDelete?.fullName || ''}" (${personToDelete?.department || ''}) ออกจากระบบใช่หรือไม่?`}
        subMessage="การดำเนินการนี้จะนำข้อมูลผู้ปฏิบัติงานท่านนี้ออกจากระบบฐานข้อมูลและทำเนียบผู้ปฏิบัติงานทันที"
        confirmLabel="ยืนยันการลบ"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={() => {
          if (personToDelete) {
            const name = personToDelete.fullName;
            setPersonnelList(prev => prev.filter(p => p.id !== personToDelete.id));
            showToast(`ลบข้อมูล "${name}" เรียบร้อยแล้ว`);
            setPersonToDelete(null);
          }
        }}
        onClose={() => setPersonToDelete(null)}
      />

      {/* Confirmation Modal for clearing all data */}
      <ConfirmModal
        isOpen={isConfirmClearAllOpen}
        title="ยืนยันการล้างข้อมูลทั้งหมดในระบบ"
        message={`ท่านต้องการล้างข้อมูลผู้ปฏิบัติงานทั้งหมด ${personnelList.length} ท่าน เพื่อเริ่มต้นระบบใหม่ใช่หรือไม่?`}
        subMessage="ข้อมูลผู้ปฏิบัติงานทั้งหมดจะถูกล้างออกจากระบบเพื่อให้ท่านนำเข้าไฟล์ CSV ใหม่ได้อย่างสะอาดเรียบร้อย (ท่านสามารถกด 'โหลดข้อมูลสำรวจ มจร' เพื่อโหลดชุดข้อมูลทางการกลับมาได้ทุกเมื่อ)"
        confirmLabel="ยืนยันล้างข้อมูลทั้งหมด"
        cancelLabel="ยกเลิก"
        isDestructive={true}
        onConfirm={() => {
          setPersonnelList([]);
          setIsConfirmClearAllOpen(false);
          showToast('ล้างข้อมูลเรียบร้อยแล้ว ท่านสามารถเริ่มใส่ข้อมูลใหม่หรือแนบไฟล์ CSV ได้ทันที');
        }}
        onClose={() => setIsConfirmClearAllOpen(false)}
      />
    </div>
  );
}
