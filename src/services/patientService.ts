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
      gender: p.gender || 'Laki-Laki',
      age: p.age || 0,
      company: p.company || p.company_name || '',
      companyName: p.company_name || p.company || '',
      phoneNumber: p.phone_number || p.phone || '',
      maritalStatus: p.marital_status || '',
      nationality: p.nationality || 'WNI',
      bloodType: p.blood_type || 'A',
      rhesus: p.rhesus || '+',
      registrationDate: p.registration_date || p.created_at || '',
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
      gender: data.gender || 'Laki-Laki',
      age: data.age || 0,
      company: data.company || '',
      companyName: data.company_name || data.company || '',
      phoneNumber: data.phone_number || '',
      maritalStatus: data.marital_status || '',
      nationality: data.nationality || 'WNI',
      bloodType: data.blood_type || 'A',
      rhesus: data.rhesus || '+',
      registrationDate: data.registration_date || '',
      status: data.status || 'Pending',
    };
  },

  async addPatient(patient: Partial<Patient>): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .insert([{
        mcu_number: patient.mcuNumber || `MCU-${Date.now().toString().slice(-6)}`,
        full_name: patient.fullName,
        nik: patient.nik || patient.identityNumber,
        identity_number: patient.identityNumber || patient.nik,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        age: patient.age,
        company: patient.company || patient.companyName,
        company_name: patient.companyName || patient.company,
        phone_number: patient.phoneNumber || patient.phone,
        marital_status: patient.maritalStatus,
        nationality: patient.nationality,
        blood_type: patient.bloodType,
        rhesus: patient.rhesus,
        status: patient.status || 'Pending',
      }])
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding patient:', error);
      return null;
    }

    return this.getPatientById(data.id);
  },

  async createPatient(patient: Partial<Patient>): Promise<Patient | null> {
    return this.addPatient(patient);
  },

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient | null> {
    const { error } = await supabase
      .from('patients')
      .update({
        full_name: patient.fullName,
        nik: patient.nik || patient.identityNumber,
        identity_number: patient.identityNumber || patient.nik,
        date_of_birth: patient.dateOfBirth,
        gender: patient.gender,
        age: patient.age,
        company: patient.company || patient.companyName,
        company_name: patient.companyName || patient.company,
        phone_number: patient.phoneNumber || patient.phone,
        marital_status: patient.maritalStatus,
        nationality: patient.nationality,
        blood_type: patient.bloodType,
        rhesus: patient.rhesus,
        status: patient.status,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating patient:', error);
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