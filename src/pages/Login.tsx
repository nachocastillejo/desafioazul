import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="card p-8 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">
              Iniciar Sessión
            </h1>
            <p className="text-text-secondary dark:text-gray-400 mt-2">
              Accede a tu cuenta para continuar
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-primary dark:text-white mb-2"
              >
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
                  className="input-field"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-primary dark:text-white mb-2"
              >
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
                  className="input-field pr-12"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-text-secondary dark:text-gray-400"
                >
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary hover:text-primary-hover"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl flex items-center justify-center"
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Enlace a registro */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary dark:text-gray-400">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="font-medium text-primary hover:text-primary-hover"
              >
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
