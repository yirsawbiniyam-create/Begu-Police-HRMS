import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { hrmsDb } from './hrmsFirebase';

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

const EXTERNAL_IDS_COLLECTION = 'external_ids';
const LOCAL_EXTERNAL_IDS_KEY = 'begu_hrms_ext_id_records';

/**
 * Fetch one-time all ID records from Firestore
 */
export async function fetchExternalIdRecordsOnce(): Promise<ExternalFirebaseIDRecord[]> {
  if (!hrmsDb) {
    const cached = localStorage.getItem(LOCAL_EXTERNAL_IDS_KEY);
    return cached ? JSON.parse(cached) : [];
  }
  try {
    const idsRef = collection(hrmsDb, EXTERNAL_IDS_COLLECTION);
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
    if (records.length > 0) {
      localStorage.setItem(LOCAL_EXTERNAL_IDS_KEY, JSON.stringify(records));
    }
    return records;
  } catch (err) {
    const cached = localStorage.getItem(LOCAL_EXTERNAL_IDS_KEY);
    return cached ? JSON.parse(cached) : [];
  }
}

/**
 * Subscribe to real-time updates from the Police ID System Firestore
 */
export function subscribeToExternalIdRecords(
  onData: (records: ExternalFirebaseIDRecord[]) => void,
  onError?: (err: any) => void
): () => void {
  // Load cached records immediately
  const cached = localStorage.getItem(LOCAL_EXTERNAL_IDS_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onData(parsed);
      }
    } catch {
      // Ignore cache parse error
    }
  }

  if (!hrmsDb) {
    return () => {};
  }

  try {
    const idsRef = collection(hrmsDb, EXTERNAL_IDS_COLLECTION);
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
        if (records.length > 0) {
          localStorage.setItem(LOCAL_EXTERNAL_IDS_KEY, JSON.stringify(records));
        }
        onData(records);
      },
      (error) => {
        // Fallback gracefully without breaking UI
        if (onError) onError(error);
        const fallback = localStorage.getItem(LOCAL_EXTERNAL_IDS_KEY);
        if (fallback) {
          try {
            onData(JSON.parse(fallback));
          } catch {
            // Ignore
          }
        }
      }
    );

    return unsubscribe;
  } catch (e) {
    return () => {};
  }
}

/**
 * Create a new ID in the external ID system to simulate an ID being created there
 */
export async function createIdInExternalSystem(newIdData: Omit<ExternalFirebaseIDRecord, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
  const localId = `sim-ext-${Date.now()}`;
  const fullRecord: ExternalFirebaseIDRecord = {
    ...newIdData,
    id: localId,
    created_at: newIdData.created_at || new Date().toISOString(),
    status: newIdData.status || 'approved'
  };

  // Always update local cache
  try {
    const cached = localStorage.getItem(LOCAL_EXTERNAL_IDS_KEY);
    const list: ExternalFirebaseIDRecord[] = cached ? JSON.parse(cached) : [];
    list.unshift(fullRecord);
    localStorage.setItem(LOCAL_EXTERNAL_IDS_KEY, JSON.stringify(list));
  } catch {
    // Ignore local storage error
  }

  if (!hrmsDb) {
    return { success: true, id: localId };
  }

  try {
    const idsRef = collection(hrmsDb, EXTERNAL_IDS_COLLECTION);
    const docRef = await addDoc(idsRef, {
      ...newIdData,
      created_at: newIdData.created_at || new Date().toISOString(),
      status: newIdData.status || 'approved'
    });
    return { success: true, id: docRef.id };
  } catch (err: any) {
    // If Firestore fails, the local record was still saved
    return { success: true, id: localId };
  }
}
