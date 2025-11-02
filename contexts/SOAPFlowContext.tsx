import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SOAPData } from '@/types/soap';

interface SOAPFlowData {
  patientName: string;
  patientId: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface SOAPFlowContextType {
  flowData: Partial<SOAPFlowData>;
  updateFlowData: (data: Partial<SOAPFlowData>) => void;
  clearFlowData: () => void;
  saveToStorage: () => SOAPData;
}

const SOAPFlowContext = createContext<SOAPFlowContextType | undefined>(undefined);

const STORAGE_KEY = 'soap_flow_data';

export const SOAPFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flowData, setFlowData] = useState<Partial<SOAPFlowData>>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return {};
        }
      }
    }
    return {
      date: new Date().toISOString().split('T')[0],
    };
  });

  const updateFlowData = useCallback((data: Partial<SOAPFlowData>) => {
    setFlowData((prev) => {
      const newData = { ...prev, ...data };
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      }
      return newData;
    });
  }, []);

  const clearFlowData = useCallback(() => {
    setFlowData({
      date: new Date().toISOString().split('T')[0],
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const saveToStorage = useCallback(async (): Promise<SOAPData> => {
    const { generateId } = await import('@/lib/utils/validation');
    const { storageUtils } = await import('@/lib/utils/storage');
    
    const soapRecord: SOAPData = {
      id: generateId(),
      patientId: flowData.patientId || generateId(),
      patientName: flowData.patientName || '',
      date: flowData.date || new Date().toISOString().split('T')[0],
      subjective: flowData.subjective || '',
      objective: flowData.objective || '',
      assessment: flowData.assessment || '',
      plan: flowData.plan || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageUtils.saveSOAPRecord(soapRecord);
    clearFlowData();
    
    return soapRecord;
  }, [flowData, clearFlowData]);

  return (
    <SOAPFlowContext.Provider
      value={{
        flowData,
        updateFlowData,
        clearFlowData,
        saveToStorage,
      }}
    >
      {children}
    </SOAPFlowContext.Provider>
  );
};

export const useSOAPFlow = () => {
  const context = useContext(SOAPFlowContext);
  if (context === undefined) {
    throw new Error('useSOAPFlow must be used within a SOAPFlowProvider');
  }
  return context;
};

