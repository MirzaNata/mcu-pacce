import type { MCURecord } from '../types';

const STORAGE_KEY = 'mcu_records';

const getStoredMCUList = (): MCURecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as MCURecord[];
  } catch {
    return [];
  }
};

const saveMCUList = (records: MCURecord[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const mcuService = {
  getMCUByPatientId: (patientId: string): MCURecord | undefined => {
    const list = getStoredMCUList();
    return list.find((mcu) => mcu.patientId === patientId);
  },

  initializeOrGetMCU: (patientId: string): MCURecord => {
    const list = getStoredMCUList();
    const existing = list.find((m) => m.patientId === patientId);

    if (existing) {
      return existing;
    }

    // Inisialisasi awal dengan SEMUA input Tanda Vital KOSONG ('')
    const newRecord: MCURecord = {
      patientId,
      status: 'BELUM_MULAI',
      updatedAt: new Date().toISOString(),
      anamnesis: { complaints: [], otherComplaintText: '', notes: '' },
      generalExamination: {
        systolic: '',
        diastolic: '',
        pulse: '',
        respiratoryRate: '',
        temperature: '',
        oxygenSaturation: '',
        height: '',
        weight: '',
        bmi: '',
        bmiCategory: '',
        notes: '',
      },
      physicalExamination: { bodyParts: {}, notes: '' },
      doctorConclusion: {
        conclusion: '',
        recommendation: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        doctorName: '',
        finalResult: '',
      },
      medicalHistory: {},
      vaccinationHistory: {},
      lifestyle: {},
    };

    list.push(newRecord);
    saveMCUList(list);
    return newRecord;
  },

  saveMCUProgress: (patientId: string, partialData: Partial<MCURecord>): MCURecord => {
    const list = getStoredMCUList();
    const index = list.findIndex((m) => m.patientId === patientId);
    const baseRecord = index >= 0 ? list[index] : mcuService.initializeOrGetMCU(patientId);

    let newStatus = baseRecord.status;
    if (partialData.doctorConclusion?.finalResult) {
      newStatus = 'SELESAI';
    } else if (newStatus === 'BELUM_MULAI') {
      newStatus = 'DALAM_PROSES';
    }

    const updatedRecord: MCURecord = {
      ...baseRecord,
      ...partialData,
      patientId,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      list[index] = updatedRecord;
    } else {
      list.push(updatedRecord);
    }

    saveMCUList(list);
    return updatedRecord;
  },
};