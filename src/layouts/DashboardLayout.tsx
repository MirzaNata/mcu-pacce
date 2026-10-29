import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  TestTube,
  FileCheck2,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react';
import { authService } from '../services/authService';

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Peserta MCU',
      path: '/patients',
      icon: Users,
    },
    {
      title: 'Pemeriksaan MCU',
      path: '/patients',
      icon: Stethoscope,
    },
    {
      title: 'Laboratorium',
      path: '/lab',
      icon: TestTube,
    },
    {
      title: 'Hasil MCU',
      path: '/mcu-results',
      icon: FileCheck2,
    },
    {
      title: 'Pengaturan',
      path: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-30">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-gray-900 leading-tight text-sm uppercase tracking-tight">Klinik Pakisaji</h1>
            <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">Cardiovascular</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path && (idx !== 2 || location.pathname.startsWith('/mcu/'));
            return (
              <Link
                key={`${item.title}-${idx}`}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-gray-900">{currentUser?.name || 'Petugas Klinik'}</p>
              <p className="text-[10px] text-gray-500 font-medium">Akun Bersama Petugas</p>
            </div>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">STAFF</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 pl-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};