import { supabase } from '../lib/supabaseClient';
import type { Patient } from '../types';

export const patientService = {
  // Ambil semua data pasien dari Supabase
  async getPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data pasien:', error);
      return [];
    }

    return (data || []).map((p) => ({
      id: p.id,
      mcuNumber: p.mcu_number,
      fullName: p.full_name,
      nik: p.nik,
      identityNumber: p.nik || '',
      gender: p.gender,
      age: p.age,
      company: p.company,
      registrationDate: p.created_at ? p.created_at.split('T')[0] : '',
    })) as unknown as Patient[];
  },

  // Tambah pasien baru
  async addPatient(patient: Omit<Patient, 'id'>): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          mcu_number: patient.mcuNumber,
          full_name: patient.fullName,
          nik: (patient as any).nik || (patient as any).identityNumber || null,
          gender: patient.gender,
          age: (patient as any).age || null,
          company: (patient as any).company || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Gagal menambah pasien:', error);
      return null;
    }

    return {
      id: data.id,
      mcuNumber: data.mcu_number,
      fullName: data.full_name,
      nik: data.nik,
      identityNumber: data.nik || '',
      gender: data.gender,
      age: data.age,
      company: data.company,
      registrationDate: data.created_at ? data.created_at.split('T')[0] : '',
    } as unknown as Patient;
  },

  // Ambil detail 1 pasien berdasarkan ID
  async getPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      mcuNumber: data.mcu_number,
      fullName: data.full_name,
      nik: data.nik,
      identityNumber: data.nik || '',
      gender: data.gender,
      age: data.age,
      company: data.company,
      registrationDate: data.created_at ? data.created_at.split('T')[0] : '',
    } as unknown as Patient;
  },
};