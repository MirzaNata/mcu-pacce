export type MCUStatus = 'Pending' | 'In Progress' | 'Completed' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | string;

export interface Patient {
  id: string;
  mcuNumber?: string; // Dibuat opsional agar tidak error saat create patient
  fullName: string;
  nik?: string;
  identityNumber?: string;
  dateOfBirth?: string;
  gender: 'Laki-Laki' | 'Perempuan' | 'L' | 'P';
  age?: number;
  company?: string;
  companyName?: string;
  phoneNumber?: string;
  maritalStatus?: string;
  nationality?: string;
  bloodType?: string;
  rhesus?: string;
  registrationDate?: string; // Dibuat opsional
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  status?: MCUStatus;
}

export interface GeneralExamination {
  systolic?: number | '';
  diastolic?: number | '';
  pulse?: number | '';
  respiratoryRate?: number | '';
  temperature?: number | '';
  oxygenSaturation?: number | '';
  height?: number | '';
  weight?: number | '';
  bmi?: number | '';
  bmiCategory?: string;
  notes?: string;
}

export interface Anamnesis {
  complaints?: string[];
  otherComplaintText?: string;
  notes?: string;
}

export interface MedicalHistoryItem {
  personalHistory?: string;
  familyHistory?: string;
  description?: string;
}

export interface VaccinationItem {
  status?: string;
  date?: string;
  vaccineName?: string;
}

export interface Lifestyle {
  smoking?: {
    status?: string;
    cigarettesPerDay?: number | '';
    durationYears?: number | '';
    notes?: string;
  };
  alcohol?: {
    status?: string;
    bottlesPerDay?: number | '';
    durationYears?: number | '';
    notes?: string;
  };
  teaCoffee?: {
    status?: string;
    isRoutine?: string;
    notes?: string;
  };
  bowel?: {
    status?: string;
    notes?: string;
  };
  bladder?: {
    status?: string;
    notes?: string;
  };
}

export interface PhysicalExamBodyPart {
  status?: string;
  notes?: string;
}

export interface PhysicalExamination {
  bloodPressure?: string;
  bodyParts?: Record<string, PhysicalExamBodyPart>;
  notes?: string;
}

export interface VisionExamination {
  rightEye?: string;
  leftEye?: string;
  bothEyes?: string;
  farRight?: string;
  farLeft?: string;
  colorBlindness?: string;
  notes?: string;
}

export interface AdditionalExamItem {
  id: string;
  name: string;
  status: string;
  notes?: string;
}

export interface SupportingExamItem {
  status?: string;
  notes?: string;
}

export interface SupportingExamination {
  mainExams?: Record<string, SupportingExamItem>;
  additionalExams?: AdditionalExamItem[];
  notes?: string;
}

export interface DoctorConclusion {
  conclusion?: string;
  recommendation?: string;
  finalResult?: 'FIT' | 'FIT_DENGAN_CATATAN' | 'UNFIT' | '';
  doctorName?: string;
  doctorSignature?: string;
  date?: string;
  notes?: string;
}

export interface MCURecord {
  id: string;
  patientId: string;
  generalExamination?: GeneralExamination;
  anamnesis?: Anamnesis;
  medicalHistory?: Record<string, MedicalHistoryItem>;
  vaccinationHistory?: Record<string, VaccinationItem>;
  lifestyle?: Lifestyle;
  physicalExamination?: PhysicalExamination;
  visionExamination?: VisionExamination;
  supportingExamination?: SupportingExamination;
  doctorConclusion?: DoctorConclusion;
  createdAt?: string;
  updatedAt?: string;
}

export type DocumentCategory = 'RADIOLOGY' | 'LAB' | 'EKG' | 'GENERAL' | string;

export interface MCUDocument {
  id: string;
  patientId?: string;
  fileName?: string;
  patientName?: string;
  mcuNumber?: string;
  fileSize?: number;
  fileBlob?: Blob | File;
  fileUrl?: string;
  createdAt?: string;
  uploadDate?: string;
  category?: DocumentCategory;
}

export interface LabResult {
  id?: string;
  patientId?: string;
  testName?: string;
  result?: string;
  unit?: string;
  referenceRange?: string;
  status?: string;
  notes?: string;
  date?: string;
  uploadDate?: string;
  fileDataUrl?: string; // Tambahkan ini
  fileData?: string;    // Tambahkan ini
}