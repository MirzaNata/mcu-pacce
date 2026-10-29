import type { Patient } from '../types';

const STORAGE_KEY = 'mcu_patients';

const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    mcuNumber: 'MCU-2026-001',
    fullName: 'Budi Santoso',
    identityNumber: '3507123456780001',
    gender: 'Laki-Laki',
    dateOfBirth: '1988-04-12',
    nationality: 'WNI',
    bloodType: 'O',
    rhesus: '+',
    maritalStatus: 'Menikah',
    phoneNumber: '081234567890',
    address: 'Jl. Raya Pakisaji No. 45, Malang',
    companyName: 'PT Sumber Makmur',
    position: 'Operator Mesin',
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'BELUM_MULAI',
  },
];

export const patientService = {
  getPatients: (): Patient[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
      return INITIAL_PATIENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_PATIENTS;
    }
  },

  getPatientById: (id: string): Patient | null => {
    const patients = patientService.getPatients();
    return patients.find((p) => p.id === id) || null;
  },

  createPatient: (patientData: Omit<Patient, 'id' | 'mcuNumber' | 'registrationDate' | 'status'>): Patient => {
    const patients = patientService.getPatients();
    const count = patients.length + 1;
    const mcuNumber = `MCU-${new Date().getFullYear()}-${count.toString().padStart(3, '0')}`;
    
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      mcuNumber,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'BELUM_MULAI',
    };

    const updatedPatients = [newPatient, ...patients];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPatients));
    return newPatient;
  },

  updatePatient: (id: string, updatedFields: Partial<Omit<Patient, 'id' | 'mcuNumber' | 'registrationDate' | 'status'>>): Patient => {
    const patients = patientService.getPatients();
    const index = patients.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error('Data peserta tidak ditemukan');
    }

    const currentPatient = patients[index];
    const updatedPatient: Patient = {
      ...currentPatient,
      ...updatedFields,
      id: currentPatient.id,
      mcuNumber: currentPatient.mcuNumber,
      registrationDate: currentPatient.registrationDate,
      status: currentPatient.status || 'BELUM_MULAI',
    };

    patients[index] = updatedPatient;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    return updatedPatient;
  },

  deletePatient: (id: string): void => {
    const patients = patientService.getPatients();
    const filtered = patients.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },
};