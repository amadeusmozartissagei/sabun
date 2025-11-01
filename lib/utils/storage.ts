import { SOAPData, Patient } from '@/types/soap';

const STORAGE_KEYS = {
  PATIENTS: 'soap_patients',
  SOAP_RECORDS: 'soap_records',
} as const;

/**
 * Utility functions untuk local storage
 * Note: Untuk production, sebaiknya menggunakan database yang lebih aman
 */

export const storageUtils = {
  // Patient operations
  getPatients: (): Patient[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return data ? JSON.parse(data) : [];
  },

  savePatient: (patient: Patient): void => {
    if (typeof window === 'undefined') return;
    const patients = storageUtils.getPatients();
    const existingIndex = patients.findIndex((p) => p.id === patient.id);
    
    if (existingIndex >= 0) {
      patients[existingIndex] = patient;
    } else {
      patients.push(patient);
    }
    
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  },

  getPatient: (id: string): Patient | undefined => {
    const patients = storageUtils.getPatients();
    return patients.find((p) => p.id === id);
  },

  deletePatient: (id: string): void => {
    if (typeof window === 'undefined') return;
    const patients = storageUtils.getPatients();
    const filtered = patients.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(filtered));
  },

  // SOAP Records operations
  getSOAPRecords: (patientId?: string): SOAPData[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SOAP_RECORDS);
    const records: SOAPData[] = data ? JSON.parse(data) : [];
    
    if (patientId) {
      return records.filter((r) => r.patientId === patientId);
    }
    
    return records;
  },

  saveSOAPRecord: (record: SOAPData): void => {
    if (typeof window === 'undefined') return;
    const records = storageUtils.getSOAPRecords();
    const existingIndex = records.findIndex((r) => r.id === record.id);
    
    const recordWithTimestamp = {
      ...record,
      updatedAt: new Date().toISOString(),
      createdAt: existingIndex >= 0 ? record.createdAt : new Date().toISOString(),
    };
    
    if (existingIndex >= 0) {
      records[existingIndex] = recordWithTimestamp;
    } else {
      records.push(recordWithTimestamp);
    }
    
    localStorage.setItem(STORAGE_KEYS.SOAP_RECORDS, JSON.stringify(records));
  },

  getSOAPRecord: (id: string): SOAPData | undefined => {
    const records = storageUtils.getSOAPRecords();
    return records.find((r) => r.id === id);
  },

  deleteSOAPRecord: (id: string): void => {
    if (typeof window === 'undefined') return;
    const records = storageUtils.getSOAPRecords();
    const filtered = records.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.SOAP_RECORDS, JSON.stringify(filtered));
  },
};


