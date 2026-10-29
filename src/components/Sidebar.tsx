import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FlaskConical, 
  Scan, 
  LogOut 
} from 'lucide-react';
import { authService } from '../services/authService';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Peserta MCU', path: '/patients', icon: Users },
    { name: 'Laboratorium', path: '/lab', icon: FlaskConical },
    { name: 'Radiologi', path: '/radiology', icon: Scan },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-4 h-screen sticky top-0">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
            P
          </div>
          <div>
            <h2 className="text-xs font-black text-gray-900 leading-tight">Pakisaji Cardiovascular</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">MCU Center</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-3">
        {currentUser && (
          <div className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-900 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase">{currentUser.role}</p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};