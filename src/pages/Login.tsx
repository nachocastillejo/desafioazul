import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Brain, 
  Target, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Users,
  Award,
  Zap,
  ArrowRight,
  User
} from 'lucide-react';
import Footer from '../components/Footer';

// Un simple componente para el icono de Google
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 488 512" {...props}>
    <path d="M488 261.8C488 403.3 381.5 512 244 512 111.3 512 0 398.5 0 256S111.3 0 244 0c73 0 134.3 29.3 179.3 71.9l-62.8 54.3C337 99.1 296.3 80 244 80 149.3 80 71.6 156.3 71.6 256s77.7 176 172.4 176c83.5 0 125.2-34.4 129.2-83.3H244v-96h244z"></path>
  </svg>
);

type AuthMode = 'login' | 'register';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [showAuthForm, setShowAuthForm] = useState(false);
  
  // Estados para login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para registro
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    // No es necesario setLoading(true) aquí, porque la página se recargará.
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message || 'Error al iniciar sesión con Google');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message || 'Error al iniciar sesión');
        return;
      }

      navigate('/');
    } catch (err) {
      setError('Error inesperado al iniciar sesión');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (registerPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (registerPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(registerEmail, registerPassword, fullName);
      
      if (error) {
        setError(error.message || 'Error al registrar usuario');
        return;
      }
      
      navigate('/');
    } catch (err) {
      setError('Error inesperado al registrar usuario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Tests Inteligentes",
      description: "Preguntas adaptadas a tu nivel con análisis de rendimiento en tiempo real"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Preparación Personalizada", 
      description: "Planes de estudio adaptados a tus fortalezas y áreas de mejora"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Seguimiento Detallado",
      description: "Estadísticas avanzadas para monitorear tu progreso día a día"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Simulacros Cronometrados",
      description: "Practica en condiciones reales de examen para optimizar tu tiempo"
    }
  ];

  if (showAuthForm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          <div className="card p-8 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-white">
                {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h1>
              <p className="text-text-secondary dark:text-gray-400 mt-2">
                {authMode === 'login' 
                  ? 'Accede a tu cuenta para continuar' 
                  : 'Regístrate para acceder a todos los recursos'
                }
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <div className="space-y-4">
               <button
                  onClick={handleGoogleSignIn}
                  className="w-full btn-secondary py-3 rounded-xl flex items-center justify-center"
                >
                  <GoogleIcon className="w-5 h-5 mr-3" />
                  <span>{authMode === 'login' ? 'Iniciar sesión con Google' : 'Registrarse con Google'}</span>
                </button>
            </div>

             <div className="my-6 flex items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span className="mx-4 text-sm text-text-secondary dark:text-gray-400">
                O continuar con
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>


            {/* Forms */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-text-secondary dark:text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field-icon"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-secondary dark:text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field-icon pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-text-secondary dark:text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-text-secondary dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 rounded-xl flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-text-secondary dark:text-gray-400" />
                    </div>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field-icon"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="registerEmail" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-text-secondary dark:text-gray-400" />
                    </div>
                    <input
                      id="registerEmail"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="input-field-icon"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="registerPassword" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-secondary dark:text-gray-400" />
                    </div>
                    <input
                      id="registerPassword"
                      type={showPassword ? "text" : "password"}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="input-field-icon pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-text-secondary dark:text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-text-secondary dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-secondary dark:text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field-icon"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 rounded-xl flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </form>
            )}

            {/* Switch between login/register */}
            <div className="mt-6 text-center">
              <p className="text-text-secondary dark:text-gray-400">
                {authMode === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="font-medium text-primary hover:text-primary-hover"
                >
                  {authMode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </div>

            {/* Back to landing */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAuthForm(false)}
                className="text-sm text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white"
              >
                ← Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center mb-16">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/images/logo modo claro.png" 
                alt="Desafío Azul Logo Claro"
                className="h-20 sm:h-24 block dark:hidden"
              />
              <img 
                src="/images/logo modo oscuro.png" 
                alt="Desafío Azul Logo Oscuro"
                className="h-20 sm:h-24 hidden dark:block"
              />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary dark:text-white mb-6">
              Tu plaza comienza aquí:
              <span className="block text-gradient">visualiza, actúa y vence</span>
            </h1>
            
            <p className="text-xl text-text-secondary dark:text-gray-400 max-w-3xl mx-auto mb-8">
              Una nueva plataforma diseñada para revolucionar tu preparación de oposiciones. 
              Tests adaptativos, análisis inteligente y seguimiento personalizado para maximizar tus resultados.
              <span className="block mt-2 text-lg font-medium text-primary">
                Regístrate gratis y prueba la plataforma. Después, €9.99/mes para acceso completo.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthForm(true);
                }}
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 flex items-center justify-center space-x-2"
              >
                <span>Registrarse Gratis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthForm(true);
                }}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-text-primary dark:text-white font-semibold rounded-xl transition-all duration-300 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                Iniciar Sesión
              </button>
            </div>

            {/* Pricing info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-text-secondary dark:text-gray-400">
                ✓ Registro gratuito • ✓ Prueba sin compromiso • ✓ Después €9.99/mes
              </p>
            </div>
          </div>

          {/* Stats Images */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20 px-4">
            {[
              '/images/login_image_1.png',
              '/images/login_image_2.png',
              '/images/login_image_3.png',
              '/images/login_image_4.png'
            ].map((src, index) => (
              <div key={index} className="flex justify-center items-center">
                <img src={src} alt={`Imagen de estadística ${index + 1}`} className="max-w-full h-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-white mb-4">
              Todo lo que necesitas para triunfar
            </h2>
            <p className="text-xl text-text-secondary dark:text-gray-400 max-w-2xl mx-auto">
              Herramientas modernas diseñadas específicamente para la preparación de oposiciones
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-text-secondary dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-white mb-6">
                Preparación inteligente, resultados reales
              </h2>
              <p className="text-lg text-text-secondary dark:text-gray-400 mb-8">
                Nuestra plataforma utiliza tecnología moderna para adaptar el contenido a tu nivel 
                y ritmo de aprendizaje, optimizando tu tiempo de estudio.
              </p>
              
              <div className="space-y-4">
                {[
                  "Tests adaptativos que se ajustan a tu nivel",
                  "Análisis detallado de tu rendimiento",
                  "Simulacros en condiciones reales de examen",
                  "Seguimiento de progreso en tiempo real"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-text-secondary dark:text-gray-400">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="card p-8 bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary dark:text-white mb-4">
                    Prueba gratis, después €9.99/mes
                  </h3>
                  <p className="text-text-secondary dark:text-gray-400 mb-4">
                    Regístrate gratis y accede a contenido básico. La suscripción premium incluye:
                  </p>
                  <div className="text-left mb-6 space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Acceso a todas las preguntas</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Tests personalizados ilimitados</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Análisis detallado de progreso</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>Simulacros cronometrados</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthForm(true);
                    }}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center space-x-2"
                  >
                    <span>Probar Gratis</span>
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 bg-gradient-to-r from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-text-primary dark:text-white mb-4">
            ¿Listo para conseguir tu plaza?
          </h2>
          <p className="text-xl text-text-secondary dark:text-gray-400 mb-8">
            Regístrate gratis y comienza tu preparación. Actualiza a premium cuando estés listo.
          </p>
          <button
            onClick={() => {
              setAuthMode('register');
              setShowAuthForm(true);
            }}
            className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 inline-flex items-center space-x-2"
          >
            <span>Registrarse Gratis</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="px-4">
        <Footer />
      </div>
    </div>
  );
}
