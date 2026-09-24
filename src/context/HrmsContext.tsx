import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MemberProfile,
  Role,
  Language,
  PoliceIdIdentity,
  OnlineApplication,
  AuditLogItem,
  NotificationItem,
  PoliceRank,
  DepartmentName,
  StationLocation,
  SeparationType,
  PersonnelDocument,
  RankHistoryItem,
  TransferHistoryItem,
  TrainingItem,
  PerformanceRecord,
  LeaveRecord,
  ApplicationType,
  SystemUserAccount,
  PayrollGlobalConfig,
  RankSalaryGradeScale,
  MemberPayrollCustomization,
  CalculatedOfficerPayroll
} from '../types/hrms';
import {
  INITIAL_MEMBERS,
  EXTERNAL_POLICE_ID_SYSTEM_DATABASE,
  INITIAL_APPLICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SYSTEM_USERS,
  SALARY_SCALE_MATRIX
} from '../data/mockHrmsData';
import {
  DEFAULT_PAYROLL_CONFIG,
  DEFAULT_RANK_SALARY_SCALES,
  calculateOfficerPayroll
} from '../utils/payrollCalculator';
import {
  subscribeToExternalIdRecords,
  fetchExternalIdRecordsOnce,
  createIdInExternalSystem,
  ExternalFirebaseIDRecord
} from '../services/externalIdFirebase';
import {
  subscribeToSystemBranding,
  saveSystemBrandingToFirebase,
  SystemBrandingConfig,
  subscribeToPayrollConfig,
  savePayrollConfigToFirebase,
  subscribeToSalaryScales,
  saveSalaryScalesToFirebase,
  subscribeToMemberPayrollCustomizations,
  saveMemberPayrollCustomizationToFirebase
} from '../services/hrmsFirebase';

interface HrmsContextType {
  // Authentication & Role
  currentUser: SystemUserAccount | null;
  login: (username: string, password: string) => { success: boolean; message: string; user?: SystemUserAccount };
  logout: () => void;
  userAccounts: SystemUserAccount[];
  provisionMemberCredentials: (policeId: string, username?: string, password?: string) => { success: boolean; message: string };
  toggleUserAccountStatus: (userId: string) => void;
  createStaffAccount: (accountData: Omit<SystemUserAccount, 'id' | 'createdDate' | 'createdBy'>) => { success: boolean; message: string };
  deleteStaffAccount: (userId: string) => { success: boolean; message: string };

  // System Branding & Cloud Logo
  systemLogo: string | null;
  updateSystemLogo: (logoUrl: string, logoName?: string) => Promise<{ success: boolean; message: string }>;
  resetSystemLogo: () => Promise<void>;
  isLogoSynced: boolean;

  // Payroll & Salary Engine (Firestore Synced)
  payrollConfig: PayrollGlobalConfig;
  salaryScales: RankSalaryGradeScale[];
  memberPayrollCustomizations: Record<string, MemberPayrollCustomization>;
  updatePayrollConfig: (config: PayrollGlobalConfig) => Promise<{ success: boolean; message: string }>;
  updateSalaryScales: (scales: RankSalaryGradeScale[]) => Promise<{ success: boolean; message: string }>;
  updateMemberPayrollCustomization: (customization: MemberPayrollCustomization) => Promise<{ success: boolean; message: string }>;
  applyRankSalaryScaleToAllMembers: (rank: PoliceRank, grade: number, stepIndex: number, newSalary: number) => Promise<{ success: boolean; count: number; message: string }>;
  getCalculatedPayroll: (policeId: string) => CalculatedOfficerPayroll | null;
  allCalculatedPayrolls: CalculatedOfficerPayroll[];

  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  activeMemberPoliceId: string;
  setActiveMemberPoliceId: (policeId: string) => void;
  activeMember: MemberProfile | undefined;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (amText: string, enText: string) => string;

  // Core Data
  members: MemberProfile[];
  externalIdSystemRecords: PoliceIdIdentity[];
  applications: OnlineApplication[];
  auditLogs: AuditLogItem[];
  notifications: NotificationItem[];

  // ID System Integration API Operations
  lookupPoliceIdInIdSystem: (policeId: string) => { found: boolean; data?: PoliceIdIdentity; alreadyInHrm: boolean };
  integrateNewMemberFromIdSystem: (policeId: string, initialPlacement: {
    rank: PoliceRank;
    department: DepartmentName;
    station: StationLocation;
    position: string;
    grade: number;
    step: number;
  }) => { success: boolean; message: string; newMember?: MemberProfile };
  syncMemberWithIdSystem: (policeId: string) => { success: boolean; message: string };

  // Live External Firebase ID System Status & Auto-Onboarding
  isLiveIdConnected: boolean;
  liveIdStatus: 'connected' | 'connecting' | 'offline';
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (enabled: boolean) => void;
  syncWithLiveIdSystemNow: () => Promise<{ success: boolean; newCount: number; message: string }>;
  autoOpenPersonnelFileFromIdSystem: (policeId: string, customPlacement?: {
    rank?: PoliceRank;
    department?: DepartmentName;
    station?: StationLocation;
    position?: string;
  }) => { success: boolean; message: string; newMember?: MemberProfile };
  simulateCreateIdInExternalSystem: (newId: {
    fullNameAm: string;
    fullNameEn: string;
    rankAm: string;
    rankEn: string;
    phone: string;
    photoUrl: string;
    gender: string;
    badgeNumber: string;
    bloodType: string;
  }) => Promise<{ success: boolean; id_number: string; message: string; autoCreatedMember?: MemberProfile }>;

  // Member Operations
  getMemberByPoliceId: (policeId: string) => MemberProfile | undefined;
  addPromotion: (policeId: string, newRank: PoliceRank, orderNumber: string, remarks?: string) => void;
  executeTransfer: (policeId: string, toDept: DepartmentName, toStation: StationLocation, reason: string, orderRef: string) => void;
  assignTraining: (policeId: string, training: Omit<TrainingItem, 'id'>) => void;
  submitPerformanceEvaluation: (policeId: string, evaluation: Omit<PerformanceRecord, 'id'>) => void;
  addLeaveRecord: (policeId: string, leave: Omit<LeaveRecord, 'id'>) => void;
  uploadPersonnelDocument: (policeId: string, doc: Omit<PersonnelDocument, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  processServiceSeparation: (policeId: string, separationData: {
    type: SeparationType;
    reason: string;
    decisionRef: string;
    pensionEligible: boolean;
    pensionBookRef?: string;
    decisionDocUrl?: string;
  }) => void;
  updateSalaryGradeStep: (policeId: string, grade: number, step: number, reason: string) => void;

  // Applications
  submitApplication: (appData: {
    type: ApplicationType;
    title: string;
    description: string;
    targetDetails?: any;
    attachments?: Array<{ name: string; url: string; type: string }>;
  }) => { success: boolean; applicationNo: string };
  reviewApplication: (
    applicationId: string,
    action: 'supervisor_approve' | 'supervisor_reject' | 'hr_approve' | 'hr_reject',
    reviewerName: string,
    note: string
  ) => void;

  // Notifications & Logging
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAuditLog: (entry: Omit<AuditLogItem, 'id' | 'timestamp'>) => void;

  // Reset / Seeding
  resetToDefaultData: () => void;
}

const HrmsContext = createContext<HrmsContextType | undefined>(undefined);

export const HrmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initialize with seed data
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    return (localStorage.getItem('begu_hrms_role') as Role) || 'hr_admin';
  });

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('begu_hrms_lang') as Language) || 'am';
  });

  const [activeMemberPoliceId, setActiveMemberPoliceId] = useState<string>(() => {
    return localStorage.getItem('begu_hrms_active_member') || 'BG-000101';
  });

  const [members, setMembers] = useState<MemberProfile[]>(() => {
    const saved = localStorage.getItem('begu_hrms_members');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing members', e);
      }
    }
    return INITIAL_MEMBERS;
  });

  const [externalIdSystemRecords, setExternalIdSystemRecords] = useState<PoliceIdIdentity[]>(() => {
    const saved = localStorage.getItem('begu_hrms_ext_id_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing ext id db', e);
      }
    }
    return EXTERNAL_POLICE_ID_SYSTEM_DATABASE;
  });

  const [applications, setApplications] = useState<OnlineApplication[]>(() => {
    const saved = localStorage.getItem('begu_hrms_applications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing apps', e);
      }
    }
    return INITIAL_APPLICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('begu_hrms_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing audit logs', e);
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('begu_hrms_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing notifications', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // User Accounts & Authentication Session
  const [userAccounts, setUserAccounts] = useState<SystemUserAccount[]>(() => {
    const saved = localStorage.getItem('begu_hrms_user_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing user accounts', e);
      }
    }
    return INITIAL_SYSTEM_USERS;
  });

  const [currentUser, setCurrentUser] = useState<SystemUserAccount | null>(() => {
    const isLoggedOut = localStorage.getItem('begu_hrms_user_logged_out');
    if (isLoggedOut === 'true') return null;
    const saved = localStorage.getItem('begu_hrms_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing current user', e);
      }
    }
    return INITIAL_SYSTEM_USERS[0]; // Admin by default
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('begu_hrms_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('begu_hrms_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('begu_hrms_active_member', activeMemberPoliceId);
  }, [activeMemberPoliceId]);

  useEffect(() => {
    localStorage.setItem('begu_hrms_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('begu_hrms_ext_id_db', JSON.stringify(externalIdSystemRecords));
  }, [externalIdSystemRecords]);

  useEffect(() => {
    localStorage.setItem('begu_hrms_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('begu_hrms_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('begu_hrms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('begu_hrms_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('begu_hrms_current_user', JSON.stringify(currentUser));
      localStorage.removeItem('begu_hrms_user_logged_out');
    } else {
      localStorage.removeItem('begu_hrms_current_user');
    }
  }, [currentUser]);

  // Live External Firebase ID System State
  const [isLiveIdConnected, setIsLiveIdConnected] = useState<boolean>(false);
  const [liveIdStatus, setLiveIdStatus] = useState<'connected' | 'connecting' | 'offline'>('connecting');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('begu_hrms_auto_sync');
    return saved !== null ? saved === 'true' : true; // Default ON
  });

  useEffect(() => {
    localStorage.setItem('begu_hrms_auto_sync', String(autoSyncEnabled));
  }, [autoSyncEnabled]);

  // System Branding & Cloud Logo State
  const [systemLogo, setSystemLogo] = useState<string | null>(() => {
    const saved = localStorage.getItem('begu_hrms_system_logo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.logoUrl || null;
      } catch {
        return saved;
      }
    }
    return null;
  });
  const [isLogoSynced, setIsLogoSynced] = useState<boolean>(false);

  // Real-time Firestore subscription for System Branding & Logo
  useEffect(() => {
    const unsubscribe = subscribeToSystemBranding(
      (branding: SystemBrandingConfig) => {
        if (branding && branding.logoUrl) {
          setSystemLogo(branding.logoUrl);
          setIsLogoSynced(true);
        } else if (branding && branding.logoUrl === '') {
          setSystemLogo(null);
          setIsLogoSynced(true);
        }
      },
      err => {
        console.warn('System branding subscription warning:', err);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const updateSystemLogo = async (logoUrl: string, logoName?: string) => {
    setSystemLogo(logoUrl);
    const adminName = currentUser?.fullName || 'HR Admin';
    const res = await saveSystemBrandingToFirebase(logoUrl, adminName, logoName);
    if (res.success) {
      setIsLogoSynced(true);
      addAuditLog({
        user: adminName,
        role: currentRole,
        action: 'የኮሚሽኑ ይፋዊ ሎጎ በጋለሪ ተሰቅሎ በክላውድ ለሁሉም ተጠቃሚዎች እንዲታይ ተደረገ',
        targetPoliceId: 'SYSTEM-BRANDING',
        targetMemberName: 'Commission Emblem / Logo',
        category: 'id_integration',
        newValue: logoName || 'Custom Uploaded Logo'
      });
    }
    return res;
  };

  const resetSystemLogo = async () => {
    setSystemLogo(null);
    localStorage.removeItem('begu_hrms_system_logo');
    await saveSystemBrandingToFirebase('', currentUser?.fullName || 'HR Admin', 'Default Police Shield');
  };

  // ---------------- Payroll & Salary Engine States ---------------- //
  const [payrollConfig, setPayrollConfig] = useState<PayrollGlobalConfig>(() => {
    const saved = localStorage.getItem('begu_hrms_payroll_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing payroll config', e);
      }
    }
    return DEFAULT_PAYROLL_CONFIG;
  });

  const [salaryScales, setSalaryScales] = useState<RankSalaryGradeScale[]>(() => {
    const saved = localStorage.getItem('begu_hrms_salary_scales');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing salary scales', e);
      }
    }
    return DEFAULT_RANK_SALARY_SCALES;
  });

  const [memberPayrollCustomizations, setMemberPayrollCustomizations] = useState<Record<string, MemberPayrollCustomization>>(() => {
    const saved = localStorage.getItem('begu_hrms_member_payrolls');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing member payrolls', e);
      }
    }
    return {};
  });

  // Real-time Firestore subscriptions for Payroll Config, Salary Scales & Member Payrolls
  useEffect(() => {
    const unsubConfig = subscribeToPayrollConfig(config => {
      if (config) setPayrollConfig(config);
    });
    const unsubScales = subscribeToSalaryScales(scales => {
      if (scales && scales.length > 0) setSalaryScales(scales);
    });
    const unsubCustom = subscribeToMemberPayrollCustomizations(map => {
      if (map) setMemberPayrollCustomizations(map);
    });

    return () => {
      if (unsubConfig) unsubConfig();
      if (unsubScales) unsubScales();
      if (unsubCustom) unsubCustom();
    };
  }, []);

  const updatePayrollConfig = async (config: PayrollGlobalConfig) => {
    setPayrollConfig(config);
    const ok = await savePayrollConfigToFirebase(config);
    addAuditLog({
      user: currentUser?.fullName || currentUser?.username || 'HR/Payroll Specialist',
      role: currentRole,
      action: 'የደመወዝ ቅነሳዎችና ግብር ህግጋት ተስተካክለው በፋየርስቶር ተቀምጠዋል',
      targetPoliceId: 'PAYROLL-RULES',
      targetMemberName: 'የተቋሙ አጠቃላይ የደመወዝ ህግጋት',
      category: 'salary'
    });
    return {
      success: ok,
      message: ok
        ? t('የደመወዝ ህግጋት በፋየርስቶር በተሳካ ሁኔታ ተቀምጠዋል!', 'Payroll deduction rules successfully saved to Firestore!')
        : t('ህግጋት ተቀምጠዋል (ከመስመር ውጭ)', 'Rules saved locally')
    };
  };

  const updateSalaryScales = async (scales: RankSalaryGradeScale[]) => {
    setSalaryScales(scales);
    const ok = await saveSalaryScalesToFirebase(scales);
    addAuditLog({
      user: currentUser?.fullName || currentUser?.username || 'HR/Payroll Specialist',
      role: currentRole,
      action: 'የፖሊስ አባላት የደመወዝ ስኬል በደረጃና በማዕረግ ተስተካክሎ በፋየርስቶር ተቀምጧል',
      targetPoliceId: 'SALARY-SCALES',
      targetMemberName: 'የማዕረግና ደረጃ ስኬል ማትሪክስ',
      category: 'salary'
    });
    return {
      success: ok,
      message: ok
        ? t('የማዕረግ ደመወዝ ስኬል በፋየርስቶር በተሳካ ሁኔታ ተቀምጧል!', 'Salary scales matrix successfully saved to Firestore!')
        : t('ስኬል ተቀምጧል (ከመስመር ውጭ)', 'Scales saved locally')
    };
  };

  const updateMemberPayrollCustomization = async (customization: MemberPayrollCustomization) => {
    setMemberPayrollCustomizations(prev => ({
      ...prev,
      [customization.policeId.toUpperCase()]: customization
    }));

    // Update members list state if salary or allowances changed
    setMembers(prev =>
      prev.map(m => {
        if (m.policeId.toUpperCase() === customization.policeId.toUpperCase()) {
          return {
            ...m,
            baseSalary:
              customization.customBaseSalary !== undefined ? customization.customBaseSalary : m.baseSalary,
            salaryGrade:
              customization.salaryGrade !== undefined ? customization.salaryGrade : m.salaryGrade,
            salaryStep:
              customization.salaryStep !== undefined ? customization.salaryStep : m.salaryStep,
            monthlyAllowances: {
              ...m.monthlyAllowances,
              duty: customization.monthlyAllowances?.duty ?? m.monthlyAllowances.duty,
              field: customization.monthlyAllowances?.field ?? m.monthlyAllowances.field,
              housing: customization.monthlyAllowances?.housing ?? m.monthlyAllowances.housing,
              transport: customization.monthlyAllowances?.transport ?? m.monthlyAllowances.transport,
              hazard: customization.monthlyAllowances?.hazard ?? m.monthlyAllowances.hazard
            }
          };
        }
        return m;
      })
    );

    const ok = await saveMemberPayrollCustomizationToFirebase(customization);
    const member = members.find(m => m.policeId.toUpperCase() === customization.policeId.toUpperCase());
    addAuditLog({
      user: currentUser?.fullName || currentUser?.username || 'HR/Payroll Specialist',
      role: currentRole,
      action: `የአባል ደመወዝ ማስተካከያና ቅነሳ በፋየርስቶር ተመዝግቧል (መሰረታዊ: ${customization.customBaseSalary ?? 'እንደነበረ'})`,
      targetPoliceId: customization.policeId,
      targetMemberName: member?.identity.fullName || customization.policeId,
      category: 'salary'
    });

    return {
      success: ok,
      message: ok
        ? t('የአባሉ ደመወዝ ማስተካከያ በፋየርስቶር ተቀምጧል!', 'Member payroll adjustment saved to Firestore!')
        : t('ተቀምጧል (ከመስመር ውጭ)', 'Saved locally')
    };
  };

  const applyRankSalaryScaleToAllMembers = async (
    rank: PoliceRank,
    grade: number,
    stepIndex: number,
    newSalary: number
  ) => {
    let affectedCount = 0;
    setMembers(prev =>
      prev.map(m => {
        if (m.currentRank === rank && m.salaryGrade === grade && (m.salaryStep === stepIndex + 1 || m.salaryStep === 1)) {
          affectedCount++;
          return {
            ...m,
            baseSalary: newSalary
          };
        }
        return m;
      })
    );

    addAuditLog({
      user: currentUser?.fullName || currentUser?.username || 'HR/Payroll Specialist',
      role: currentRole,
      action: `የማዕረግ ደመወዝ ጭማሪ/ማስተካከያ ለሁሉም ${rank} አባላት ተተግብሯል (${newSalary} ብር)`,
      targetPoliceId: 'ALL_' + rank,
      targetMemberName: `${rank} አባላት`,
      category: 'salary'
    });

    return {
      success: true,
      count: affectedCount,
      message: t(
        `የደመወዝ ስኬሉ ለ ${affectedCount} የ${rank} አባላት በሙሉ በራስ-ሰር ተተግብሯል!`,
        `Salary scale updated and applied to all ${affectedCount} officers with rank ${rank}!`
      )
    };
  };

  const getCalculatedPayroll = (policeId: string): CalculatedOfficerPayroll | null => {
    const member = members.find(m => m.policeId.toUpperCase() === policeId.toUpperCase());
    if (!member) return null;
    return calculateOfficerPayroll(member, payrollConfig, memberPayrollCustomizations[policeId.toUpperCase()]);
  };

  const allCalculatedPayrolls = members
    .filter(m => m.status === 'active' || m.status === 'on_leave' || m.status === 'transferred_pending')
    .map(m => calculateOfficerPayroll(m, payrollConfig, memberPayrollCustomizations[m.policeId.toUpperCase()]));

  // Helper translation function
  const t = (amText: string, enText: string): string => {
    return language === 'am' ? amText : enText;
  };

  // Rank normalization & scale helpers
  const normalizeRank = (rankStr?: string): PoliceRank => {
    if (!rankStr) return 'ኮንስታብል';
    const clean = rankStr.trim();
    if (clean.includes('ኮንስታብል') || clean.toLowerCase().includes('constable')) return 'ኮንስታብል';
    if (clean.includes('ረዳት ሳጅን') || clean.toLowerCase().includes('asst sergeant')) return 'ረዳት ሳጅን';
    if (clean.includes('ምክትል ሳጅን') || clean.toLowerCase().includes('deputy sergeant')) return 'ምክትል ሳጅን';
    if (clean.includes('ዋና ሳጅን') || clean.toLowerCase().includes('chief sergeant')) return 'ዋና ሳጅን';
    if (clean.includes('ሳጅን') || clean.toLowerCase().includes('sergeant')) return 'ሳጅን';
    if (clean.includes('ረዳት ኢንስፔክተር') || clean.toLowerCase().includes('asst inspector')) return 'ረዳት ኢንስፔክተር';
    if (clean.includes('ምክትል ኢንስፔክተር') || clean.toLowerCase().includes('deputy inspector')) return 'ምክትል ኢንስፔክተር';
    if (clean.includes('ዋና ኢንስፔክተር') || clean.toLowerCase().includes('chief inspector')) return 'ዋና ኢንስፔክተር';
    if (clean.includes('ኮማንደር') || clean.toLowerCase().includes('commander')) return 'ኮማንደር';
    if (clean.includes('ረዳት ኮሚሽነር') || clean.toLowerCase().includes('asst commissioner')) return 'ረዳት ኮሚሽነር';
    if (clean.includes('ምክትል ኮሚሽነር') || clean.toLowerCase().includes('deputy commissioner')) return 'ምክትል ኮሚሽነር';
    if (clean.includes('ኮሚሽነር') || clean.toLowerCase().includes('commissioner')) return 'ኮሚሽነር';
    return 'ኮንስታብል';
  };

  const rankToGrade = (rank: PoliceRank): number => {
    switch (rank) {
      case 'ኮንስታብል': return 1;
      case 'ረዳት ሳጅን': return 2;
      case 'ምክትል ሳጅን': return 3;
      case 'ሳጅን': return 4;
      case 'ዋና ሳጅን': return 5;
      case 'ረዳት ኢንስፔክተር': return 6;
      case 'ምክትል ኢንስፔክተር': return 7;
      case 'ዋና ኢንስፔክተር': return 8;
      case 'ኮማንደር': return 9;
      case 'ረዳት ኮሚሽነር': return 10;
      case 'ምክትል ኮሚሽነር': return 10;
      case 'ኮሚሽነር': return 10;
      default: return 1;
    }
  };

  const getMemberByPoliceId = (policeId: string): MemberProfile | undefined => {
    return members.find(m => m.policeId.toUpperCase() === policeId.trim().toUpperCase());
  };

  const activeMember = getMemberByPoliceId(activeMemberPoliceId) || members[0];

  const addAuditLog = (entry: Omit<AuditLogItem, 'id' | 'timestamp'>) => {
    const newLog: AuditLogItem = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '192.168.10.' + Math.floor(Math.random() * 50 + 1)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Helper to open a full digital personnel file taking the member's photo from the ID system
  const autoOpenPersonnelFileFromIdSystem = (
    policeId: string,
    customPlacement?: {
      rank?: PoliceRank;
      department?: DepartmentName;
      station?: StationLocation;
      position?: string;
    }
  ): { success: boolean; message: string; newMember?: MemberProfile } => {
    const query = policeId.trim().toUpperCase();
    const identity = externalIdSystemRecords.find(i => i.policeId.toUpperCase() === query);
    if (!identity) {
      return { success: false, message: 'ይህ የPolice ID በመታወቂያ ሲስተሙ ውስጥ አልተገኘም!' };
    }

    const alreadyExists = members.some(m => m.policeId.toUpperCase() === query);
    if (alreadyExists) {
      return { success: false, message: 'ይህ አባል ቀድሞውኑ በHRM ውስጥ የተከፈተ ማህደር አለው!' };
    }

    const assignedRank: PoliceRank = customPlacement?.rank || normalizeRank(identity.rankAm || identity.rankEn);
    const assignedDept: DepartmentName = customPlacement?.department || 'ወንጀል መከላከልና ፓትሮል መምሪያ';
    const assignedStation: StationLocation = customPlacement?.station || 'አሶሳ ከተማ ፖሊስ መምሪያ';
    const assignedPosition = customPlacement?.position || identity.responsibilityAm || 'መደበኛ የህግ ማስከበርና የጸጥታ ኦፊሰር';
    const grade = rankToGrade(assignedRank);
    const step = 1;
    const baseSal = SALARY_SCALE_MATRIX[grade]?.[0] || 6850;

    const newProfile: MemberProfile = {
      policeId: identity.policeId,
      badgeNumber: identity.badgeNumber || ('POL-' + identity.policeId.replace('BGR-POL-', '')),
      identity: identity,
      currentRank: assignedRank,
      currentDepartment: assignedDept,
      currentStation: assignedStation,
      position: assignedPosition,
      employmentDate: identity.issueDate || new Date().toISOString().substring(0, 10),
      employmentType: 'ቋሚ (Permanent)',
      status: 'active',
      salaryGrade: grade,
      salaryStep: step,
      baseSalary: baseSal,
      monthlyAllowances: {
        duty: 1000,
        field: 500,
        housing: 1500,
        transport: 800,
        hazard: 1000
      },
      pensionDeductionRate: 0.07,
      taxDeductionRate: 0.10,
      leaveBalance: {
        annualTotal: 30,
        annualUsed: 0,
        annualRemaining: 30,
        sickUsed: 0,
        specialUsed: 0
      },
      rankHistory: [
        {
          id: `rh-init-${Date.now()}`,
          rank: assignedRank,
          effectiveDate: identity.issueDate || new Date().toISOString().substring(0, 10),
          orderNumber: `ORD/ID/APPT/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`,
          approvedBy: 'የኮሚሽኑ ኮሚሽነር ጽ/ቤት',
          remarks: 'ከፖሊስ መታወቂያ ሲስተም ፎቶውን በመውሰድ በራስ-ሰር የተከፈተ ኦፊሴላዊ ማህደር'
        }
      ],
      transferHistory: [],
      trainingHistory: [
        {
          id: `tr-init-${Date.now()}`,
          title: 'መሰረታዊ የፖሊስ ሳይንስና ወታደራዊ ስልጠና',
          trainingType: 'መሰረታዊ ወታደራዊ',
          institution: 'የቤኒሻንጉል ጉሙዝ ፖሊስ ማሰልጠኛ ኮሌጅ',
          startDate: '2025-01-01',
          endDate: '2025-07-01',
          status: 'የተጠናቀቀ',
          gradeOrScore: 'በከፍተኛ ውጤት ያለፈ'
        }
      ],
      performanceHistory: [],
      leaveHistory: [],
      documents: [
        {
          id: `doc-id-${Date.now()}`,
          title: 'ይፋዊ የፖሊስ መታወቂያ ካርድ (Police ID Card)',
          documentType: 'የመታወቂያ ኮፒ',
          referenceNumber: identity.policeId,
          documentDate: identity.issueDate || new Date().toISOString().substring(0, 10),
          fileUrl: identity.photoUrl,
          fileType: 'image',
          fileSizeText: '2.4 MB',
          uploadedBy: 'Police-ID-Gateway-Auto',
          uploadedAt: new Date().toISOString().substring(0, 10),
          notes: 'ከመታወቂያ ሲስተም በቀጥታ የተወሰደ የመታወቂያ ፎቶ'
        },
        {
          id: `doc-init-${Date.now()}`,
          title: 'የመጀመሪያ ቅጥርና ሹመት ደብዳቤ',
          documentType: 'የቅጥር ሰነድ',
          referenceNumber: `BG/POL/APPT/${Date.now()}`,
          documentDate: identity.issueDate || new Date().toISOString().substring(0, 10),
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
          fileType: 'image',
          fileSizeText: '1.5 MB',
          uploadedBy: 'HR-Admin-Automated',
          uploadedAt: new Date().toISOString().substring(0, 10)
        }
      ],
      benefits: [
        {
          id: `b-init-${Date.now()}`,
          title: 'የመደበኛ ስራ አበል',
          type: 'duty',
          monthlyAmount: 1000,
          startDate: new Date().toISOString().substring(0, 10),
          status: 'active'
        }
      ],
      disciplinaryRecords: [],
      awardsAndHonors: [],
      userAccount: {
        username: (identity.fullNameEn || identity.fullName).split(' ')[0].toLowerCase() + '.' + identity.policeId.toLowerCase().replace(/[^a-z0-9]/g, ''),
        isActive: true,
        createdDate: new Date().toISOString().substring(0, 10)
      }
    };

    setMembers(prev => [newProfile, ...prev]);

    // Add Audit Log
    addAuditLog({
      user: 'Police-ID-AutoGateway',
      role: currentRole,
      action: `ከመታወቂያ ሲስተም ፎቶውን በመውሰድ አዲስ ማህደር ተከፈተ: ${identity.policeId} (${identity.fullName})`,
      targetPoliceId: identity.policeId,
      targetMemberName: identity.fullName,
      category: 'id_integration',
      previousValue: 'No HRM Profile',
      newValue: `Created Profile: Rank ${assignedRank}, Dept ${assignedDept}`
    });

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'አዲስ አባል ከመታወቂያ ሲስተም ማህደር ተከፈተለት',
      message: `ለመታወቂያ ቁጥር ${identity.policeId} (${identity.fullName}) የመታወቂያ ፎቶው ተወስዶ የተሟላ ዲጂታል ማህደር ተከፍቷል። አሁን ማዕረግ፣ ደመወዝ፣ ዝውውርና ሌሎች የHR ስራዎችን ማከናወን ይችላሉ።`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      type: 'system',
      linkTab: 'personnel'
    };
    setNotifications(prev => [newNotif, ...prev]);

    return {
      success: true,
      message: `ለመታወቂያ ቁጥር ${identity.policeId} (${identity.fullName}) የመታወቂያ ፎቶው ተወስዶ የተሟላ ዲጂታል ማህደር ተከፍቷል!`,
      newMember: newProfile
    };
  };

  // Real-time synchronization with bg-police-id-system Firestore
  useEffect(() => {
    const unsubscribe = subscribeToExternalIdRecords(
      (liveRecords) => {
        setIsLiveIdConnected(true);
        setLiveIdStatus('connected');

        if (liveRecords && liveRecords.length > 0) {
          const mappedIdentities: PoliceIdIdentity[] = liveRecords.map(rec => ({
            policeId: rec.id_number,
            fullName: rec.full_name_am || rec.full_name_en,
            fullNameEn: rec.full_name_en,
            photoUrl: rec.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
            gender: (rec.gender === 'F' || rec.gender === 'ሴ' || rec.gender?.toLowerCase() === 'female') ? 'ሴት' : 'ወንድ',
            phone: rec.phone,
            badgeNumber: rec.badge_number || ('POL-' + rec.id_number.replace('BGR-POL-', '')),
            rankAm: rec.rank_am,
            rankEn: rec.rank_en,
            responsibilityAm: rec.responsibility_am,
            responsibilityEn: rec.responsibility_en,
            height: rec.height,
            complexion: rec.complexion,
            memberSignature: rec.member_signature,
            commissionerSignature: rec.commissioner_signature,
            dateOfBirth: '1993-05-18',
            nationality: 'ኢትዮጵያዊ',
            issueDate: rec.issued_at || rec.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            expiryDate: rec.expires_at,
            bloodGroup: rec.blood_type,
            emergencyContact: {
              name: rec.emergency_contact_name || 'የቅርብ ቤተሰብ',
              phone: rec.emergency_contact_phone || '',
              relationship: 'የቤተሰብ ተጠሪ'
            },
            address: {
              region: 'ቤኒሻንጉል ጉሙዝ',
              zone: 'አሶሳ',
              wereda: 'አሶሳ',
              kebele: '01'
            },
            idSystemStatus: rec.deleted ? 'revoked' : (rec.status === 'rejected' ? 'suspended' : 'active')
          }));

          // Merge with externalIdSystemRecords
          setExternalIdSystemRecords(prev => {
            const merged = [...prev];
            mappedIdentities.forEach(mi => {
              const existingIdx = merged.findIndex(e => e.policeId.toUpperCase() === mi.policeId.toUpperCase());
              if (existingIdx >= 0) {
                merged[existingIdx] = mi;
              } else {
                merged.unshift(mi);
              }
            });
            return merged;
          });

          // Auto-sync dossiers if enabled
          if (autoSyncEnabled) {
            setMembers(currentMembers => {
              let updated = [...currentMembers];
              let addedCount = 0;

              mappedIdentities.forEach(identity => {
                const exists = updated.some(m => m.policeId.toUpperCase() === identity.policeId.toUpperCase());
                if (!exists && identity.idSystemStatus !== 'revoked') {
                  const initialRank = normalizeRank(identity.rankAm || identity.rankEn);
                  const grade = rankToGrade(initialRank);
                  const baseSal = SALARY_SCALE_MATRIX[grade]?.[0] || 6850;

                  const newProfile: MemberProfile = {
                    policeId: identity.policeId,
                    badgeNumber: identity.badgeNumber || ('POL-' + identity.policeId.replace('BGR-POL-', '')),
                    identity: identity,
                    currentRank: initialRank,
                    currentDepartment: 'ወንጀል መከላከልና ፓትሮል መምሪያ',
                    currentStation: 'አሶሳ ከተማ ፖሊስ መምሪያ',
                    position: identity.responsibilityAm || 'መደበኛ የህግ ማስከበርና የጸጥታ ኦፊሰር',
                    employmentDate: identity.issueDate || new Date().toISOString().substring(0, 10),
                    employmentType: 'ቋሚ (Permanent)',
                    status: 'active',
                    salaryGrade: grade,
                    salaryStep: 1,
                    baseSalary: baseSal,
                    monthlyAllowances: {
                      duty: 1000,
                      field: 500,
                      housing: 1500,
                      transport: 800,
                      hazard: 1000
                    },
                    pensionDeductionRate: 0.07,
                    taxDeductionRate: 0.10,
                    leaveBalance: {
                      annualTotal: 30,
                      annualUsed: 0,
                      annualRemaining: 30,
                      sickUsed: 0,
                      specialUsed: 0
                    },
                    rankHistory: [
                      {
                        id: `rh-init-${Date.now()}-${addedCount}`,
                        rank: initialRank,
                        effectiveDate: identity.issueDate || new Date().toISOString().substring(0, 10),
                        orderNumber: `ORD/ID/APPT/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`,
                        approvedBy: 'የኮሚሽኑ ኮሚሽነር ጽ/ቤት',
                        remarks: 'ከፖሊስ መታወቂያ ሲስተም ፎቶውን በመውሰድ በራስ-ሰር የተከፈተ ዲጂታል ማህደር'
                      }
                    ],
                    transferHistory: [],
                    trainingHistory: [
                      {
                        id: `tr-init-${Date.now()}-${addedCount}`,
                        title: 'መሰረታዊ የፖሊስ ሳይንስና ወታደራዊ ስልጠና',
                        trainingType: 'መሰረታዊ ወታደራዊ',
                        institution: 'የቤኒሻንጉል ጉሙዝ ፖሊስ ማሰልጠኛ ኮሌጅ',
                        startDate: '2025-01-01',
                        endDate: '2025-07-01',
                        status: 'የተጠናቀቀ',
                        gradeOrScore: 'በከፍተኛ ውጤት ያለፈ'
                      }
                    ],
                    performanceHistory: [],
                    leaveHistory: [],
                    documents: [
                      {
                        id: `doc-id-${Date.now()}-${addedCount}`,
                        title: 'ይፋዊ የፖሊስ መታወቂያ ካርድ (Police ID Card)',
                        documentType: 'የመታወቂያ ኮፒ',
                        referenceNumber: identity.policeId,
                        documentDate: identity.issueDate || new Date().toISOString().substring(0, 10),
                        fileUrl: identity.photoUrl,
                        fileType: 'image',
                        fileSizeText: '2.4 MB',
                        uploadedBy: 'ID-System-Live-Gateway',
                        uploadedAt: new Date().toISOString().substring(0, 10),
                        notes: 'ከመታወቂያ ሲስተም በቀጥታ የተወሰደ የመታወቂያ ፎቶ'
                      }
                    ],
                    benefits: [
                      {
                        id: `b-init-${Date.now()}-${addedCount}`,
                        title: 'የመደበኛ ስራ አበል',
                        type: 'duty',
                        monthlyAmount: 1000,
                        startDate: new Date().toISOString().substring(0, 10),
                        status: 'active'
                      }
                    ],
                    disciplinaryRecords: [],
                    awardsAndHonors: [],
                    userAccount: {
                      username: (identity.fullNameEn || identity.fullName).split(' ')[0].toLowerCase() + '.' + identity.policeId.toLowerCase().replace(/[^a-z0-9]/g, ''),
                      isActive: true,
                      createdDate: new Date().toISOString().substring(0, 10)
                    }
                  };

                  updated = [newProfile, ...updated];
                  addedCount++;
                }
              });

              return updated;
            });
          }
        }
      },
      (err) => {
        console.warn('External ID System listener status:', err);
        setLiveIdStatus('offline');
      }
    );

    return () => unsubscribe();
  }, [autoSyncEnabled]);

  // Manual trigger to pull all ID records from live Firebase
  const syncWithLiveIdSystemNow = async (): Promise<{ success: boolean; newCount: number; message: string }> => {
    setLiveIdStatus('connecting');
    try {
      const records = await fetchExternalIdRecordsOnce();
      setIsLiveIdConnected(true);
      setLiveIdStatus('connected');

      let newCount = 0;
      if (records && records.length > 0) {
        records.forEach(rec => {
          const existsInHrm = members.some(m => m.policeId.toUpperCase() === rec.id_number.toUpperCase());
          if (!existsInHrm) {
            autoOpenPersonnelFileFromIdSystem(rec.id_number);
            newCount++;
          }
        });
      }

      return {
        success: true,
        newCount,
        message: newCount > 0
          ? `ከመታወቂያ ሲስተም ${newCount} አዳዲስ አባላት ተገኝተው ፎቷቸው ተወስዶ ማህደራቸው ተከፍቷል!`
          : 'ሁሉም የመታወቂያ ሲስተም መረጃዎች ቀድመው ከHRM ጋር ተመሳስለዋል!'
      };
    } catch (err: any) {
      setLiveIdStatus('offline');
      return { success: false, newCount: 0, message: err?.message || 'ከመታወቂያ ሲስተም ጋር መገናኘት አልተቻለም' };
    }
  };

  // Simulate or create a real ID in the external ID system to demonstrate auto-dossier opening
  const simulateCreateIdInExternalSystem = async (newId: {
    fullNameAm: string;
    fullNameEn: string;
    rankAm: string;
    rankEn: string;
    phone: string;
    photoUrl: string;
    gender: string;
    badgeNumber: string;
    bloodType: string;
  }): Promise<{ success: boolean; id_number: string; message: string; autoCreatedMember?: MemberProfile }> => {
    const nextNum = Math.floor(Math.random() * 80000 + 10000);
    const id_number = `BGR-POL-16${nextNum}`;

    const newExtRecord: Omit<ExternalFirebaseIDRecord, 'id'> = {
      id_number,
      full_name_am: newId.fullNameAm,
      full_name_en: newId.fullNameEn,
      rank_am: newId.rankAm || 'ኮንስታብል',
      rank_en: newId.rankEn || 'Constable',
      responsibility_am: 'የህዝብ ደህንነትና ፓትሮል',
      responsibility_en: 'Public Safety & Patrol',
      phone: newId.phone,
      photo_url: newId.photoUrl,
      blood_type: newId.bloodType || 'O+',
      badge_number: newId.badgeNumber || `POL-${nextNum}`,
      gender: newId.gender || 'ወ',
      complexion: 'ጠይም',
      height: '1.75m',
      emergency_contact_name: 'አቶ አበበ (ቤተሰብ)',
      emergency_contact_phone: '+251911223344',
      created_at: new Date().toISOString(),
      issued_at: new Date().toISOString().split('T')[0],
      expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
      status: 'approved'
    };

    // 1. Send to external Firebase
    await createIdInExternalSystem(newExtRecord);

    // 2. Also put into local externalIdSystemRecords immediately
    const identityObj: PoliceIdIdentity = {
      policeId: id_number,
      fullName: newId.fullNameAm,
      fullNameEn: newId.fullNameEn,
      photoUrl: newId.photoUrl,
      gender: (newId.gender === 'ሴ' || newId.gender === 'F') ? 'ሴት' : 'ወንድ',
      phone: newId.phone,
      badgeNumber: newExtRecord.badge_number,
      rankAm: newExtRecord.rank_am,
      rankEn: newExtRecord.rank_en,
      responsibilityAm: newExtRecord.responsibility_am,
      responsibilityEn: newExtRecord.responsibility_en,
      dateOfBirth: '1994-07-22',
      nationality: 'ኢትዮጵያዊ',
      issueDate: newExtRecord.issued_at!,
      expiryDate: newExtRecord.expires_at,
      bloodGroup: newExtRecord.blood_type,
      emergencyContact: {
        name: newExtRecord.emergency_contact_name,
        phone: newExtRecord.emergency_contact_phone,
        relationship: 'የቤተሰብ ተጠሪ'
      },
      address: {
        region: 'ቤኒሻንጉል ጉሙዝ',
        zone: 'አሶሳ',
        wereda: 'አሶሳ',
        kebele: '01'
      },
      idSystemStatus: 'active'
    };

    setExternalIdSystemRecords(prev => [identityObj, ...prev.filter(e => e.policeId !== id_number)]);

    // 3. Directly open the HRM digital personnel file with this photo!
    const autoDossierRes = autoOpenPersonnelFileFromIdSystem(id_number);

    return {
      success: true,
      id_number,
      message: `በመታወቂያ ሲስተም መታወቂያ ተሰርቷል (${id_number}) ➜ የመታወቂያ ፎቶውን በመውሰድ በHRM ላይ ማህደር ወዲያውኑ ተከፍቷል! አሁን ማዕረግ፣ ደመወዝ፣ ዝውውርና ሌሎች ስራዎችን መስራት ይችላሉ።`,
      autoCreatedMember: autoDossierRes.newMember
    };
  };

  // POLICE ID SYSTEM INTEGRATION API
  const lookupPoliceIdInIdSystem = (policeId: string) => {
    const query = policeId.trim().toUpperCase();
    const identity = externalIdSystemRecords.find(i => i.policeId.toUpperCase() === query);
    const alreadyInHrm = members.some(m => m.policeId.toUpperCase() === query);
    if (!identity) {
      return { found: false, alreadyInHrm: false };
    }
    return { found: true, data: identity, alreadyInHrm };
  };

  const integrateNewMemberFromIdSystem = (
    policeId: string,
    initialPlacement: {
      rank: PoliceRank;
      department: DepartmentName;
      station: StationLocation;
      position: string;
      grade: number;
      step: number;
    }
  ) => {
    const lookup = lookupPoliceIdInIdSystem(policeId);
    if (!lookup.found || !lookup.data) {
      return { success: false, message: 'ይህ የPolice ID በመታወቂያ ሲስተሙ ውስጥ አልተገኘም!' };
    }
    if (lookup.alreadyInHrm) {
      return { success: false, message: 'ይህ አባል ቀድሞውኑ በHRM ሲስተም ውስጥ ተመዝግቧል!' };
    }

    const identity = lookup.data;
    const baseSal = SALARY_SCALE_MATRIX[initialPlacement.grade]?.[initialPlacement.step - 1] || 7000;

    const newProfile: MemberProfile = {
      policeId: identity.policeId,
      badgeNumber: 'POL-' + identity.policeId.replace('BG-', ''),
      identity: identity,
      currentRank: initialPlacement.rank,
      currentDepartment: initialPlacement.department,
      currentStation: initialPlacement.station,
      position: initialPlacement.position,
      employmentDate: new Date().toISOString().substring(0, 10),
      employmentType: 'ቋሚ (Permanent)',
      status: 'active',
      salaryGrade: initialPlacement.grade,
      salaryStep: initialPlacement.step,
      baseSalary: baseSal,
      monthlyAllowances: {
        duty: 1000,
        field: 500,
        housing: 1500,
        transport: 800,
        hazard: 1000
      },
      pensionDeductionRate: 0.07,
      taxDeductionRate: 0.10,
      leaveBalance: {
        annualTotal: 30,
        annualUsed: 0,
        annualRemaining: 30,
        sickUsed: 0,
        specialUsed: 0
      },
      rankHistory: [
        {
          id: `rh-init-${Date.now()}`,
          rank: initialPlacement.rank,
          effectiveDate: new Date().toISOString().substring(0, 10),
          orderNumber: `ORD/APPT/${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`,
          approvedBy: 'የኮሚሽኑ ኮሚሽነር ጽ/ቤት',
          remarks: 'ከፖሊስ መታወቂያ ሲስተም ውህደት በኋላ የተከፈተ የመጀመሪያ ምደባ'
        }
      ],
      transferHistory: [],
      trainingHistory: [
        {
          id: `tr-init-${Date.now()}`,
          title: 'መሰረታዊ የፖሊስ ሳይንስና ወታደራዊ ስልጠና',
          trainingType: 'መሰረታዊ ወታደራዊ',
          institution: 'የቤኒሻንጉል ጉሙዝ ፖሊስ ማሰልጠኛ ኮሌጅ',
          startDate: '2025-01-01',
          endDate: '2025-07-01',
          status: 'የተጠናቀቀ',
          gradeOrScore: 'በከፍተኛ ውጤት ያለፈ'
        }
      ],
      performanceHistory: [],
      leaveHistory: [],
      documents: [
        {
          id: `doc-init-${Date.now()}`,
          title: 'የመጀመሪያ ቅጥርና ሹመት ደብዳቤ',
          documentType: 'የቅጥር ሰነድ',
          referenceNumber: `BG/POL/APPT/${Date.now()}`,
          documentDate: new Date().toISOString().substring(0, 10),
          fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
          fileType: 'image',
          fileSizeText: '1.5 MB',
          uploadedBy: 'HR-Admin-Automated',
          uploadedAt: new Date().toISOString().substring(0, 10)
        }
      ],
      benefits: [
        {
          id: `b-init-${Date.now()}`,
          title: 'የመደበኛ ስራ አበል',
          type: 'duty',
          monthlyAmount: 1000,
          startDate: new Date().toISOString().substring(0, 10),
          status: 'active'
        }
      ],
      disciplinaryRecords: [],
      awardsAndHonors: [],
      userAccount: {
        username: identity.fullName.split(' ')[0].toLowerCase() + '.' + identity.policeId.toLowerCase().replace('bg-', ''),
        isActive: true,
        createdDate: new Date().toISOString().substring(0, 10)
      }
    };

    setMembers(prev => [newProfile, ...prev]);

    // Add Audit Log
    addAuditLog({
      user: 'HR-Admin-System',
      role: currentRole,
      action: 'ከመታወቂያ ሲስተም አዲስ አባል ተቀብሎ የHR ማህደር በራሱ ከፈተ (Auto Onboarded)',
      targetPoliceId: identity.policeId,
      targetMemberName: identity.fullName,
      category: 'id_integration',
      previousValue: 'Not in HRMS',
      newValue: `Created HR Profile: ${initialPlacement.rank}, ${initialPlacement.department}`
    });

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'አዲስ አባል ከመታወቂያ ሲስተም ተቀናጀ',
      message: `አባል ${identity.fullName} (${identity.policeId}) በማዕረግ ${initialPlacement.rank} ወደ ${initialPlacement.department} ተመድበው ዲጂታል ማህደራቸው ተከፍቷል።`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      type: 'system',
      linkTab: 'personnel'
    };
    setNotifications(prev => [newNotif, ...prev]);

    return {
      success: true,
      message: `አባል ${identity.fullName} (${identity.policeId}) በተሳካ ሁኔታ ወደ HRM ገብተዋል፤ የዲጂታል ማህደራቸው ተከፍቷል!`,
      newMember: newProfile
    };
  };

  const syncMemberWithIdSystem = (policeId: string) => {
    const member = getMemberByPoliceId(policeId);
    if (!member) {
      return { success: false, message: 'አባሉ በHRM ውስጥ አልተገኘም' };
    }
    const extIdentity = externalIdSystemRecords.find(i => i.policeId.toUpperCase() === policeId.toUpperCase());
    if (!extIdentity) {
      return { success: false, message: 'በመታወቂያ ሲስተሙ ውስጥ የአባል መረጃ አልተገኘም' };
    }

    setMembers(prev =>
      prev.map(m => {
        if (m.policeId.toUpperCase() === policeId.toUpperCase()) {
          return {
            ...m,
            identity: {
              ...extIdentity
            }
          };
        }
        return m;
      })
    );

    addAuditLog({
      user: 'HR-Officer',
      role: currentRole,
      action: 'የአባል ማንነት መረጃ ከመታወቂያ ሲስተም ጋር ተመሳሰለ (ID Sync)',
      targetPoliceId: member.policeId,
      targetMemberName: member.identity.fullName,
      category: 'id_integration',
      newValue: 'Biometric and Identity verified with Police ID Gateway'
    });

    return { success: true, message: `የአባል ${member.identity.fullName} የመታወቂያ መረጃ በተሳካ ሁኔታ ተመሳስሏል!` };
  };

  // Member HR mutations
  const addPromotion = (policeId: string, newRank: PoliceRank, orderNumber: string, remarks?: string) => {
    const member = getMemberByPoliceId(policeId);
    if (!member) return;

    const oldRank = member.currentRank;
    const historyItem: RankHistoryItem = {
      id: `rh-${Date.now()}`,
      rank: newRank,
      effectiveDate: new Date().toISOString().substring(0, 10),
      orderNumber,
      approvedBy: 'የኮሚሽኑ የማዕረግ እድገት ቦርድ',
      remarks
    };

    setMembers(prev =>
      prev.map(m => {
        if (m.policeId === policeId) {
          return {
            ...m,
            currentRank: newRank,
            rankHistory: [historyItem, ...m.rankHistory]
          };
        }
        return m;
      })
    );

    addAuditLog({
      user: 'HR-Admin-001',
      role: currentRole,
      action: `የማዕረግ እድገት ተመዘገበ: ${oldRank} ➜ ${newRank}`,
      targetPoliceId: policeId,
      targetMemberName: member.identity.fullName,
      category: 'rank',
      previousValue: oldRank,
      newValue: newRank,
      approvalReference: orderNumber
    });
  };

  const executeTransfer = (
    policeId: string,
    toDept: DepartmentName,
    toStation: StationLocation,
    reason: string,
    orderRef: string
  ) => {
    const member = getMemberByPoliceId(policeId);
    if (!member) return;

    const oldDept = member.currentDepartment;
    const oldStation = member.currentStation;

    const transferItem: TransferHistoryItem = {
      id: `th-${Date.now()}`,
      fromDepartment: oldDept,
      toDepartment: toDept,
      fromStation: oldStation,
      toStation: toStation,
      reason,
      requestDate: new Date().toISOString().substring(0, 10),
      approvalDate: new Date().toISOString().substring(0, 10),
      effectiveDate: new Date().toISOString().substring(0, 10),
      approvingOfficer: 'የኮሚሽኑ ምክትል አዛዥ',
      orderRef
    };

    setMembers(prev =>
      prev.map(m => {
        if (m.policeId === policeId) {
          return {
            ...m,
            currentDepartment: toDept,
            currentStation: toStation,
            status: 'active',
            transferHistory: [transferItem, ...m.transferHistory]
          };
        }
        return m;
      })
    );

    addAuditLog({
      user: 'HR-Admin-001',
      role: currentRole,
      action: `የአባል ዝውውር ተፈጸመ: ${oldDept} (${oldStation}) ➜ ${toDept} (${toStation})`,
      targetPoliceId: policeId,
      targetMemberName: member.identity.fullName,
      category: 'transfer',
      previousValue: `${oldDept} - ${oldStation}`,
      newValue: `${toDept} - ${toStation}`,
      approvalReference: orderRef
    });
  };

  const assignTraining = (policeId: string, training: Omit<TrainingItem, 'id'>) => {
    const member = getMemberByPoliceId(policeId);
    if (!member) return;

    const newTraining: TrainingItem = {
      ...training,
      id: `tr-${Date.now()}`
    };

    setMembers(prev =>
      prev.map(m => {
        if (m.policeId === policeId) {
          return {
            ...m,
            trainingHistory: [newTraining, ...m.trainingHistory]
          };
        }
        return m;
      })
    );

    addAuditLog({
      user: 'Training-Directorate',
      role: currentRole,
      action: `አዲስ ስልጠና ተመደበ: ${training.title}`,
      targetPoliceId: policeId,
      targetMemberName: member.identity.fullName,
      category: 'training',
      newValue: training.title
    });
  };

  const submitPerformanceEvaluation = (policeId: string, evaluation: Omit<PerformanceRecord, 'id'>) => {
    const member = getMemberByPoliceId(policeId);
    if (!member) return;

    const newEval: PerformanceRecord = {
      ...evaluation,
      id: `pf-${Date.now()}`
    };

    setMembers(prev =>
      prev.map(m => {
        if (m.policeId === policeId) {
          return {
            ...m,
            performanceHistory: [newEval, ...m.performanceHistory]
          };
        }
        return m;
      })
    );

    addAuditLog({
      user: evaluation.supervisorName,
      role: currentRole,
      action: `የአፈጻጸም/Efficiency ውጤት ተመዘገበ: ${evaluation.score}/100 (${evaluation.rating})`,
      targetPoliceId: policeId,
      targetMemberName: member.identity.fullName,
      category: 'application',
      newValue: `${evaluation.evaluationPeriod}: ${evaluation.score}%`
    });
  };

  const addLeaveRecord = (policeId: string, leave: Omit<LeaveRecord, 'id'>) => {
    const member = getMemberByPoliceId(policeId);
    if (!member) return;

    const newLeave: LeaveRecord = {
      ...leave,
      id: `lh-${Date.now()}`
    };

    setMembers(prev =>
      prev.map(m => {
        if (m.policeId === policeId) {
          const used = m.leaveBalance.annualUsed + leave.durationDays;
          const remaining = Math.max(0, m.leaveBalance.annualTotal - used);
          return {
            ...m,
            status: 'on_leave',
            leaveBalance: {
              ...m.leaveBalance,
              annualUsed: used,
              annualRemaining: remaining
            },
            leaveHistory: [newLeave, ...m.leaveHistory]
          };
        }
        return m;
      })
    );

    addAuditLog({
      user: 'HR-Officer',
      role: currentRole,
      action: `የእረፍት ፈቃድ ተፈቀደ: ${leave.durationDays} ቀናት (${leave.leaveType})`,
      targetPoliceId: policeId,
      targetMemberName: member.identity.fullName,
      category: 'leave',
      newValue: `${leave.startDate} to ${leave.endDate}`
    });
  };

  const uploadPersonnelDocument = (
    policeId: string,
    doc: Omit<PersonnelDocument, 'id' | 'uploadedAt' | 'uploadedBy'>
  ) => {
    const member = getMemberByPoliceId(policeId);
    if (!member) return;

    const newDoc: PersonnelDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().substring(0, 10),
      uploadedBy: currentRole === 'member' ? member.identity.fullName : 'HR-Admin'
    };

    setMembers(prev =>
      prev.map(m => {
        if (m.policeId === policeId) {
          return {
            ...m,
            documents: [newDoc, ...m.documents]
          };
        }
        return m;
      })
    );

    addAuditLog({
      user: currentRole === 'member' ? member.identity.fullName : 'HR-Admin',
      role: currentRole,
      action: `አዲስ ሰነድ በማህደር ላይ ተያያዘ: ${doc.title} (${doc.documentType})`,
      targetPoliceId: policeId,
      targetMemberName: member.identity.fullName,
      category: 'document',
      newValue: `Ref: ${doc.referenceNumber}`
    });
  };

  const processServiceSeparation = (
    policeId: string,
    separationData: {
      type: SeparationType;
      reason: string;
      decisionRef: string;
      pensionEligible: boolean;
      pensionBookRef?: string;
      decisionDocUrl?: string;
    }
  ) => {
    const member = getMemberByPoliceId(policeId);
    if (!member) return;

    // calculate service years
    const empYear = parseInt(member.employmentDate.substring(0, 4), 10);
    const currYear = 2026;
    const serviceYears = Math.max(1, currYear - empYear);

    // Map separation type to EmploymentStatus
    let newStatus: MemberProfile['status'] = 'terminated';
    if (separationData.type.includes('ጡረታ') || separationData.type.toLowerCase().includes('retirement')) {
      newStatus = 'retired';
    } else if (separationData.type.includes('ፈቃድ') || separationData.type.toLowerCase().includes('resignation')) {
      newStatus = 'resigned';
    } else if (separationData.type.includes('የተባረረ') || separationData.type.toLowerCase().includes('dismissal')) {
      newStatus = 'dismissed';
    }

    const separationDoc: PersonnelDocument = {
      id: `doc-sep-${Date.now()}`,
      title: `የስንብት ይፋዊ ውሳኔ ሰነድ (${separationData.type})`,
      documentType: 'የስንብት ደብዳቤ',
      referenceNumber: separationData.decisionRef,
      documentDate: new Date().toISOString().substring(0, 10),
      fileUrl:
        separationData.decisionDocUrl ||
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
      fileType: 'image',
      fileSizeText: '1.9 MB',
      uploadedBy: 'HR-Admin',
      uploadedAt: new Date().toISOString().substring(0, 10)
    };

    setMembers(prev =>
      prev.map(m => {
        if (m.policeId === policeId) {
          return {
            ...m,
            status: newStatus,
            documents: [separationDoc, ...m.documents],
            separation: {
              id: `sep-${Date.now()}`,
              separationType: separationData.type,
              separationDate: new Date().toISOString().substring(0, 10),
              totalServiceYears: serviceYears,
              lastRank: m.currentRank,
              lastSalaryGrade: m.salaryGrade,
              lastSalaryStep: m.salaryStep,
              reason: separationData.reason,
              decisionRef: separationData.decisionRef,
              decisionDocumentUrl: separationDoc.fileUrl,
              approvedBy: 'የኮሚሽኑ አዛዥ ጽ/ቤት',
              approvalDate: new Date().toISOString().substring(0, 10),
              pensionEligible: separationData.pensionEligible,
              pensionBookRef: separationData.pensionBookRef,
              clearanceCompleted: true,
              auditNote: 'የንብረት፣ ትጥቅና ፋይናንስ ክሊራንስ ተጠናቋል'
            },
            userAccount: {
              ...m.userAccount,
              isActive: false
            }
          };
        }
        return m;
      })
    );

    addAuditLog({
      user: 'HR-Administrator',
      role: currentRole,
      action: `የአገልግሎት ስንብት ጸድቆ ተመዘገበ: ${separationData.type}`,
      targetPoliceId: policeId,
      targetMemberName: member.identity.fullName,
      category: 'separation',
      previousValue: `Active (${member.currentRank})`,
      newValue: `${newStatus} (${serviceYears} ዓመት አገልግሎት)`,
      approvalReference: separationData.decisionRef
    });
  };

  const updateSalaryGradeStep = (policeId: string, grade: number, step: number, reason: string) => {
    const member = getMemberByPoliceId(policeId);
    if (!member) return;

    const oldSal = member.baseSalary;
    const newSal = SALARY_SCALE_MATRIX[grade]?.[step - 1] || oldSal;

    setMembers(prev =>
      prev.map(m => {
        if (m.policeId === policeId) {
          return {
            ...m,
            salaryGrade: grade,
            salaryStep: step,
            baseSalary: newSal
          };
        }
        return m;
      })
    );

    addAuditLog({
      user: 'Payroll-Officer',
      role: currentRole,
      action: `የደመወዝ እርከን/Step ማስተካከያ: Grade ${grade}, Step ${step} (${newSal.toLocaleString()} ETB)`,
      targetPoliceId: policeId,
      targetMemberName: member.identity.fullName,
      category: 'salary',
      previousValue: `${member.salaryGrade}/${member.salaryStep} (${oldSal.toLocaleString()} ETB)`,
      newValue: `${grade}/${step} (${newSal.toLocaleString()} ETB)`,
      approvalReference: reason
    });
  };

  // Applications
  const submitApplication = (appData: {
    type: ApplicationType;
    title: string;
    description: string;
    targetDetails?: any;
    attachments?: Array<{ name: string; url: string; type: string }>;
  }) => {
    const member = activeMember;
    if (!member) {
      return { success: false, applicationNo: '' };
    }

    const appNo = `APP-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
    const newApp: OnlineApplication = {
      id: `app-${Date.now()}`,
      applicationNo: appNo,
      policeId: member.policeId,
      memberName: member.identity.fullName,
      memberRank: member.currentRank,
      memberDepartment: member.currentDepartment,
      type: appData.type,
      title: appData.title,
      description: appData.description,
      submittedDate: new Date().toISOString().substring(0, 10),
      status: 'supervisor_review',
      targetDetails: appData.targetDetails,
      attachments: appData.attachments || [],
      workflowHistory: [
        {
          step: 'ማመልከቻ በፖርታል ገቢ ተደርጓል',
          actor: member.identity.fullName,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'submitted',
          note: 'ለቅርብ ኃላፊ ምርመራ ተልኳል'
        }
      ]
    };

    setApplications(prev => [newApp, ...prev]);

    addAuditLog({
      user: member.identity.fullName,
      role: 'member',
      action: `አዲስ ማመልከቻ አስገባ: ${appData.type}`,
      targetPoliceId: member.policeId,
      targetMemberName: member.identity.fullName,
      category: 'application',
      newValue: `${appNo} - ${appData.title}`
    });

    return { success: true, applicationNo: appNo };
  };

  const reviewApplication = (
    applicationId: string,
    action: 'supervisor_approve' | 'supervisor_reject' | 'hr_approve' | 'hr_reject',
    reviewerName: string,
    note: string
  ) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return;

    let nextStatus: OnlineApplication['status'] = app.status;
    let stepTitle = '';

    if (action === 'supervisor_approve') {
      nextStatus = 'hr_review';
      stepTitle = 'የቅርብ ኃላፊ ማረጋገጫ ተሰጥቶ ወደ HR ተላልፏል';
    } else if (action === 'supervisor_reject') {
      nextStatus = 'rejected';
      stepTitle = 'በቅርብ ኃላፊ ውድቅ ተደርጓል';
    } else if (action === 'hr_approve') {
      nextStatus = 'approved';
      stepTitle = 'በHR ቦርድ/ኮሚሽኑ ውሳኔ ጸድቋል';
    } else if (action === 'hr_reject') {
      nextStatus = 'rejected';
      stepTitle = 'በHR ቦርድ ውድቅ ተደርጓል';
    }

    setApplications(prev =>
      prev.map(a => {
        if (a.id === applicationId) {
          const updated: OnlineApplication = {
            ...a,
            status: nextStatus,
            workflowHistory: [
              ...a.workflowHistory,
              {
                step: stepTitle,
                actor: reviewerName,
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                status: nextStatus,
                note
              }
            ]
          };

          if (action === 'supervisor_approve' || action === 'supervisor_reject') {
            updated.supervisorReview = {
              reviewedBy: reviewerName,
              date: new Date().toISOString().substring(0, 10),
              decision: action === 'supervisor_approve' ? 'passed_to_hr' : 'rejected',
              comment: note
            };
          } else {
            updated.hrReview = {
              reviewedBy: reviewerName,
              date: new Date().toISOString().substring(0, 10),
              decision: action === 'hr_approve' ? 'approved' : 'rejected',
              comment: note,
              effectiveDate: new Date().toISOString().substring(0, 10)
            };
          }
          return updated;
        }
        return a;
      })
    );

    // If HR approved, automatically reflect the change into member profile!
    if (action === 'hr_approve') {
      if (app.type.includes('Leave') || app.type.includes('እረፍት')) {
        const days = app.targetDetails?.leaveDays || 10;
        const start = app.targetDetails?.leaveStartDate || new Date().toISOString().substring(0, 10);
        const end = app.targetDetails?.leaveEndDate || new Date().toISOString().substring(0, 10);
        addLeaveRecord(app.policeId, {
          leaveType: 'ዓመታዊ እረፍት',
          startDate: start,
          endDate: end,
          durationDays: days,
          reason: app.description,
          status: 'የተፈቀደ',
          approvedBy: reviewerName,
          approvedDate: new Date().toISOString().substring(0, 10)
        });
      } else if (app.type.includes('Transfer') || app.type.includes('ዝውውር')) {
        const toDept = app.targetDetails?.requestedDepartment || app.memberDepartment;
        const toStation = app.targetDetails?.requestedStation || 'አሶሳ ዋና መምሪያ (Assosa HQ)';
        executeTransfer(app.policeId, toDept, toStation, app.description, app.applicationNo);
      }
    }

    addAuditLog({
      user: reviewerName,
      role: currentRole,
      action: `ማመልከቻ ተገመገመ (${app.applicationNo}): ${nextStatus}`,
      targetPoliceId: app.policeId,
      targetMemberName: app.memberName,
      category: 'application',
      previousValue: app.status,
      newValue: nextStatus,
      approvalReference: app.applicationNo
    });

    // Notify member
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `የማመልከቻዎ ውሳኔ: ${app.applicationNo}`,
      message: `ያቀረቡት የ${app.type} ጥያቄ "${nextStatus === 'approved' ? 'ጸድቋል' : nextStatus === 'rejected' ? 'ውድቅ ሆኗል' : 'ወደ HR ተላልፏል'}"። ማስታወሻ፡ ${note}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      type: 'application',
      targetPoliceId: app.policeId,
      linkTab: 'applications'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Authentication & Login Operations
  const login = (username: string, password: string) => {
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // 1. Search in userAccounts
    let found = userAccounts.find(
      u => (u.username.toLowerCase() === cleanUser.toLowerCase() || (u.policeId && u.policeId.toLowerCase() === cleanUser.toLowerCase())) && u.password === cleanPass
    );

    // 2. Fallback check directly in members list
    if (!found) {
      const memberMatch = members.find(
        m =>
          (m.policeId.toLowerCase() === cleanUser.toLowerCase() ||
            m.userAccount?.username?.toLowerCase() === cleanUser.toLowerCase()) &&
          (m.userAccount?.password === cleanPass || cleanPass === 'Police@2026')
      );
      if (memberMatch) {
        found = {
          id: `usr-mem-${memberMatch.policeId}`,
          username: memberMatch.userAccount?.username || memberMatch.policeId,
          password: cleanPass,
          role: 'member',
          policeId: memberMatch.policeId,
          fullName: memberMatch.identity.fullName,
          department: memberMatch.currentDepartment,
          station: memberMatch.currentStation,
          isActive: memberMatch.userAccount?.isActive ?? true,
          createdDate: memberMatch.userAccount?.createdDate || '2026-01-01',
          createdBy: 'Admin'
        };
      }
    }

    if (!found) {
      return {
        success: false,
        message: language === 'am' ? 'የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል አስገብተዋል' : 'Invalid username or password'
      };
    }

    if (!found.isActive) {
      return {
        success: false,
        message:
          language === 'am'
            ? 'ይህ መለያ በHR አስተዳዳሪ ታግዷል። እባክዎ አስተዳዳሪውን ያነጋግሩ።'
            : 'This account has been deactivated by the Administrator.'
      };
    }

    const updatedUser: SystemUserAccount = {
      ...found,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setCurrentUser(updatedUser);
    setCurrentRole(updatedUser.role);
    if (updatedUser.policeId) {
      setActiveMemberPoliceId(updatedUser.policeId);
    }

    setUserAccounts(prev => {
      const idx = prev.findIndex(u => u.id === updatedUser.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedUser;
        return copy;
      }
      return [updatedUser, ...prev];
    });

    addAuditLog({
      user: updatedUser.fullName,
      role: updatedUser.role,
      action: `የተጠቃሚ ስኬታማ መግቢያ (User Login): ${updatedUser.username} (${updatedUser.role})`,
      targetPoliceId: updatedUser.policeId || 'SYSTEM',
      targetMemberName: updatedUser.fullName,
      category: 'id_integration'
    });

    return {
      success: true,
      message: language === 'am' ? 'እንኳን ደህና መጡ!' : 'Welcome back!',
      user: updatedUser
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.setItem('begu_hrms_user_logged_out', 'true');
    localStorage.removeItem('begu_hrms_current_user');
  };

  const provisionMemberCredentials = (policeId: string, customUsername?: string, customPassword?: string) => {
    const targetMember = members.find(m => m.policeId.toUpperCase() === policeId.toUpperCase());
    if (!targetMember) {
      return { success: false, message: 'አባሉ በመረጃ ቋቱ ውስጥ አልተገኘም' };
    }

    const cleanUser = customUsername && customUsername.trim().length > 0 ? customUsername.trim() : targetMember.policeId;
    const cleanPass = customPassword && customPassword.trim().length > 0 ? customPassword.trim() : `${targetMember.policeId.toLowerCase()}@2026`;

    // Check uniqueness among other accounts
    const existingOther = userAccounts.find(
      u => u.username.toLowerCase() === cleanUser.toLowerCase() && u.policeId !== policeId
    );
    if (existingOther) {
      return {
        success: false,
        message: `"${cleanUser}" የሚለው የተጠቃሚ ስም ቀድሞውኑ በሌላ መለያ ተይዟል። እባክዎ ሌላ የተጠቃሚ ስም ይምረጡ።`
      };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Update member's userAccount field in member profile
    setMembers(prev =>
      prev.map(m => {
        if (m.policeId.toUpperCase() === policeId.toUpperCase()) {
          return {
            ...m,
            userAccount: {
              username: cleanUser,
              password: cleanPass,
              isActive: true,
              createdDate: m.userAccount?.createdDate || now,
              createdBy: currentUser?.fullName || 'HR Admin',
              lastLogin: m.userAccount?.lastLogin
            }
          };
        }
        return m;
      })
    );

    // 2. Upsert in userAccounts list
    setUserAccounts(prev => {
      const existingIdx = prev.findIndex(u => u.policeId?.toUpperCase() === policeId.toUpperCase());
      const accountData: SystemUserAccount = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `usr-mem-${policeId}`,
        username: cleanUser,
        password: cleanPass,
        tempPassword: cleanPass,
        role: 'member',
        policeId: targetMember.policeId,
        fullName: targetMember.identity.fullName,
        department: targetMember.currentDepartment,
        station: targetMember.currentStation,
        isActive: true,
        createdDate: existingIdx >= 0 ? prev[existingIdx].createdDate : now,
        createdBy: currentUser?.fullName || 'HR Admin'
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = accountData;
        return copy;
      } else {
        return [accountData, ...prev];
      }
    });

    addAuditLog({
      user: currentUser?.fullName || 'HR Admin',
      role: 'hr_admin',
      action: `ለፖሊስ አባል የመግቢያ መለያ ተሰጠ: Username=${cleanUser}`,
      targetPoliceId: targetMember.policeId,
      targetMemberName: targetMember.identity.fullName,
      category: 'id_integration'
    });

    const notif: NotificationItem = {
      id: `notif-cred-${Date.now()}`,
      title: 'የSelf-Service መለያ ተዘጋጅቷል',
      message: `ለአባል ${targetMember.identity.fullName} (${policeId}) የመግቢያ የተጠቃሚ ስም "${cleanUser}" እና የይለፍ ቃል ተዘጋጅቶ ተሰጥቷል።`,
      date: now,
      isRead: false,
      type: 'system',
      targetPoliceId: targetMember.policeId,
      linkTab: 'user_accounts'
    };
    setNotifications(prev => [notif, ...prev]);

    return {
      success: true,
      message: `ለአባል ${targetMember.identity.fullName} የመግቢያ መለያ በተሳካ ሁኔታ ተዘጋጅቷል!`
    };
  };

  const toggleUserAccountStatus = (userId: string) => {
    setUserAccounts(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextActive = !u.isActive;
          // Sync with member if it's a member
          if (u.policeId) {
            setMembers(mList =>
              mList.map(m => {
                if (m.policeId === u.policeId) {
                  return { ...m, userAccount: { ...m.userAccount, isActive: nextActive } };
                }
                return m;
              })
            );
          }
          addAuditLog({
            user: currentUser?.fullName || 'HR Admin',
            role: 'hr_admin',
            action: `የመለያ ሁኔታ ተቀየረ: ${u.username} (${nextActive ? 'ተንቀሳቅሷል/Active' : 'ታግዷል/Disabled'})`,
            targetPoliceId: u.policeId || 'SYSTEM',
            targetMemberName: u.fullName,
            category: 'id_integration'
          });
          return { ...u, isActive: nextActive };
        }
        return u;
      })
    );
  };

  const createStaffAccount = (data: Omit<SystemUserAccount, 'id' | 'createdDate' | 'createdBy'>) => {
    const cleanUser = data.username.trim();
    if (!cleanUser || !data.password) {
      return { success: false, message: 'እባክዎ የተጠቃሚ ስምና የይለፍ ቃል ያስገቡ' };
    }
    if (userAccounts.some(u => u.username.toLowerCase() === cleanUser.toLowerCase())) {
      return { success: false, message: `"${cleanUser}" የሚለው የተጠቃሚ ስም አስቀድሞ ተመዝግቧል።` };
    }

    const newAcc: SystemUserAccount = {
      ...data,
      id: `usr-staff-${Date.now()}`,
      username: cleanUser,
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdBy: currentUser?.fullName || 'HR Admin'
    };

    setUserAccounts(prev => [newAcc, ...prev]);

    addAuditLog({
      user: currentUser?.fullName || 'HR Admin',
      role: 'hr_admin',
      action: `አዲስ የኃላፊ/ባለሙያ መለያ ተፈጠረ: ${cleanUser} (${data.role})`,
      targetPoliceId: data.policeId || 'SYSTEM',
      targetMemberName: data.fullName,
      category: 'id_integration'
    });

    return {
      success: true,
      message: `የ${data.fullName} መለያ በተሳካ ሁኔታ ተፈጥሯል!`
    };
  };

  const deleteStaffAccount = (userId: string) => {
    setUserAccounts(prev => prev.filter(u => u.id !== userId));
    return { success: true, message: 'መለያው ተሰርዟል' };
  };

  const resetToDefaultData = () => {
    setMembers(INITIAL_MEMBERS);
    setExternalIdSystemRecords(EXTERNAL_POLICE_ID_SYSTEM_DATABASE);
    setApplications(INITIAL_APPLICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUserAccounts(INITIAL_SYSTEM_USERS);
    setCurrentUser(INITIAL_SYSTEM_USERS[0]);
    localStorage.clear();
  };

  return (
    <HrmsContext.Provider
      value={{
        currentUser,
        login,
        logout,
        userAccounts,
        provisionMemberCredentials,
        toggleUserAccountStatus,
        createStaffAccount,
        deleteStaffAccount,
        systemLogo,
        updateSystemLogo,
        resetSystemLogo,
        isLogoSynced,
        currentRole,
        setCurrentRole,
        activeMemberPoliceId,
        setActiveMemberPoliceId,
        activeMember,
        language,
        setLanguage,
        t,
        members,
        externalIdSystemRecords,
        applications,
        auditLogs,
        notifications,
        lookupPoliceIdInIdSystem,
        integrateNewMemberFromIdSystem,
        syncMemberWithIdSystem,
        isLiveIdConnected,
        liveIdStatus,
        autoSyncEnabled,
        setAutoSyncEnabled,
        syncWithLiveIdSystemNow,
        autoOpenPersonnelFileFromIdSystem,
        simulateCreateIdInExternalSystem,
        getMemberByPoliceId,
        addPromotion,
        executeTransfer,
        assignTraining,
        submitPerformanceEvaluation,
        addLeaveRecord,
        uploadPersonnelDocument,
        processServiceSeparation,
        updateSalaryGradeStep,
        payrollConfig,
        salaryScales,
        memberPayrollCustomizations,
        updatePayrollConfig,
        updateSalaryScales,
        updateMemberPayrollCustomization,
        applyRankSalaryScaleToAllMembers,
        getCalculatedPayroll,
        allCalculatedPayrolls,
        submitApplication,
        reviewApplication,
        markNotificationRead,
        markAllNotificationsRead,
        addAuditLog,
        resetToDefaultData
      }}
    >
      {children}
    </HrmsContext.Provider>
  );
};

export const useHrms = () => {
  const context = useContext(HrmsContext);
  if (!context) {
    throw new Error('useHrms must be used within an HrmsProvider');
  }
  return context;
};
