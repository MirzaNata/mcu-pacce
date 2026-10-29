import type { LabResult } from '../types';

const STORAGE_KEY = 'mcu_lab_results';

const getStoredLabResults = (): LabResult[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as LabResult[];
  } catch {
    return [];
  }
};

const saveLabResults = (results: LabResult[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recordsData(results)));
};

const recordsData = (results: LabResult[]): LabResult[] => {
  return results.map((r) => {
    const dataUrl = r.fileDataUrl || r.fileData || '';
    return {
      ...r,
      fileDataUrl: dataUrl,
      fileData: dataUrl,
    };
  });
};

export const labService = {
  getAllLabResults: (): LabResult[] => {
    return recordsData(getStoredLabResults());
  },

  getLabResults: (): LabResult[] => {
    return labService.getAllLabResults();
  },

  getLabResultByPatientId: (patientId: string): LabResult | undefined => {
    const list = labService.getAllLabResults();
    return list.find((r) => r.patientId === patientId);
  },

  uploadLabResult: (data: Omit<LabResult, 'id' | 'uploadDate'>): LabResult => {
    const list = getStoredLabResults();
    const existingIndex = list.findIndex((r) => r.patientId === data.patientId);

    const dataUrl = data.fileDataUrl || data.fileData || '';
    const newResult: LabResult = {
      ...data,
      fileDataUrl: dataUrl,
      fileData: dataUrl,
      id: `lab-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };

    if (existingIndex >= 0) {
      list[existingIndex] = newResult;
    } else {
      list.unshift(newResult);
    }

    saveLabResults(list);
    return newResult;
  },

  deleteLabResult: (id: string): boolean => {
    const list = getStoredLabResults();
    const filtered = list.filter((r) => r.id !== id);
    if (filtered.length === list.length) return false;
    saveLabResults(filtered);
    return true;
  },
};