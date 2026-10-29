import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  User as UserIcon, 
  Activity, 
  ClipboardList, 
  ShieldCheck, 
  Coffee, 
  MessageSquare, 
  Stethoscope,
  Plus,
  Trash2,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Upload,
  X
} from 'lucide-react';
import { mcuService } from '../services/mcuService';
import { patientService } from '../services/patientService';
import { authService } from '../services/authService';
import type { 
  MCURecord, 
  MedicalHistoryItem, 
  VaccinationItem, 
  Lifestyle,
  AdditionalExamItem,
  GeneralExamination,
  DoctorConclusion
} from '../types';

const ANAMNESIS_COMPLAINTS = [
  { id: 'nyeri_dada', label: 'Nyeri dada' },
  { id: 'pusing', label: 'Pusing' },
  { id: 'nyeri_lutut', label: 'Nyeri lutut' },
  { id: 'nyeri_punggung', label: 'Nyeri punggung' },
  { id: 'tremor', label: 'Tremor' },
  { id: 'sesak_napas', label: 'Sesak napas dengan atau tanpa aktivitas' },
  { id: 'diare_sembelit', label: 'Diare/sembelit' },
  { id: 'haid_tidak_teratur', label: 'Siklus haid tidak teratur' },
  { id: 'pingsan_berulang', label: 'Riwayat pingsan berulang' },
  { id: 'masalah_kulit', label: 'Masalah kulit (bentol, eksim, psoriasis)' },
  { id: 'berdebar', label: 'Berdebar' },
  { id: 'batuk', label: 'Batuk' },
  { id: 'nyeri_perut', label: 'Nyeri perut' },
  { id: 'maag', label: 'Maag' },
  { id: 'penurunan_bb', label: 'Penurunan berat badan' },
  { id: 'riwayat_kejang', label: 'Riwayat kejang' },
  { id: 'kaki_bengkak', label: 'Kaki bengkak' },
  { id: 'alergi', label: 'Alergi' },
  { id: 'sakit_kepala', label: 'Sakit kepala' },
  { id: 'demam', label: 'Demam' },
  { id: 'patah_tulang', label: 'Riwayat patah tulang' },
  { id: 'tidak_ada_keluhan', label: 'Tidak ada keluhan' },
  { id: 'lainnya', label: 'Lainnya' },
];

const PHYSICAL_EXAM_ITEMS = [
  { id: 'kepala', label: '1. Kepala' },
  { id: 'mata', label: '2. Mata' },
  { id: 'telinga', label: '3. Telinga' },
  { id: 'hidung', label: '4. Hidung' },
  { id: 'mulut', label: '5. Mulut' },
  { id: 'leher_tenggorokan', label: '6. Leher dan Tenggorokan' },
  { id: 'tonsil', label: '7. Tonsil' },
  { id: 'tiroid', label: '8. Tiroid' },
  { id: 'thorax', label: '9. Thorax' },
  { id: 'paru', label: '10. Paru' },
  { id: 'jantung', label: '11. Jantung' },
  { id: 'abdomen', label: '12. Abdomen' },
  { id: 'ekstremitas', label: '13. Ekstremitas' },
  { id: 'kulit', label: '14. Kulit' },
];

const SUPPORTING_EXAM_ITEMS = [
  { id: 'ekg', label: '1. EKG' },
  { id: 'echocardiography', label: '2. Echocardiography' },
  { id: 'treadmill', label: '3. Treadmill' },
  { id: 'rontgen', label: '4. Rontgen' },
  { id: 'spirometri', label: '5. Spirometri' },
  { id: 'audiometri', label: '6. Audiometri' },
];

const MEDICAL_HISTORY_ITEMS = [
  { id: 'kelainan_kongenital', label: '1. Kelainan kongenital atau bawaan' },
  { id: 'alergi', label: '2. Alergi, termasuk alergi obat-obatan' },
  { id: 'hipertensi', label: '3. Hipertensi' },
  { id: 'penyakit_jantung', label: '4. Penyakit jantung atau pembuluh darah' },
  { id: 'stroke', label: '5. Stroke atau penyakit saraf lainnya' },
  { id: 'diabetes_melitus', label: '6. Diabetes Melitus' },
  { id: 'asma', label: '7. Asma' },
  { id: 'penyakit_tiroid', label: '8. Penyakit kelenjar tiroid' },
  { id: 'penyakit_ginjal', label: '9. Penyakit ginjal' },
  { id: 'kanker_ganas', label: '10. Kanker ganas' },
  { id: 'batu_saluran_kencing', label: '11. Riwayat batu saluran kencing' },
  { id: 'tuberkulosis', label: '12. Tuberkulosis (TB)' },
  { id: 'hepatitis_b', label: '13. Hepatitis B' },
  { id: 'sakit_kritis', label: '14. Riwayat sakit kritis' },
  { id: 'kecelakaan_lalu_lintas', label: '15. Riwayat kecelakaan lalu lintas' },
  { id: 'tindakan_operasi', label: '16. Riwayat tindakan operasi' },
  { id: 'penyakit_kejiwaan', label: '17. Penyakit kejiwaan' },
  { id: 'lainnya', label: '18. Lainnya' },
];

const VACCINATION_ITEMS = [
  { id: 'hepatitis_b', label: '1. Hepatitis B' },
  { id: 'dpt', label: '2. DPT' },
  { id: 'bcg', label: '3. BCG' },
  { id: 'polio', label: '4. Polio' },
  { id: 'hib', label: '5. HiB' },
  { id: 'pcv', label: '6. PCV' },
  { id: 'rotavirus', label: '7. Rotavirus' },
  { id: 'lainnya', label: '8. Lainnya' },
];

export const MCUExamination = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient] = useState(() => (id ? patientService.getPatientById(id) : null));
  const [mcuData, setMcuData] = useState<MCURecord | null>(() => (id ? mcuService.initializeOrGetMCU(id) : null));
  
  const [activeTab, setActiveTab] = useState<
    'vital' | 'anamnesis' | 'medicalHistory' | 'vaccination' | 'lifestyle' | 'physical' | 'supporting' | 'doctor'
  >('vital');
  const [isSaved, setIsSaved] = useState(false);

  const currentUser = authService.getCurrentUser();
  const topRef = useRef<HTMLDivElement>(null);

  const availableTabs: Array<
    'vital' | 'anamnesis' | 'medicalHistory' | 'vaccination' | 'lifestyle' | 'physical' | 'supporting' | 'doctor'
  > = [
    'vital',
    'anamnesis',
    'medicalHistory',
    'vaccination',
    'lifestyle',
    'physical',
    'supporting',
    'doctor',
  ];

  const currentIndex = availableTabs.indexOf(activeTab);
  const isFirstTab = currentIndex <= 0;
  const isLastTab = currentIndex === availableTabs.length - 1;

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handlePrevTab = () => {
    if (!isFirstTab) {
      setActiveTab(availableTabs[currentIndex - 1]);
    }
  };

  const handleNextTab = () => {
    if (!isLastTab) {
      setActiveTab(availableTabs[currentIndex + 1]);
    }
  };

  if (!patient || !mcuData) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Memuat data pemeriksaan MCU...
      </div>
    );
  }

  const handleSaveProgress = (partial: Partial<MCURecord>) => {
    if (!id) return;
    const updated = mcuService.saveMCUProgress(id, partial);
    setMcuData(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const calculateBMIDetails = (
    height: number | '',
    weight: number | ''
  ): { bmi: number | ''; bmiCategory: 'Underweight' | 'Healthy Weight' | 'Overweight' | 'Obese' | '' } => {
    if (typeof height !== 'number' || typeof weight !== 'number' || height <= 0 || weight <= 0 || isNaN(height) || isNaN(weight)) {
      return { bmi: '', bmiCategory: '' };
    }

    const heightInMeters = height / 100;
    const bmiRaw = weight / (heightInMeters * heightInMeters);

    if (!isFinite(bmiRaw) || isNaN(bmiRaw)) {
      return { bmi: '', bmiCategory: '' };
    }

    let category: 'Underweight' | 'Healthy Weight' | 'Overweight' | 'Obese';
    if (bmiRaw < 18.5) {
      category = 'Underweight';
    } else if (bmiRaw < 25.0) {
      category = 'Healthy Weight';
    } else if (bmiRaw < 30.0) {
      category = 'Overweight';
    } else {
      category = 'Obese';
    }

    return {
      bmi: Number(bmiRaw.toFixed(2)),
      bmiCategory: category,
    };
  };

  const handleVitalSignChange = (field: keyof GeneralExamination, value: number | '') => {
    const currentGeneral = mcuData.generalExamination || {
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
    };

    const updatedGeneral = {
      ...currentGeneral,
      [field]: value,
    };

    if (field === 'height' || field === 'weight') {
      const h = field === 'height' ? value : updatedGeneral.height;
      const w = field === 'weight' ? value : updatedGeneral.weight;
      const { bmi, bmiCategory } = calculateBMIDetails(h, w);
      updatedGeneral.bmi = bmi;
      updatedGeneral.bmiCategory = bmiCategory;
    }

    handleSaveProgress({ generalExamination: updatedGeneral });
  };

  const handleComplaintToggle = (complaintId: string) => {
    const currentAnamnesis = mcuData.anamnesis || { complaints: [], otherComplaintText: '', notes: '' };
    const currentComplaints = currentAnamnesis.complaints || [];

    let newComplaints: string[];

    if (complaintId === 'tidak_ada_keluhan') {
      if (currentComplaints.includes('tidak_ada_keluhan')) {
        newComplaints = [];
      } else {
        newComplaints = ['tidak_ada_keluhan'];
      }
    } else {
      const filtered = currentComplaints.filter((c) => c !== 'tidak_ada_keluhan');
      if (filtered.includes(complaintId)) {
        newComplaints = filtered.filter((c) => c !== complaintId);
      } else {
        newComplaints = [...filtered, complaintId];
      }
    }

    handleSaveProgress({
      anamnesis: {
        ...currentAnamnesis,
        complaints: newComplaints,
      },
    });
  };

  const handleOtherComplaintTextChange = (text: string) => {
    const currentAnamnesis = mcuData.anamnesis || { complaints: [], otherComplaintText: '', notes: '' };
    handleSaveProgress({
      anamnesis: {
        ...currentAnamnesis,
        otherComplaintText: text,
      },
    });
  };

  const handlePhysicalBodyPartChange = (
    partId: string,
    field: 'status' | 'notes',
    value: 'Normal' | 'Tidak Normal' | '' | string
  ) => {
    const currentPhysical = mcuData.physicalExamination || { bodyParts: {}, notes: '' };
    const currentBodyParts = currentPhysical.bodyParts || {};
    const currentPart = currentBodyParts[partId] || { status: '', notes: '' };

    const updatedPart = {
      ...currentPart,
      [field]: value,
    };

    const updatedBodyParts = {
      ...currentBodyParts,
      [partId]: updatedPart,
    };

    handleSaveProgress({
      physicalExamination: {
        ...currentPhysical,
        bodyParts: updatedBodyParts,
      },
    });
  };

  const handleMainSupportingExamChange = (
    examId: string,
    field: 'status' | 'notes',
    value: 'Normal' | 'Tidak Normal' | '' | string
  ) => {
    const currentSupporting = mcuData.supportingExamination || { mainExams: {}, additionalExams: [], notes: '' };
    const currentMainExams = currentSupporting.mainExams || {};
    const currentExam = currentMainExams[examId] || { status: '', notes: '' };

    const updatedExam = {
      ...currentExam,
      [field]: value,
    };

    const updatedMainExams = {
      ...currentMainExams,
      [examId]: updatedExam,
    };

    handleSaveProgress({
      supportingExamination: {
        ...currentSupporting,
        mainExams: updatedMainExams,
      },
    });
  };

  const handleAddAdditionalExam = () => {
    const currentSupporting = mcuData.supportingExamination || { mainExams: {}, additionalExams: [], notes: '' };
    const currentAdditional = currentSupporting.additionalExams || [];

    const newItem: AdditionalExamItem = {
      id: `add-exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: '',
      status: '',
      notes: '',
    };

    handleSaveProgress({
      supportingExamination: {
        ...currentSupporting,
        additionalExams: [...currentAdditional, newItem],
      },
    });
  };

  const handleUpdateAdditionalExam = (
    examId: string,
    field: 'name' | 'status' | 'notes',
    value: string
  ) => {
    const currentSupporting = mcuData.supportingExamination || { mainExams: {}, additionalExams: [], notes: '' };
    const currentAdditional = currentSupporting.additionalExams || [];

    const updatedAdditional = currentAdditional.map((item) => {
      if (item.id === examId) {
        return { ...item, [field]: value };
      }
      return item;
    });

    handleSaveProgress({
      supportingExamination: {
        ...currentSupporting,
        additionalExams: updatedAdditional,
      },
    });
  };

  const handleDeleteAdditionalExam = (examId: string) => {
    const currentSupporting = mcuData.supportingExamination || { mainExams: {}, additionalExams: [], notes: '' };
    const currentAdditional = currentSupporting.additionalExams || [];

    const filtered = currentAdditional.filter((item) => item.id !== examId);

    handleSaveProgress({
      supportingExamination: {
        ...currentSupporting,
        additionalExams: filtered,
      },
    });
  };

  const handleMedicalHistoryChange = (
    itemId: string,
    field: keyof MedicalHistoryItem,
    value: string
  ) => {
    const currentMedHistory = mcuData.medicalHistory || {};
    const currentItem = currentMedHistory[itemId] || { personalHistory: '', familyHistory: '', description: '' };
    
    const updatedItem = {
      ...currentItem,
      [field]: value,
    };

    const updatedHistory = {
      ...currentMedHistory,
      [itemId]: updatedItem,
    };

    handleSaveProgress({ medicalHistory: updatedHistory });
  };

  const handleVaccinationChange = (
    itemId: string,
    field: keyof VaccinationItem,
    value: string
  ) => {
    const currentVacHistory = mcuData.vaccinationHistory || {};
    const currentItem = currentVacHistory[itemId] || { status: '', date: '', vaccineName: '' };

    const updatedItem = {
      ...currentItem,
      [field]: value,
    };

    const updatedHistory = {
      ...currentVacHistory,
      [itemId]: updatedItem,
    };

    handleSaveProgress({ vaccinationHistory: updatedHistory });
  };

  const handleLifestyleChange = (
    section: keyof Lifestyle,
    field: string,
    value: string | number
  ) => {
    const currentLifestyle = mcuData.lifestyle || {};
    const currentSection = (currentLifestyle[section] as Record<string, unknown>) || {};

    const updatedSection = {
      ...currentSection,
      [field]: value,
    };

    const updatedLifestyle = {
      ...currentLifestyle,
      [section]: updatedSection,
    };

    handleSaveProgress({ lifestyle: updatedLifestyle });
  };

  const handleSignatureUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const currentDoc = mcuData.doctorConclusion || {
        conclusion: '',
        recommendation: '',
        finalResult: '',
        doctorName: currentUser?.name || 'Dokter Pemeriksa',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      };

      handleSaveProgress({
        doctorConclusion: {
          ...currentDoc,
          notes: currentDoc.notes || '',
          doctorSignature: base64String,
        } as unknown as DoctorConclusion,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    const currentDoc = mcuData.doctorConclusion || {
      conclusion: '',
      recommendation: '',
      finalResult: '',
      doctorName: currentUser?.name || 'Dokter Pemeriksa',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    };

    handleSaveProgress({
      doctorConclusion: {
        ...currentDoc,
        notes: currentDoc.notes || '',
        doctorSignature: '',
      } as unknown as DoctorConclusion,
    });
  };

  const calculateProgress = (): number => {
    let completedSections = 0;
    const totalSections = 7;

    if (mcuData.generalExamination && (mcuData.generalExamination.systolic !== '' || mcuData.generalExamination.pulse !== '' || mcuData.generalExamination.height !== '')) {
      completedSections += 1;
    }
    if (mcuData.anamnesis?.complaints && mcuData.anamnesis.complaints.length > 0) {
      completedSections += 1;
    }
    if (mcuData.medicalHistory && Object.keys(mcuData.medicalHistory).length > 0) {
      completedSections += 1;
    }
    if (mcuData.physicalExamination?.bodyParts && Object.keys(mcuData.physicalExamination.bodyParts).length > 0) {
      completedSections += 1;
    }
    if (mcuData.lifestyle && Object.keys(mcuData.lifestyle).length > 0) {
      completedSections += 1;
    }
    if (mcuData.supportingExamination && (
      (mcuData.supportingExamination.mainExams && Object.keys(mcuData.supportingExamination.mainExams).length > 0) ||
      (mcuData.supportingExamination.additionalExams && mcuData.supportingExamination.additionalExams.length > 0)
    )) {
      completedSections += 1;
    }
    if (mcuData.doctorConclusion?.finalResult) {
      completedSections += 1;
    }

    return Math.round((completedSections / totalSections) * 100);
  };

  const renderBMICategoryBadge = (category?: string) => {
    if (category === 'Underweight') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300">
          Underweight
        </span>
      );
    }
    if (category === 'Healthy Weight' || category === 'Healthyweight') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-green-100 text-green-800 border border-green-300">
          Healthy Weight
        </span>
      );
    }
    if (category === 'Overweight') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-100 text-orange-800 border border-orange-300">
          Overweight
        </span>
      );
    }
    if (category === 'Obese') {
      return (
        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-100 text-red-800 border border-red-300">
          Obese
        </span>
      );
    }
    return <span className="text-gray-400 font-normal">-</span>;
  };

  const docConclusionAny = (mcuData.doctorConclusion || {}) as Record<string, string | undefined>;

  return (
    <div ref={topRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">Pemeriksaan MCU Peserta</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {patient.fullName} • No. MCU: <span className="font-mono text-blue-600 font-bold">{patient.mcuNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Progres Pemeriksaan</span>
            <span className="text-xs font-black text-blue-600">{calculateProgress()}% Selesai</span>
          </div>
          {isSaved && (
            <div className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Data Berhasil Disimpan!
            </div>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('vital')}
          className={`px-3.5 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vital' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="w-4 h-4" /> Tanda Vital
        </button>
        <button
          onClick={() => setActiveTab('anamnesis')}
          className={`px-3.5 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'anamnesis' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Anamnesis (Keluhan)
        </button>
        <button
          onClick={() => setActiveTab('medicalHistory')}
          className={`px-3.5 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'medicalHistory' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Riwayat Kesehatan
        </button>
        <button
          onClick={() => setActiveTab('vaccination')}
          className={`px-3.5 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'vaccination' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Riwayat Vaksinasi
        </button>
        <button
          onClick={() => setActiveTab('lifestyle')}
          className={`px-3.5 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'lifestyle' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Coffee className="w-4 h-4" /> Gaya Hidup & Kebiasaan
        </button>
        <button
          onClick={() => setActiveTab('physical')}
          className={`px-3.5 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'physical' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Pemeriksaan Fisik
        </button>
        <button
          onClick={() => setActiveTab('supporting')}
          className={`px-3.5 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'supporting' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" /> Pemeriksaan Penunjang
        </button>
        <button
          onClick={() => setActiveTab('doctor')}
          className={`px-3.5 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'doctor' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Kesimpulan Dokter
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        {/* A. TAB TANDA VITAL */}
        {activeTab === 'vital' && (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Pemeriksaan Tanda-Tanda Vital & Antropometri</h3>
              <p className="text-xs text-gray-500 mt-0.5">Masukkan data tekanan darah, nadi, respirasi, suhu, saturasi, serta tinggi dan berat badan peserta.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-2">
                <label className="block text-xs font-bold text-gray-800">
                  Tekanan Darah <span className="text-gray-500 font-normal">(mmHg)</span>
                </label>
                <div className="flex items-center gap-3 max-w-md">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Sistol</label>
                    <input
                      type="number"
                      value={mcuData.generalExamination?.systolic ?? ''}
                      onChange={(e) => handleVitalSignChange('systolic', e.target.value === '' ? '' : Number(e.target.value))}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                      placeholder="mis. 120"
                    />
                  </div>
                  <span className="text-gray-400 font-black text-xl pt-5">/</span>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Diastol</label>
                    <input
                      type="number"
                      value={mcuData.generalExamination?.diastolic ?? ''}
                      onChange={(e) => handleVitalSignChange('diastolic', e.target.value === '' ? '' : Number(e.target.value))}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                      placeholder="mis. 80"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Nadi <span className="text-gray-500 font-normal">(x/menit)</span>
                </label>
                <input
                  type="number"
                  value={mcuData.generalExamination?.pulse ?? ''}
                  onChange={(e) => handleVitalSignChange('pulse', e.target.value === '' ? '' : Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="mis. 80"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Laju Napas <span className="text-gray-500 font-normal">(x/menit)</span>
                </label>
                <input
                  type="number"
                  value={mcuData.generalExamination?.respiratoryRate ?? ''}
                  onChange={(e) => handleVitalSignChange('respiratoryRate', e.target.value === '' ? '' : Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="mis. 18"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Suhu Tubuh <span className="text-gray-500 font-normal">(°C)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={mcuData.generalExamination?.temperature ?? ''}
                  onChange={(e) => handleVitalSignChange('temperature', e.target.value === '' ? '' : Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="mis. 36.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Saturasi Oksigen <span className="text-gray-500 font-normal">(%)</span>
                </label>
                <input
                  type="number"
                  value={mcuData.generalExamination?.oxygenSaturation ?? ''}
                  onChange={(e) => handleVitalSignChange('oxygenSaturation', e.target.value === '' ? '' : Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="mis. 98"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Tinggi Badan <span className="text-gray-500 font-normal">(cm)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={mcuData.generalExamination?.height ?? ''}
                  onChange={(e) => handleVitalSignChange('height', e.target.value === '' ? '' : Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="mis. 170"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  Berat Badan <span className="text-gray-500 font-normal">(kg)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={mcuData.generalExamination?.weight ?? ''}
                  onChange={(e) => handleVitalSignChange('weight', e.target.value === '' ? '' : Number(e.target.value))}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="mis. 65"
                />
              </div>

              <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
                <label className="block text-xs font-bold text-blue-900">
                  Body Mass Index <span className="text-gray-500 font-normal">(BMI) & Kategori</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Nilai BMI:</span>
                    <span className="text-sm font-black text-blue-900">
                      {mcuData.generalExamination?.bmi !== '' && mcuData.generalExamination?.bmi !== undefined
                        ? mcuData.generalExamination.bmi
                        : '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Kategori:</span>
                    {renderBMICategoryBadge(mcuData.generalExamination?.bmiCategory)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* B. TAB ANAMNESIS */}
        {activeTab === 'anamnesis' && (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Anamnesis (Keluhan Saat Pemeriksaan)</h3>
              <p className="text-xs text-gray-500 mt-0.5">Pilih satu atau beberapa keluhan yang dialami oleh peserta saat pemeriksaan MCU.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ANAMNESIS_COMPLAINTS.map((item) => {
                const selectedComplaints = mcuData.anamnesis?.complaints || [];
                const isChecked = selectedComplaints.includes(item.id);

                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? item.id === 'tidak_ada_keluhan'
                          ? 'bg-green-50 border-green-300 text-green-900 font-bold'
                          : 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                        : 'bg-gray-50/50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleComplaintToggle(item.id)}
                      className="mt-0.5 rounded-sm text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-medium leading-tight">{item.label}</span>
                  </label>
                );
              })}
            </div>

            {mcuData.anamnesis?.complaints?.includes('lainnya') && (
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2 animate-fade-in">
                <label className="block text-xs font-bold text-blue-900">
                  Jelaskan Keluhan Lainnya <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={mcuData.anamnesis?.otherComplaintText || ''}
                  onChange={(e) => handleOtherComplaintTextChange(e.target.value)}
                  placeholder="Ketik keluhan tambahan peserta di sini..."
                  className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        )}

        {/* C. TAB RIWAYAT KESEHATAN */}
        {activeTab === 'medicalHistory' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Daftar Riwayat Kesehatan Peserta</h3>
              <p className="text-xs text-gray-500 mt-0.5">Pilih status Riwayat Pribadi dan Riwayat Keluarga, serta tambahkan keterangan jika diperlukan.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200 text-gray-700 font-bold text-xs uppercase">
                    <th className="p-3 w-1/3">Jenis Riwayat Kesehatan</th>
                    <th className="p-3 text-center w-1/5">Riwayat Pribadi</th>
                    <th className="p-3 text-center w-1/5">Riwayat Keluarga</th>
                    <th className="p-3 w-1/3">Keterangan / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MEDICAL_HISTORY_ITEMS.map((item) => {
                    const data = mcuData.medicalHistory?.[item.id] || {};
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3 font-semibold text-gray-800 text-xs">{item.label}</td>
                        <td className="p-3 text-center">
                          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
                            <button
                              type="button"
                              onClick={() => handleMedicalHistoryChange(item.id, 'personalHistory', 'Ya')}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                data.personalHistory === 'Ya'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Ya
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMedicalHistoryChange(item.id, 'personalHistory', 'Tidak')}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                data.personalHistory === 'Tidak'
                                  ? 'bg-green-600 text-white shadow-xs'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Tidak
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
                            <button
                              type="button"
                              onClick={() => handleMedicalHistoryChange(item.id, 'familyHistory', 'Ya')}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                data.familyHistory === 'Ya'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Ya
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMedicalHistoryChange(item.id, 'familyHistory', 'Tidak')}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                data.familyHistory === 'Tidak'
                                  ? 'bg-green-600 text-white shadow-xs'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Tidak
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={data.description || ''}
                            onChange={(e) => handleMedicalHistoryChange(item.id, 'description', e.target.value)}
                            placeholder="Catatan / Keterangan..."
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* D. TAB RIWAYAT VAKSINASI */}
        {activeTab === 'vaccination' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Daftar Riwayat Vaksinasi Peserta</h3>
              <p className="text-xs text-gray-500 mt-0.5">Pilih status vaksinasi dan masukkan tanggal pelaksanaan jika tersedia.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200 text-gray-700 font-bold text-xs uppercase">
                    <th className="p-3 w-1/3">Jenis Vaksin</th>
                    <th className="p-3 text-center w-1/4">Status Vaksinasi</th>
                    <th className="p-3 w-1/3">Tanggal Vaksinasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {VACCINATION_ITEMS.map((item) => {
                    const data = mcuData.vaccinationHistory?.[item.id] || {};
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3 font-semibold text-gray-800 text-xs">
                          {item.label}
                          {item.id === 'lainnya' && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={data.vaccineName || ''}
                                onChange={(e) => handleVaccinationChange(item.id, 'vaccineName', e.target.value)}
                                placeholder="Sebutkan Nama Vaksin..."
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                              />
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
                            <button
                              type="button"
                              onClick={() => handleVaccinationChange(item.id, 'status', 'Ya')}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                data.status === 'Ya'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Ya
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVaccinationChange(item.id, 'status', 'Tidak')}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                data.status === 'Tidak'
                                  ? 'bg-gray-600 text-white shadow-xs'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Tidak
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="date"
                            value={data.date || ''}
                            onChange={(e) => handleVaccinationChange(item.id, 'date', e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* E. TAB GAYA HIDUP */}
        {activeTab === 'lifestyle' && (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Gaya Hidup & Kebiasaan Peserta</h3>
              <p className="text-xs text-gray-500 mt-0.5">Isi informasi pola hidup sehari-hari meliputi kebiasaan merokok, alkohol, teh/kopi, serta pencernaan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-black text-xs text-gray-900 uppercase tracking-wider">A. Kebiasaan Merokok</h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Status Perokok</label>
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => handleLifestyleChange('smoking', 'status', 'Ya')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mcuData.lifestyle?.smoking?.status === 'Ya'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLifestyleChange('smoking', 'status', 'Tidak')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mcuData.lifestyle?.smoking?.status === 'Tidak'
                          ? 'bg-green-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>

                {mcuData.lifestyle?.smoking?.status === 'Ya' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Jumlah Batang / Hari</label>
                      <input
                        type="number"
                        value={mcuData.lifestyle?.smoking?.cigarettesPerDay || ''}
                        onChange={(e) => handleLifestyleChange('smoking', 'cigarettesPerDay', e.target.value === '' ? '' : Number(e.target.value))}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                        placeholder="mis. 10"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Lama Kebiasaan (Tahun)</label>
                      <input
                        type="number"
                        value={mcuData.lifestyle?.smoking?.durationYears || ''}
                        onChange={(e) => handleLifestyleChange('smoking', 'durationYears', e.target.value === '' ? '' : Number(e.target.value))}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                        placeholder="mis. 5"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={mcuData.lifestyle?.smoking?.notes || ''}
                    onChange={(e) => handleLifestyleChange('smoking', 'notes', e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="Catatan kebiasaan merokok..."
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-black text-xs text-gray-900 uppercase tracking-wider">B. Konsumsi Alkohol</h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Status Konsumsi Alkohol</label>
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => handleLifestyleChange('alcohol', 'status', 'Ya')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mcuData.lifestyle?.alcohol?.status === 'Ya'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLifestyleChange('alcohol', 'status', 'Tidak')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mcuData.lifestyle?.alcohol?.status === 'Tidak'
                          ? 'bg-green-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>

                {mcuData.lifestyle?.alcohol?.status === 'Ya' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Jumlah Botol / Hari</label>
                      <input
                        type="number"
                        value={mcuData.lifestyle?.alcohol?.bottlesPerDay || ''}
                        onChange={(e) => handleLifestyleChange('alcohol', 'bottlesPerDay', e.target.value === '' ? '' : Number(e.target.value))}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                        placeholder="mis. 1"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Lama Kebiasaan (Tahun)</label>
                      <input
                        type="number"
                        value={mcuData.lifestyle?.alcohol?.durationYears || ''}
                        onChange={(e) => handleLifestyleChange('alcohol', 'durationYears', e.target.value === '' ? '' : Number(e.target.value))}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                        placeholder="mis. 2"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={mcuData.lifestyle?.alcohol?.notes || ''}
                    onChange={(e) => handleLifestyleChange('alcohol', 'notes', e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="Catatan konsumsi alkohol..."
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-black text-xs text-gray-900 uppercase tracking-wider">C. Konsumsi Teh / Kopi</h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Status Konsumsi Teh / Kopi</label>
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => handleLifestyleChange('teaCoffee', 'status', 'Ya')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mcuData.lifestyle?.teaCoffee?.status === 'Ya'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Ya
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLifestyleChange('teaCoffee', 'status', 'Tidak')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mcuData.lifestyle?.teaCoffee?.status === 'Tidak'
                          ? 'bg-gray-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>

                {mcuData.lifestyle?.teaCoffee?.status === 'Ya' && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">Dikonsumsi secara Rutin?</label>
                    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => handleLifestyleChange('teaCoffee', 'isRoutine', 'Ya')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          mcuData.lifestyle?.teaCoffee?.isRoutine === 'Ya'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Ya, Rutin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLifestyleChange('teaCoffee', 'isRoutine', 'Tidak')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          mcuData.lifestyle?.teaCoffee?.isRoutine === 'Tidak'
                            ? 'bg-gray-600 text-white shadow-xs'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Kadang-Kadang
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={mcuData.lifestyle?.teaCoffee?.notes || ''}
                    onChange={(e) => handleLifestyleChange('teaCoffee', 'notes', e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="Catatan konsumsi teh / kopi..."
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200 space-y-3">
                <h4 className="font-black text-xs text-gray-900 uppercase tracking-wider">D. Buang Air Besar (BAB / Bowel)</h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Status BAB</label>
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => handleLifestyleChange('bowel', 'status', 'Normal')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mcuData.lifestyle?.bowel?.status === 'Normal'
                          ? 'bg-green-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLifestyleChange('bowel', 'status', 'Tidak Normal')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mcuData.lifestyle?.bowel?.status === 'Tidak Normal'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Tidak Normal
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={mcuData.lifestyle?.bowel?.notes || ''}
                    onChange={(e) => handleLifestyleChange('bowel', 'notes', e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="Catatan pola BAB..."
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-200 space-y-3 md:col-span-2">
                <h4 className="font-black text-xs text-gray-900 uppercase tracking-wider">E. Buang Air Kecil (BAK / Bladder)</h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Status BAK</label>
                  <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => handleLifestyleChange('bladder', 'status', 'Normal')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mcuData.lifestyle?.bladder?.status === 'Normal'
                          ? 'bg-green-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLifestyleChange('bladder', 'status', 'Tidak Normal')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        mcuData.lifestyle?.bladder?.status === 'Tidak Normal'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Tidak Normal
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Keterangan</label>
                  <input
                    type="text"
                    value={mcuData.lifestyle?.bladder?.notes || ''}
                    onChange={(e) => handleLifestyleChange('bladder', 'notes', e.target.value)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                    placeholder="Catatan pola BAK..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* F. TAB PEMERIKSAAN FISIK */}
        {activeTab === 'physical' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Pemeriksaan Fisik Organ Tubuh (14 Item)</h3>
              <p className="text-xs text-gray-500 mt-0.5">Tentukan status pemeriksaan fisik untuk masing-masing organ tubuh dan catat temuan jika ada.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200 text-gray-700 font-bold text-xs uppercase">
                    <th className="p-3 w-1/3">Organ / Bagian Tubuh</th>
                    <th className="p-3 text-center w-1/3">Status Pemeriksaan</th>
                    <th className="p-3 w-1/3">Keterangan / Temuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PHYSICAL_EXAM_ITEMS.map((item) => {
                    const data = mcuData.physicalExamination?.bodyParts?.[item.id] || {};
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3 font-semibold text-gray-800 text-xs">{item.label}</td>
                        <td className="p-3 text-center">
                          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
                            <button
                              type="button"
                              onClick={() => handlePhysicalBodyPartChange(item.id, 'status', 'Normal')}
                              className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                data.status === 'Normal'
                                  ? 'bg-green-600 text-white shadow-xs'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Normal
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePhysicalBodyPartChange(item.id, 'status', 'Tidak Normal')}
                              className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                data.status === 'Tidak Normal'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Tidak Normal
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={data.notes || ''}
                            onChange={(e) => handlePhysicalBodyPartChange(item.id, 'notes', e.target.value)}
                            placeholder="Catatan temuan organ..."
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* PEMERIKSAAN MATA DAN VISUS */}
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 space-y-5">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Pemeriksaan Mata dan Visus
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  Hasil pemeriksaan ketajaman penglihatan dan buta warna.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Visus OD (Mata Kanan)
                  </label>
                  <input
                    type="text"
                    value={mcuData.visionExamination?.rightEye ?? ''}
                    onChange={(e) =>
                      handleSaveProgress({
                        visionExamination: {
                          ...mcuData.visionExamination,
                          rightEye: e.target.value,
                        },
                      })
                    }
                    placeholder="Contoh: 6/6"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Visus OS (Mata Kiri)
                  </label>
                  <input
                    type="text"
                    value={mcuData.visionExamination?.leftEye ?? ''}
                    onChange={(e) =>
                      handleSaveProgress({
                        visionExamination: {
                          ...mcuData.visionExamination,
                          leftEye: e.target.value,
                        },
                      })
                    }
                    placeholder="Contoh: 6/6"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Visus OU (Kedua Mata)
                  </label>
                  <input
                    type="text"
                    value={mcuData.visionExamination?.bothEyes ?? ''}
                    onChange={(e) =>
                      handleSaveProgress({
                        visionExamination: {
                          ...mcuData.visionExamination,
                          bothEyes: e.target.value,
                        },
                      })
                    }
                    placeholder="Contoh: 6/6"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Hasil Tes Buta Warna (Ishihara)
                </label>
                <select
                  value={
                    mcuData.visionExamination?.colorBlindness ??
                    'Tidak Dilakukan'
                  }
                  onChange={(e) =>
                    handleSaveProgress({
                      visionExamination: {
                        ...mcuData.visionExamination,
                        colorBlindness: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="Tidak Dilakukan">Tidak Dilakukan</option>
                  <option value="Normal">Normal</option>
                  <option value="Tidak Normal">Tidak Normal</option>
                  <option value="Buta Warna Parsial">Buta Warna Parsial</option>
                  <option value="Buta Warna Total">Buta Warna Total</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Keterangan Pemeriksaan Mata
                </label>
                <textarea
                  rows={3}
                  value={mcuData.visionExamination?.notes ?? ''}
                  onChange={(e) =>
                    handleSaveProgress({
                      visionExamination: {
                        ...mcuData.visionExamination,
                        notes: e.target.value,
                      },
                    })
                  }
                  placeholder="Masukkan keterangan pemeriksaan mata..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* G. TAB PEMERIKSAAN PENUNJANG */}
        {activeTab === 'supporting' && (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Pemeriksaan Penunjang Medis</h3>
              <p className="text-xs text-gray-500 mt-0.5">Catat status dan temuan hasil pemeriksaan penunjang utama serta pemeriksaan tambahan jika ada.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200 text-gray-700 font-bold text-xs uppercase">
                    <th className="p-3 w-1/3">Pemeriksaan Utama</th>
                    <th className="p-3 text-center w-1/3">Status Hasil</th>
                    <th className="p-3 w-1/3">Catatan / Temuan Hasil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {SUPPORTING_EXAM_ITEMS.map((item) => {
                    const data = mcuData.supportingExamination?.mainExams?.[item.id] || {};
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3 font-semibold text-gray-800 text-xs">{item.label}</td>
                        <td className="p-3 text-center">
                          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-1">
                            <button
                              type="button"
                              onClick={() => handleMainSupportingExamChange(item.id, 'status', 'Normal')}
                              className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                data.status === 'Normal'
                                  ? 'bg-green-600 text-white shadow-xs'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Normal
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMainSupportingExamChange(item.id, 'status', 'Tidak Normal')}
                              className={`px-3.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                                data.status === 'Tidak Normal'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Tidak Normal
                            </button>
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={data.notes || ''}
                            onChange={(e) => handleMainSupportingExamChange(item.id, 'notes', e.target.value)}
                            placeholder="Catatan hasil penunjang..."
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Pemeriksaan Penunjang Tambahan</h4>
                  <p className="text-xs text-gray-500">Tambahkan pemeriksaan penunjang di luar 6 pemeriksaan utama jika diperlukan.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAdditionalExam}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Pemeriksaan</span>
                </button>
              </div>

              {(mcuData.supportingExamination?.additionalExams || []).length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-500 font-medium">
                  Belum ada pemeriksaan penunjang tambahan. Klik tombol <strong>"+ Tambah Pemeriksaan"</strong> di atas untuk menambahkan.
                </div>
              ) : (
                <div className="space-y-3">
                  {(mcuData.supportingExamination?.additionalExams || []).map((exam) => (
                    <div
                      key={exam.id}
                      className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                    >
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Nama Pemeriksaan</label>
                        <input
                          type="text"
                          value={exam.name}
                          onChange={(e) => handleUpdateAdditionalExam(exam.id, 'name', e.target.value)}
                          placeholder="mis. USG Abdomen, Lab Darah..."
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-3 text-center">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Status Hasil</label>
                        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateAdditionalExam(exam.id, 'status', 'Normal')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              exam.status === 'Normal'
                                ? 'bg-green-600 text-white shadow-xs'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Normal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateAdditionalExam(exam.id, 'status', 'Tidak Normal')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                              exam.status === 'Tidak Normal'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Tidak Normal
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Catatan Hasil</label>
                        <input
                          type="text"
                          value={exam.notes || ''}
                          onChange={(e) => handleUpdateAdditionalExam(exam.id, 'notes', e.target.value)}
                          placeholder="Catatan temuan..."
                          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-end md:justify-center pt-2 md:pt-4">
                        <button
                          type="button"
                          onClick={() => handleDeleteAdditionalExam(exam.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Pemeriksaan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* H. TAB KESIMPULAN DOKTER */}
        {activeTab === 'doctor' && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900 text-sm border-b pb-2">Kesimpulan Hasil MCU & Tanda Tangan Dokter</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Kesimpulan Akhir Klinik</label>
                <textarea
                  rows={3}
                  value={mcuData.doctorConclusion?.conclusion || ''}
                  onChange={(e) => {
                    const currentDoc = mcuData.doctorConclusion || {
                      conclusion: '',
                      recommendation: '',
                      finalResult: '',
                      doctorName: currentUser?.name || 'Dokter Pemeriksa',
                      date: new Date().toISOString().split('T')[0],
                      notes: '',
                    };
                    handleSaveProgress({
                      doctorConclusion: {
                        ...currentDoc,
                        conclusion: e.target.value,
                        notes: currentDoc.notes || '',
                      } as unknown as DoctorConclusion,
                    });
                  }}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="Ketik kesimpulan kesehatan peserta..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Rekomendasi / Saran Dokter</label>
                <textarea
                  rows={3}
                  value={mcuData.doctorConclusion?.recommendation || ''}
                  onChange={(e) => {
                    const currentDoc = mcuData.doctorConclusion || {
                      conclusion: '',
                      recommendation: '',
                      finalResult: '',
                      doctorName: currentUser?.name || 'Dokter Pemeriksa',
                      date: new Date().toISOString().split('T')[0],
                      notes: '',
                    };
                    handleSaveProgress({
                      doctorConclusion: {
                        ...currentDoc,
                        recommendation: e.target.value,
                        notes: currentDoc.notes || '',
                      } as unknown as DoctorConclusion,
                    });
                  }}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-hidden focus:ring-2 focus:ring-blue-500"
                  placeholder="Ketik rekomendasi tindak lanjut..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Hasil Status Akhir Medis</label>
                <select
                  value={mcuData.doctorConclusion?.finalResult || ''}
                  onChange={(e) => {
                    const val = e.target.value as 'FIT' | 'FIT_DENGAN_CATATAN' | 'UNFIT' | '';
                    const currentDoc = mcuData.doctorConclusion || {
                      conclusion: '',
                      recommendation: '',
                      finalResult: '',
                      doctorName: currentUser?.name || 'Dokter Pemeriksa',
                      date: new Date().toISOString().split('T')[0],
                      notes: '',
                    };
                    handleSaveProgress({
                      doctorConclusion: {
                        ...currentDoc,
                        finalResult: val,
                        notes: currentDoc.notes || '',
                      } as unknown as DoctorConclusion,
                    });
                  }}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-bold cursor-pointer outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Status Kelayakan --</option>
                  <option value="FIT">FIT</option>
                  <option value="FIT_DENGAN_CATATAN">FIT DENGAN CATATAN</option>
                  <option value="UNFIT">UNFIT</option>
                </select>
              </div>

              {/* NAMA DOKTER PEMERIKSA */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Dokter Pemeriksa</label>
                <input
                  type="text"
                  value={mcuData.doctorConclusion?.doctorName || ''}
                  onChange={(e) => {
                    const currentDoc = mcuData.doctorConclusion || {
                      conclusion: '',
                      recommendation: '',
                      finalResult: '',
                      doctorName: currentUser?.name || 'Dokter Pemeriksa',
                      date: new Date().toISOString().split('T')[0],
                      notes: '',
                    };
                    handleSaveProgress({
                      doctorConclusion: {
                        ...currentDoc,
                        doctorName: e.target.value,
                        notes: currentDoc.notes || '',
                      } as unknown as DoctorConclusion,
                    });
                  }}
                  placeholder="Ketik nama lengkap dokter beserta gelar (mis. dr. Ahmad Fauzi, Sp.JP)..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs font-medium outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* UPLOAD TANDA TANGAN DOKTER */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Upload Tanda Tangan Dokter</label>
                <p className="text-[11px] text-gray-500 mb-2">Unggah file foto / gambar tanda tangan dokter dalam format PNG, JPG, atau JPEG.</p>
                
                {docConclusionAny.doctorSignature ? (
                  <div className="p-3 border border-gray-200 rounded-2xl bg-gray-50 flex items-center justify-between max-w-md">
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-white border border-gray-200 rounded-xl">
                        <img 
                          src={docConclusionAny.doctorSignature} 
                          alt="Tanda Tangan Dokter" 
                          style={{ maxWidth: '140px' }}
                          className="h-14 w-auto object-contain"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">Tanda Tangan Ter-upload</span>
                        <span className="text-[10px] text-green-600 font-semibold">Siap digunakan untuk laporan MCU</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveSignature}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Tanda Tangan"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50/50 hover:bg-blue-50/30 rounded-2xl transition-all cursor-pointer max-w-md">
                    <Upload className="w-6 h-6 text-blue-600 mb-1.5" />
                    <span className="text-xs font-bold text-gray-700">Pilih File Tanda Tangan</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Format .png / .jpg / .jpeg (Transparan lebih baik)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSignatureUpload(file);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NAVIGASI BAWAH PEMERIKSAAN */}
        <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePrevTab}
            disabled={isFirstTab}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isFirstTab
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-xs cursor-pointer active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>

          <span className="text-xs text-gray-500 font-bold">
            Langkah {currentIndex >= 0 ? currentIndex + 1 : 1} dari {availableTabs.length}
          </span>

          <button
            type="button"
            onClick={handleNextTab}
            disabled={isLastTab}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isLastTab
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer active:scale-95'
            }`}
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};