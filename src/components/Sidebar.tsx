import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardCheck,
  Calculator,
  Settings,
  HelpCircle,
  BookOpen,
  Menu,
  User,
  TrendingUp,
  LogOut,
  Bookmark,
  Info,
  Crown,
  CheckCircle,
  Clock
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useTestStore } from '../lib/store';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isTestStarted, finishTest } = useTestStore();
  const { user, profile, signOut } = useAuth();
  const { subscriptionInfo, isPremium } = useSubscription();

  const handleNavigation = (path: string) => {
    if (isTestStarted) {
      finishTest();
    }
    if (path === '/bookmarks') {
      navigate(path, { state: { navigatedToBookmarksSignal: Date.now() } });
    } else {
      navigate(path);
    }
    onCloseMobile?.();
  };

  const handleLogout = async () => {
    if (isTestStarted) {
      finishTest();
    }
    await signOut();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-r border-gray-100 dark:border-gray-700 h-screen flex flex-col">
      {/* Cabecera del perfil */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="flex items-center space-x-4 flex-grow">
            {/* Profile Image or Icon */}
            {profile?.profile_image_url ? (
              <img 
                src={profile.profile_image_url} 
                alt="Avatar" 
                className="w-12 h-12 rounded-xl object-cover bg-gray-200 dark:bg-gray-700"
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-text-primary dark:text-white text-lg leading-tight">
                {profile?.full_name || 'Usuario'}
              </span>
              <span className="text-sm text-text-secondary dark:text-gray-400 leading-tight">
                {user?.email?.split('@')[0] || 'Invitado'}
              </span>
              {isPremium ? (
                <div className="flex items-center w-fit bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400 text-xs font-medium px-2 py-0.5 rounded-full mt-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </div>
              ) : (
                <div
                  className={`flex items-center w-fit text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                    (profile?.free_tests_taken ?? 0) < 5
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                  }`}
                >
                  Free ({profile?.free_tests_taken ?? 0}/5)
                </div>
              )}
            </div>
          </div>
          {/* Botón de menú para móviles */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden ml-4 w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 dark:hover:scrollbar-thumb-gray-600">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => handleNavigation('/')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                location.pathname === '/'
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Inicio</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => handleNavigation('/test')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                location.pathname === '/test'
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <ClipboardCheck className="w-5 h-5" />
              <span className="font-medium">Tests</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => handleNavigation('/progreso')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                location.pathname === '/progreso'
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Progreso</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => handleNavigation('/bookmarks')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                location.pathname === '/bookmarks'
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Bookmark className="w-5 h-5" />
              <span className="font-medium">Guardados</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => handleNavigation('/suscripcion')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                location.pathname === '/suscripcion'
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Crown className="w-5 h-5" />
              <span className="font-medium">Suscripción</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => handleNavigation('/calculadora')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                location.pathname === '/calculadora'
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Calculator className="w-5 h-5" />
              <span className="font-medium">Calculadora</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => handleNavigation('/faq')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                location.pathname === '/faq'
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Info className="w-5 h-5" />
              <span className="font-medium">Preguntas Frecuentes</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => handleNavigation('/admin/preguntas')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                location.pathname === '/admin/preguntas'
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Gestionar Preguntas</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Sección inferior con Ajustes, ThemeToggle y Ayuda */}
      <div
        className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm space-y-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => handleNavigation('/ajustes')}
            className="flex items-center space-x-3 p-3 rounded-xl text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-grow"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Ajustes</span>
          </button>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleNavigation('/ayuda')}
            className="flex-1 flex items-center space-x-3 p-3 rounded-xl text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">Ayuda</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-xl text-text-secondary dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Salir</span>
          </button>
        </div>
      </div>
    </div>
  );
}