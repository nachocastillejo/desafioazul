import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import QuestionView from './pages/QuestionView';
import Calculator from './components/Calculator';
import Progress from './pages/Progress';
import Bookmarks from './pages/Bookmarks';
import AdminQuestions from './pages/AdminQuestions';
import Login from './pages/Login';
import Subscription from './pages/Subscription';
import { Menu } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import PublicPageLayout from './components/PublicPageLayout';

const Profile = lazy(() => import('./pages/Profile'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const CookiesPolicyPage = lazy(() => import('./pages/CookiesPolicyPage'));
const PurchaseTermsPage = lazy(() => import('./pages/PurchaseTermsPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas */}
          <Route
            path="/suscripcion"
            element={(
              <ProtectedRoute>
                <AppLayout
                  isSidebarOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                >
                  <Subscription />
                </AppLayout>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/"
            element={(
              <ProtectedRoute>
                <AppLayout
                  isSidebarOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                >
                  <Home />
                </AppLayout>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/test"
            element={(
              <ProtectedRoute>
                <AppLayout
                  isSidebarOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                >
                  <QuestionView />
                </AppLayout>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/calculadora"
            element={(
              <ProtectedRoute>
                <AppLayout
                  isSidebarOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                >
                  <Calculator />
                </AppLayout>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/progreso"
            element={(
              <ProtectedRoute>
                <AppLayout
                  isSidebarOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                >
                  <Progress />
                </AppLayout>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/bookmarks"
            element={(
              <ProtectedRoute>
                <AppLayout
                  isSidebarOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                >
                  <Bookmarks />
                </AppLayout>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin/preguntas"
            element={(
              <ProtectedRoute>
                <AppLayout
                  isSidebarOpen={isSidebarOpen}
                  toggleSidebar={toggleSidebar}
                >
                  <AdminQuestions />
                </AppLayout>
              </ProtectedRoute>
            )}
          />
          <Route
            path="/profile"
            element={<Suspense fallback={<div>Loading...</div>}><ProtectedRoute><AppLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><Profile /></AppLayout></ProtectedRoute></Suspense>}
          />
          <Route
            path="/aviso-legal"
            element={<Suspense fallback={<div>Loading...</div>}><PublicPageLayout><LegalPage /></PublicPageLayout></Suspense>}
          />
          <Route
            path="/politica-de-privacidad"
            element={<Suspense fallback={<div>Loading...</div>}><PublicPageLayout><PrivacyPolicyPage /></PublicPageLayout></Suspense>}
          />
          <Route
            path="/politica-de-cookies"
            element={<Suspense fallback={<div>Loading...</div>}><PublicPageLayout><CookiesPolicyPage /></PublicPageLayout></Suspense>}
          />
          <Route
            path="/condiciones-generales-de-compra"
            element={<Suspense fallback={<div>Loading...</div>}><PublicPageLayout><PurchaseTermsPage /></PublicPageLayout></Suspense>}
          />
          <Route
            path="/faq"
            element={<Suspense fallback={<div>Loading...</div>}><PublicPageLayout><FaqPage /></PublicPageLayout></Suspense>}
          />
          <Route
            path="/ajustes"
            element={<Suspense fallback={<div>Loading...</div>}><ProtectedRoute><AppLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}><SettingsPage /></AppLayout></ProtectedRoute></Suspense>}
          />
          
          {/* Redirigir rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Componente de layout para las páginas con sidebar
interface AppLayoutProps {
  children: React.ReactNode;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

function AppLayout({ children, isSidebarOpen, toggleSidebar }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static lg:block inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-200 ease-in-out w-64`}
      >
        <Sidebar onCloseMobile={toggleSidebar} />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 relative flex flex-col">
        {/* Botón de menú móvil - solo visible cuando el sidebar está cerrado */}
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="lg:hidden fixed top-4 left-4 z-30 w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <Menu className="w-5 h-5 text-text-primary dark:text-white" />
          </button>
        )}

        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 pt-14 lg:pt-6 flex-grow">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default App;