import { supabase } from '../lib/supabaseClient';
import type { Patient } from '../types';

export const patientService = {
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      return [];
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      mcuNumber: p.mcu_number || p.mcuNumber || '',
      fullName: p.full_name || p.fullName || '',
      nik: p.nik || p.identity_number || '',
      identityNumber: p.identity_number || p.nik || '',
      dateOfBirth: p.date_of_birth || p.dateOfBirth || '',
      gender: p.gender || p.jenis_kelamin || 'Laki-Laki',
      age: p.age || 0,
      company: p.company || p.company_name || '',
      companyName: p.company_name || p.company || '',
      phone: p.phone_number || p.phone || p.phoneNumber || '',
      phoneNumber: p.phone_number || p.phone || p.phoneNumber || '',
      address: p.address || p.alamat || '',
      maritalStatus: p.marital_status || '',
      nationality: p.nationality || 'WNI',
      bloodType: p.blood_type || p.bloodType || 'A',
      rhesus: p.rhesus || '+',
      registrationDate: p.registration_date || p.registrationDate || p.created_at || '',
      status: p.status || 'Pending',
    }));
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      mcuNumber: data.mcu_number || '',
      fullName: data.full_name || '',
      nik: data.nik || data.identity_number || '',
      identityNumber: data.identity_number || data.nik || '',
      dateOfBirth: data.date_of_birth || '',
      gender: data.gender || data.jenis_kelamin || 'Laki-Laki',
      age: data.age || 0,
      company: data.company || data.company_name || '',
      companyName: data.company_name || data.company || '',
      phone: data.phone_number || data.phone || data.phoneNumber || '',
      phoneNumber: data.phone_number || data.phone || data.phoneNumber || '',
      address: data.address || data.alamat || '',
      maritalStatus: data.marital_status || '',
      nationality: data.nationality || 'WNI',
      bloodType: data.blood_type || data.bloodType || 'A',
      rhesus: data.rhesus || '+',
      registrationDate: data.registration_date || data.registrationDate || data.created_at || '',
      status: data.status || 'Pending',
    };
  },

  async addPatient(patient: Partial<Patient>): Promise<Patient | null> {
    const pAny = patient as any;

    const autoMcu = patient.mcuNumber && patient.mcuNumber.trim() !== '' 
      ? patient.mcuNumber 
      : `MCU-${Date.now().toString().slice(-6)}`;

    const { data, error } = await supabase
      .from('patients')
      .insert([{
        mcu_number: autoMcu,
        full_name: patient.fullName || pAny.full_name || '',
        nik: patient.nik || patient.identityNumber || pAny.identity_number || '',
        identity_number: patient.identityNumber || patient.nik || pAny.identity_number || '',
        date_of_birth: patient.dateOfBirth || pAny.date_of_birth || null,
        gender: patient.gender || pAny.jenis_kelamin || 'Laki-Laki',
        age: Number(patient.age) || 0,
        company: patient.company || patient.companyName || pAny.company_name || '',
        company_name: patient.companyName || patient.company || pAny.company_name || '',
        phone_number: patient.phoneNumber || patient.phone || pAny.phone_number || '',
        address: patient.address || pAny.alamat || '',
        registration_date: patient.registrationDate || pAny.registration_date || new Date().toISOString().split('T')[0],
        marital_status: patient.maritalStatus || 'Belum Menikah',
        nationality: patient.nationality || 'WNI',
        blood_type: patient.bloodType || pAny.blood_type || 'A',
        rhesus: patient.rhesus || '+',
        status: patient.status || 'Registered',
      }])
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding patient to Supabase:', error);
      alert('Gagal menyimpan peserta: ' + (error?.message || 'Terjadi kesalahan'));
      return null;
    }

    return this.getPatientById(data.id);
  },

  async createPatient(patient: Partial<Patient>): Promise<Patient | null> {
    return this.addPatient(patient);
  },

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient | null> {
    const pAny = patient as any;

    const { error } = await supabase
      .from('patients')
      .update({
        full_name: patient.fullName || pAny.full_name,
        nik: patient.nik || patient.identityNumber || pAny.identity_number,
        identity_number: patient.identityNumber || patient.nik || pAny.identity_number,
        date_of_birth: patient.dateOfBirth || pAny.date_of_birth || null,
        gender: patient.gender || pAny.jenis_kelamin,
        age: patient.age !== undefined ? Number(patient.age) : undefined,
        company: patient.company || patient.companyName || pAny.company_name,
        company_name: patient.companyName || patient.company || pAny.company_name,
        phone_number: patient.phoneNumber || patient.phone || pAny.phone_number,
        address: patient.address !== undefined ? patient.address : pAny.alamat,
        registration_date: patient.registrationDate || pAny.registration_date || null,
        marital_status: patient.maritalStatus,
        nationality: patient.nationality,
        blood_type: patient.bloodType || pAny.blood_type,
        rhesus: patient.rhesus,
        status: patient.status,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating patient:', error);
      alert('Gagal memperbarui peserta: ' + error.message);
      return null;
    }

    return this.getPatientById(id);
  },

  async deletePatient(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting patient:', error);
      return false;
    }

    return true;
  }
};