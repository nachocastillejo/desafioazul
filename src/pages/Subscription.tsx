import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Check, 
  Crown, 
  ArrowLeft,
  CreditCard,
  Lock,
  Zap,
  Target,
  Brain,
  Clock
} from 'lucide-react';

export default function Subscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const planFeatures = [
    'Acceso a todas las preguntas disponibles',
    'Tests personalizados ilimitados',
    'Análisis detallado de progreso',
    'Simulacros cronometrados',
    'Estadísticas avanzadas',
    'Soporte prioritario'
  ];

  const handleSubscribe = async () => {
    if (!user) {
      // Si no está logueado, redirigir al login
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Aquí iría la integración con Stripe
      // Por ahora solo mostramos un mensaje
      alert('Redirigiendo a Stripe para procesar el pago...');
      // Ejemplo: window.location.href = stripeCheckoutUrl;
    } catch (error) {
      console.error('Error al procesar suscripción:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        {/* Main Card */}
        <div className="card p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-2">
              Actualizar a Premium
            </h1>
            <p className="text-text-secondary dark:text-gray-400">
              Desbloquea todas las funcionalidades y maximiza tu preparación
            </p>
          </div>

          {/* Plan Details */}
          <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 rounded-xl p-6 mb-8 border border-primary/20 dark:border-primary/30">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-2">
                Plan Premium
              </h2>
              <div className="flex items-baseline justify-center space-x-1">
                <span className="text-4xl font-bold text-primary">€9.99</span>
                <span className="text-text-secondary dark:text-gray-400">/mes</span>
              </div>
              <p className="text-sm text-text-secondary dark:text-gray-400 mt-2">
                Cancela cuando quieras
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {planFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-text-secondary dark:text-gray-400">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Highlight */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Zap className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium text-text-primary dark:text-white">Tests Ilimitados</h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">Sin restricciones</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Target className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium text-text-primary dark:text-white">Análisis Avanzado</h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">Progreso detallado</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium text-text-primary dark:text-white">Tests Personalizados</h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">Adaptados a ti</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-medium text-text-primary dark:text-white">Simulacros</h3>
                <p className="text-sm text-text-secondary dark:text-gray-400">Condiciones reales</p>
              </div>
            </div>
          </div>

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Suscribirse por €9.99/mes</span>
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-text-secondary dark:text-gray-400">
            <Lock className="w-4 h-4" />
            <span>Pago seguro procesado por Stripe</span>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
              ¿Por qué actualizar a Premium?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              Con Premium tendrás acceso completo a todas las herramientas necesarias para maximizar 
              tu preparación y conseguir los mejores resultados en tus oposiciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 