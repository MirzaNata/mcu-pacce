import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

export const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('petugas');
  const [password, setPassword] = useState('klinik123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = authService.login(username, password);
    if (user) {
      navigate('/dashboard');
    } else {
      setError('Mohon isi nama pengguna dan kata sandi.');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-linear-to-r from-blue-700 to-blue-600 p-8 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20 shadow-inner">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight">Klinik Pakisaji</h1>
          <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mt-1">Cardiovascular Center</p>
          <div className="mt-4 inline-flex items-center gap-1.5 bg-blue-800/60 px-3 py-1 rounded-full border border-blue-400/30 text-[11px] font-semibold text-blue-100">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>Satu Gerbang — Akun Bersama Petugas</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Nama Pengguna
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan nama pengguna"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 active:scale-[0.99] cursor-pointer"
            >
              Masuk ke Sistem MCU
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-500 leading-relaxed">
            <p className="font-bold text-gray-700 mb-1">Catatan Akun Bersama:</p>
            <p>Seluruh petugas klinik dapat masuk menggunakan akun ini secara bersamaan dari berbagai perangkat di lingkungan klinik.</p>
          </div>
        </form>
      </div>
    </div>
  );
};