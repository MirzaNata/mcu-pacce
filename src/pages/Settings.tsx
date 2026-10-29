import { Building2, ShieldCheck, Database, HardDrive } from 'lucide-react';

export const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem MCU</h1>
        <p className="text-gray-500 text-sm mt-1">Konfigurasi operasional dan penyimpanan data klinik.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Identitas Klinik</h2>
              <p className="text-xs text-gray-500">Informasi profil pada Kop Surat & Laporan MCU</p>
            </div>
          </div>
          <div className="space-y-3 text-xs text-gray-600 pt-2 border-t border-gray-100">
            <p><span className="font-bold text-gray-800">Nama Klinik:</span> Klinik Pakisaji Cardiovascular Center</p>
            <p><span className="font-bold text-gray-800">Alamat:</span> Jl. Raya Pakisaji No. 123, Malang, Jawa Timur</p>
            <p><span className="font-bold text-gray-800">Kontak:</span> (0341) 1234567 | info@pakisajicv.com</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Mode Akses</h2>
              <p className="text-xs text-gray-500">Satu Gerbang Akun Bersama</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
            <p className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-block">
              Satu Akun Bersama Aktif
            </p>
            <p className="mt-1">Petugas dapat mengoperasikan seluruh modul pemeriksaan, laboratorium, dan cetak hasil secara bersama dari perangkat klinik mana pun.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Status Penyimpanan Data</h2>
              <p className="text-xs text-gray-500">Layanan Penyimpanan Lokal (Prototipe/Demo)</p>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2 font-bold text-gray-800">
              <Database className="w-4 h-4 text-purple-600" />
              <span>Media Penyimpanan: LocalStorage Web Browser</span>
            </div>
            <p>Data peserta, rekam MCU, hasil laboratorium, dan tanda tangan dokter tersimpan aman di browser komputer lokal klinik.</p>
          </div>
        </div>
      </div>
    </div>
  );
};