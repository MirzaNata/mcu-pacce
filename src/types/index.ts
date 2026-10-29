export type Role = 'PETUGAS' | 'ADMIN' | 'DOKTER' | 'LAB' | 'STAFF';

export type MCUStatus = 'BELUM_MULAI' | 'DALAM_PROSES' | 'MENUNGGU_DOKTER' | 'SELESAI';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
}

export interface Patient {
  id: string;
  mcuNumber: string;
  fullName: string;
  identityNumber: string;
  gender: 'Laki-Laki' | 'Perempuan';
  dateOfBirth: string;
  nationality?: string;
  bloodType?: string;
  rhesus?: string;
  maritalStatus?: string;
  phoneNumber: string;
  address: string;
  companyName?: string;
  position?: string;
  registrationDate: string;
  status?: MCUStatus;
}

export interface GeneralExamination {
  systolic: number | '';
  diastolic: number | '';
  pulse: number | '';
  respiratoryRate: number | '';
  temperature: number | '';
  oxygenSaturation: number | '';
  height: number | '';
  weight: number | '';
  bmi: number | '';
  bmiCategory?: 'Underweight' | 'Healthy Weight' | 'Overweight' | 'Obese' | '';
  notes?: string;
}

export interface BodyPartDetail {
  status?: 'Normal' | 'Tidak Normal' | '';
  notes?: string;
}

export interface PhysicalExamination {
  bodyParts?: Record<string, BodyPartDetail>;
  notes?: string;
}

export interface VisionExamination {
  status?: string;
  rightEye?: string;
  leftEye?: string;
  bothEyes?: string;
  colorBlindness?: string;
  notes?: string;
}

export interface SupportingExamDetail {
  status?: 'Normal' | 'Tidak Normal' | '';
  findings?: string;
  conclusion?: string;
  notes?: string;
  reasonNotDone?: string;
}

export interface AdditionalExamItem {
  id: string;
  name: string;
  status?: 'Normal' | 'Tidak Normal' | '';
  notes?: string;
}

export interface SupportingExamination {
  mainExams?: Record<string, SupportingExamDetail>;
  additionalExams?: AdditionalExamItem[];
  notes?: string;
}

export interface DoctorConclusion {
  conclusion: string;
  recommendation: string;
  notes: string;
  date: string;
  doctorName: string;
  finalResult: 'FIT' | 'FIT_DENGAN_CATATAN' | 'UNFIT' | '';
  signature?: string;
}

export interface MedicalHistoryItem {
  personalHistory?: 'Ya' | 'Tidak' | '';
  familyHistory?: 'Ya' | 'Tidak' | '';
  description?: string;
}

export type MedicalHistory = Record<string, MedicalHistoryItem>;

export interface VaccinationItem {
  status?: 'Ya' | 'Tidak' | '';
  date?: string;
  vaccineName?: string;
}

export type VaccinationHistory = Record<string, VaccinationItem>;

export interface SmokingLifestyle {
  status?: string;
  cigarettesPerDay?: number | '';
  durationYears?: number | '';
  notes?: string;
}

export interface AlcoholLifestyle {
  status?: string;
  bottlesPerDay?: number | '';
  durationYears?: number | '';
  notes?: string;
}

export interface TeaCoffeeLifestyle {
  status?: string;
  isRoutine?: string;
  notes?: string;
}

export interface BowelLifestyle {
  status?: string;
  notes?: string;
}

export interface BladderLifestyle {
  status?: string;
  notes?: string;
}

export interface Lifestyle {
  smoking?: SmokingLifestyle;
  alcohol?: AlcoholLifestyle;
  teaCoffee?: TeaCoffeeLifestyle;
  bowel?: BowelLifestyle;
  bladder?: BladderLifestyle;
}

export interface AnamnesisData {
  complaints?: string[];
  otherComplaintText?: string;
  notes?: string;
}

export interface MCURecord {
  patientId: string;
  status: MCUStatus;
  updatedAt: string;
  anamnesis?: AnamnesisData;
  generalExamination?: GeneralExamination;
  physicalExamination?: PhysicalExamination;
  visionExamination?: VisionExamination;
  supportingExamination?: SupportingExamination;
  doctorConclusion?: DoctorConclusion;
  medicalHistory?: MedicalHistory;
  vaccinationHistory?: VaccinationHistory;
  lifestyle?: Lifestyle;
}

export interface LabResult {
  id: string;
  patientId: string;
  patientName: string;
  mcuNumber: string;
  fileName: string;
  fileDataUrl: string;
  fileData?: string;
  uploadDate: string;
  notes?: string;
}

export type DocumentCategory = 'LAB' | 'RADIOLOGY';

export interface MCUDocument {
  id: string;
  patientId: string;
  mcuNumber: string;
  patientName: string;
  identityNumber?: string;
  fileName: string;
  fileSize: number;
  fileBlob: Blob;
  uploadDate: string;
  category: DocumentCategory;
  notes?: string;
}

export interface MCUDocumentMetadata {
  id: string;
  patientId: string;
  mcuNumber: string;
  patientName: string;
  identityNumber?: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  category: DocumentCategory;
  notes?: string;
}