import { AuthUser } from '../types';

export const SYSTEM_AUTH_CONFIG = {
  authorizedUser: 'Audit',
  authorizedPassword: 'auditmcu208',
};

export const DEFAULT_AUDIT_USER: AuthUser = {
  id: 'user-mcu-audit',
  username: 'Audit',
  email: 'audit@mcu.ac.th',
  fullName: 'ผู้ตรวจสอบภายใน มจร',
  role: 'auditor',
  roleLabel: 'ผู้ตรวจสอบภายใน (สิทธิ์เต็ม)',
  department: 'หน่วยตรวจสอบภายใน ส่วนกลาง มจร',
};
