import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authContext.jsx';
import { Code2, LogOut, User, LayoutDashboard, BookOpen, Bot, PlusCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTeacherOrAdmin = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <Code2 size={28} />
            <span className="hidden sm:inline">LearnProgrammer</span>
          </Link>

          {user && (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/courses" className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition text-sm font-medium">
                  <BookOpen size={18} />
                  Курси
                </Link>
                <Link to="/ai-assistant" className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition text-sm font-medium">
                  <Bot size={18} />
                  AI помічник
                </Link>
                {isTeacherOrAdmin && (
                  <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                    <Link to="/admin/courses" className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition text-sm font-medium">
                      <PlusCircle size={18} />
                      Управління
                    </Link>
                    <Link to="/dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition text-sm font-medium">
                      <LayoutDashboard size={18} />
                      Дашборд
                    </Link>
                  </div>
                )}
              </div>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600 hover:text-gray-900">
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          )}

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 transition text-sm">
                  <User size={18} />
                  <span>{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition text-sm">
                  <LogOut size={18} />
                  <span>Вийти</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                Увійти
              </Link>
            )}
          </div>
        </div>

        {mobileOpen && user && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-2">
            <Link to="/courses" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">Курси</Link>
            <Link to="/ai-assistant" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">AI помічник</Link>
            {isTeacherOrAdmin && (
              <>
                <Link to="/admin/courses" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">Управління курсами</Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">Дашборд</Link>
              </>
            )}
            <hr className="my-2" />
            <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">Профіль</Link>
            <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">Вийти</button>
          </div>
        )}
      </div>
    </nav>
  );
}
