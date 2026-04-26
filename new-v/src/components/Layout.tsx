import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, 
  User as UserIcon,
  LogOut, 
  ShieldCheck,
  LayoutDashboard,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/requests', icon: FileText, label: 'Мои запросы' },
    { to: '/profile', icon: UserIcon, label: 'Профиль' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.unshift({ to: '/admin', icon: LayoutDashboard, label: 'Панель админа' });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">3D<span className="text-indigo-600">PRINT</span></h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-medium"
          >
            <LogOut size={20} />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
