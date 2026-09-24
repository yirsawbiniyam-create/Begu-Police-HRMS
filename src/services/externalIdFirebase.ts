import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

export interface ExternalFirebaseIDRecord {
  id?: string;
  id_number: string;
  full_name_am: string;
  full_name_en: string;
  rank_am: string;
  rank_en: string;
  responsibility_am: string;
  responsibility_en: string;
  phone: string;
  photo_url: string;
  blood_type: string;
  badge_number: string;
  gender: string;
  complexion: string;
  height: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  commissioner_signature?: string;
  member_signature?: string;
  created_at: string;
  issued_at?: string;
  expires_at?: string;
  deleted?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
}

const firebaseConfig = {
  apiKey: "AIzaSyCM1WAt9B_9oq69F0N2Uhzz5gcV2w3PG40",
  authDomain: "bg-police-id-system.firebaseapp.com",
  projectId: "bg-police-id-system",
  storageBucket: "bg-police-id-system.firebasestorage.app",
  messagingSenderId: "754188638677",
  appId: "1:754188638677:web:d50e94dbc8a4aacdb9c55c",
  measurementId: "G-E4XG6QYRVR",
  firestoreDatabaseId: "(default)"
};

// Initialize Firebase App specifically for the external ID system
let externalIdApp: any = null;
let externalDb: any = null;

try {
  const existingApps = getApps();
  const idAppExists = existingApps.find(app => app.name === 'external-id-system');
  if (idAppExists) {
    externalIdApp = idAppExists;
  } else {
    externalIdApp = initializeApp(firebaseConfig, 'external-id-system');
  }
  externalDb = getFirestore(externalIdApp);
} catch (e) {
  console.warn('Could not initialize external ID Firebase app directly, using fallback:', e);
}

/**
 * Fetch one-time all ID records from bg-police-id-system Firestore
 */
export async function fetchExternalIdRecordsOnce(): Promise<ExternalFirebaseIDRecord[]> {
  if (!externalDb) return [];
  try {
    const idsRef = collection(externalDb, 'ids');
    const snapshot = await getDocs(idsRef);
    const records: ExternalFirebaseIDRecord[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as ExternalFirebaseIDRecord;
      if (!data.deleted) {
        records.push({
          ...data,
          id: docSnap.id
        });
      }
    });
    return records;
  } catch (err) {
    console.warn('Failed to fetch from external ID system firestore:', err);
    return [];
  }
}

/**
 * Subscribe to real-time updates from the Police ID System Firestore
 */
export function subscribeToExternalIdRecords(
  onData: (records: ExternalFirebaseIDRecord[]) => void,
  onError?: (err: any) => void
): () => void {
  if (!externalDb) {
    return () => {};
  }

  try {
    const idsRef = collection(externalDb, 'ids');
    const unsubscribe = onSnapshot(
      idsRef,
      (snapshot) => {
        const records: ExternalFirebaseIDRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ExternalFirebaseIDRecord;
          if (!data.deleted) {
            records.push({
              ...data,
              id: docSnap.id
            });
          }
        });
        onData(records);
      },
      (error) => {
        console.warn('Live subscription to external ID system warning/error:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.warn('Error setting up snapshot listener:', e);
    return () => {};
  }
}

/**
 * Create a new ID in the external ID system to simulate an ID being created there
 */
export async function createIdInExternalSystem(newIdData: Omit<ExternalFirebaseIDRecord, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!externalDb) {
    return { success: false, error: 'Database not initialized' };
  }
  try {
    const idsRef = collection(externalDb, 'ids');
    const docRef = await addDoc(idsRef, {
      ...newIdData,
      created_at: newIdData.created_at || new Date().toISOString(),
      status: newIdData.status || 'approved'
    });
    return { success: true, id: docRef.id };
  } catch (err: any) {
    console.error('Error creating record in external ID system:', err);
    return { success: false, error: err?.message || 'Failed to create record' };
  }
}
