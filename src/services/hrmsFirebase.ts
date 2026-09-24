import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  getDocs
} from 'firebase/firestore';
import {
  PayrollGlobalConfig,
  RankSalaryGradeScale,
  MemberPayrollCustomization
} from '../types/hrms';

export interface SystemBrandingConfig {
  logoUrl: string;
  logoName?: string;
  commissionNameAm?: string;
  commissionNameEn?: string;
  updatedAt: string;
  updatedBy: string;
}

// User-provided Firebase configuration for Begu Police HRMS
export const hrmsFirebaseConfig = {
  apiKey: "AIzaSyCrMbP_NL8aseUYkqXjQUa4frflCquhCig",
  authDomain: "begu-police-hrms.firebaseapp.com",
  projectId: "begu-police-hrms",
  storageBucket: "begu-police-hrms.firebasestorage.app",
  messagingSenderId: "897086099817",
  appId: "1:897086099817:web:05f7ef3e84bc6242af2df8",
  measurementId: "G-RF7Y00Z3P2"
};

// Initialize Firebase App for Begu Police HRMS
let hrmsApp: any = null;
let hrmsDb: any = null;

try {
  const existingApps = getApps();
  const defaultApp = existingApps.find(app => app.name === '[DEFAULT]');
  if (defaultApp) {
    hrmsApp = defaultApp;
  } else {
    hrmsApp = initializeApp(hrmsFirebaseConfig);
  }
  hrmsDb = getFirestore(hrmsApp);
} catch (error) {
  console.warn('Firebase initialization error for HRMS:', error);
}

export { hrmsApp, hrmsDb };

const BRANDING_COLLECTION = 'system_settings';
const BRANDING_DOC_ID = 'branding';
const LOCAL_STORAGE_KEY = 'begu_hrms_system_logo';

/**
 * Subscribe in real-time to system branding and logo changes in Cloud Firestore.
 * This guarantees that when the Admin uploads a logo, EVERY logged-in user,
 * member self-service portal, and login screen updates immediately!
 */
export const subscribeToSystemBranding = (
  onUpdate: (branding: SystemBrandingConfig) => void,
  onError?: (err: any) => void
) => {
  if (!hrmsDb) {
    // If offline or failed, fallback to local storage
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        onUpdate(JSON.parse(cached));
      } catch {
        onUpdate({
          logoUrl: cached,
          updatedAt: new Date().toISOString(),
          updatedBy: 'Offline Cache'
        });
      }
    }
    return () => {};
  }

  const brandingDocRef = doc(hrmsDb, BRANDING_COLLECTION, BRANDING_DOC_ID);

  const unsubscribe = onSnapshot(
    brandingDocRef,
    docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SystemBrandingConfig;
        if (data.logoUrl) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          onUpdate(data);
        }
      }
    },
    error => {
      console.warn('Firestore branding subscription notice:', error);
      if (onError) onError(error);
      // Fallback to cache
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {
          // ignore
        }
      }
    }
  );

  return unsubscribe;
};

/**
 * Save / upload system logo to Cloud Firestore so it reflects globally.
 */
export const saveSystemBrandingToFirebase = async (
  logoUrl: string,
  adminName: string,
  logoName?: string
): Promise<{ success: boolean; message: string }> => {
  const brandingData: SystemBrandingConfig = {
    logoUrl,
    logoName: logoName || 'Official Commission Logo',
    commissionNameAm: 'የቤኒሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን',
    commissionNameEn: 'Benishangul Gumuz Police Commission',
    updatedAt: new Date().toISOString(),
    updatedBy: adminName || 'HR Admin'
  };

  // Always update local cache immediately for zero latency
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(brandingData));

  if (!hrmsDb) {
    return {
      success: true,
      message: 'ሎጎው በአሳሽዎ ማህደር ላይ ተቀምጧል (Firebase Db Offline)'
    };
  }

  try {
    const brandingDocRef = doc(hrmsDb, BRANDING_COLLECTION, BRANDING_DOC_ID);
    await setDoc(brandingDocRef, brandingData, { merge: true });
    return {
      success: true,
      message: 'የኮሚሽኑ ሎጎ በክላውድ ዳታቤዝ በተሳካ ሁኔታ ተቀምጧል! አሁን ለሁሉም ተጠቃሚዎች ይታያል።'
    };
  } catch (err: any) {
    console.error('Error saving branding to Firestore:', err);
    return {
      success: false,
      message: `በክላውድ ዳታቤዝ ማስቀመጥ አልተቻለም: ${err?.message || 'ያልታወቀ ስህተት'}`
    };
  }
};

/**
 * Helper to compress and resize images from gallery before upload
 * Keeps payload lightweight (<150KB) for instantaneous Firestore storage and rapid load.
 */
export const compressImageForLogo = (
  file: File,
  maxWidth = 320,
  maxHeight = 320,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png', quality);
        resolve(dataUrl);
      };
      img.onerror = err => reject(err);
    };
    reader.onerror = err => reject(err);
  });
};

// ----------------- Payroll Configuration & Firestore Collections ----------------- //
const PAYROLL_COLLECTION = 'payroll_configs';
const PAYROLL_GLOBAL_DOC = 'global_rules';

const SALARY_SCALE_COLLECTION = 'salary_scales';
const SALARY_SCALE_DOC = 'rank_matrix';

const MEMBER_PAYROLL_COLLECTION = 'member_payrolls';

const LOCAL_PAYROLL_CONFIG_KEY = 'begu_hrms_payroll_config';
const LOCAL_SALARY_SCALES_KEY = 'begu_hrms_salary_scales';
const LOCAL_MEMBER_PAYROLLS_KEY = 'begu_hrms_member_payrolls';

/**
 * Subscribe in real-time to Global Payroll and Deduction Rules in Firestore
 */
export const subscribeToPayrollConfig = (
  onUpdate: (config: PayrollGlobalConfig) => void,
  onError?: (err: any) => void
) => {
  if (!hrmsDb) {
    const cached = localStorage.getItem(LOCAL_PAYROLL_CONFIG_KEY);
    if (cached) {
      try {
        onUpdate(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse cached payroll config', e);
      }
    }
    return () => {};
  }

  const docRef = doc(hrmsDb, PAYROLL_COLLECTION, PAYROLL_GLOBAL_DOC);
  const unsubscribe = onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PayrollGlobalConfig;
        localStorage.setItem(LOCAL_PAYROLL_CONFIG_KEY, JSON.stringify(data));
        onUpdate(data);
      }
    },
    err => {
      console.warn('Firestore payroll config subscription notice:', err);
      if (onError) onError(err);
      const cached = localStorage.getItem(LOCAL_PAYROLL_CONFIG_KEY);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {}
      }
    }
  );

  return unsubscribe;
};

/**
 * Save Global Payroll & Deduction configuration to Firestore
 */
export const savePayrollConfigToFirebase = async (
  config: PayrollGlobalConfig
): Promise<boolean> => {
  localStorage.setItem(LOCAL_PAYROLL_CONFIG_KEY, JSON.stringify(config));

  if (!hrmsDb) {
    return true;
  }

  try {
    const docRef = doc(hrmsDb, PAYROLL_COLLECTION, PAYROLL_GLOBAL_DOC);
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Failed to save payroll config to Firestore:', error);
    return false;
  }
};

/**
 * Subscribe in real-time to Salary Scales Matrix in Firestore
 */
export const subscribeToSalaryScales = (
  onUpdate: (scales: RankSalaryGradeScale[]) => void,
  onError?: (err: any) => void
) => {
  if (!hrmsDb) {
    const cached = localStorage.getItem(LOCAL_SALARY_SCALES_KEY);
    if (cached) {
      try {
        onUpdate(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse cached salary scales', e);
      }
    }
    return () => {};
  }

  const docRef = doc(hrmsDb, SALARY_SCALE_COLLECTION, SALARY_SCALE_DOC);
  const unsubscribe = onSnapshot(
    docRef,
    snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data() as { scales: RankSalaryGradeScale[] };
        if (data.scales && Array.isArray(data.scales)) {
          localStorage.setItem(LOCAL_SALARY_SCALES_KEY, JSON.stringify(data.scales));
          onUpdate(data.scales);
        }
      }
    },
    err => {
      console.warn('Firestore salary scales subscription notice:', err);
      if (onError) onError(err);
      const cached = localStorage.getItem(LOCAL_SALARY_SCALES_KEY);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {}
      }
    }
  );

  return unsubscribe;
};

/**
 * Save Salary Scales Matrix to Firestore
 */
export const saveSalaryScalesToFirebase = async (
  scales: RankSalaryGradeScale[]
): Promise<boolean> => {
  localStorage.setItem(LOCAL_SALARY_SCALES_KEY, JSON.stringify(scales));

  if (!hrmsDb) {
    return true;
  }

  try {
    const docRef = doc(hrmsDb, SALARY_SCALE_COLLECTION, SALARY_SCALE_DOC);
    await setDoc(docRef, {
      scales,
      updatedAt: new Date().toISOString(),
      updatedBy: 'የሰው ኃይልና ፋይናንስ ባለሙያ'
    });
    return true;
  } catch (error) {
    console.error('Failed to save salary scales to Firestore:', error);
    return false;
  }
};

/**
 * Subscribe to all Member Payroll Customizations in Firestore
 */
export const subscribeToMemberPayrollCustomizations = (
  onUpdate: (customizations: Record<string, MemberPayrollCustomization>) => void,
  onError?: (err: any) => void
) => {
  if (!hrmsDb) {
    const cached = localStorage.getItem(LOCAL_MEMBER_PAYROLLS_KEY);
    if (cached) {
      try {
        onUpdate(JSON.parse(cached));
      } catch (e) {
        console.error('Failed to parse cached member payrolls', e);
      }
    }
    return () => {};
  }

  const colRef = collection(hrmsDb, MEMBER_PAYROLL_COLLECTION);
  const unsubscribe = onSnapshot(
    colRef,
    snapshot => {
      const result: Record<string, MemberPayrollCustomization> = {};
      snapshot.forEach(docSnap => {
        const item = docSnap.data() as MemberPayrollCustomization;
        if (item.policeId) {
          result[item.policeId.toUpperCase()] = item;
        }
      });
      localStorage.setItem(LOCAL_MEMBER_PAYROLLS_KEY, JSON.stringify(result));
      onUpdate(result);
    },
    err => {
      console.warn('Firestore member payrolls subscription notice:', err);
      if (onError) onError(err);
      const cached = localStorage.getItem(LOCAL_MEMBER_PAYROLLS_KEY);
      if (cached) {
        try {
          onUpdate(JSON.parse(cached));
        } catch {}
      }
    }
  );

  return unsubscribe;
};

/**
 * Save or update an individual Officer's Payroll customization to Firestore
 */
export const saveMemberPayrollCustomizationToFirebase = async (
  customization: MemberPayrollCustomization
): Promise<boolean> => {
  // Update local storage
  const cached = localStorage.getItem(LOCAL_MEMBER_PAYROLLS_KEY);
  const currentMap: Record<string, MemberPayrollCustomization> = cached ? JSON.parse(cached) : {};
  currentMap[customization.policeId.toUpperCase()] = customization;
  localStorage.setItem(LOCAL_MEMBER_PAYROLLS_KEY, JSON.stringify(currentMap));

  if (!hrmsDb) {
    return true;
  }

  try {
    const docRef = doc(hrmsDb, MEMBER_PAYROLL_COLLECTION, customization.policeId.toUpperCase());
    await setDoc(docRef, {
      ...customization,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Failed to save officer payroll to Firestore:', error);
    return false;
  }
};

