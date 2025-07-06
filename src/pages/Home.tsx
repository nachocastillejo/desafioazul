import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Target, User, Crown, Zap, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export default function Home() {
  const { isPremium, createCheckoutSession, subscriptionInfo } = useSubscription();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleUpgradeToPremium = async () => {
    if (isPremium) {
      // Redirigir a la página de suscripción para gestionar
      window.location.href = '/suscripcion';
      return;
    }
    
    setIsRedirecting(true);
    try {
      await createCheckoutSession();
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      {/* Sección de Identidad */}
      <div className="text-center mb-12">
        {/* <h1 className="text-4xl sm:text-5xl font-black text-desafio-blue font-montserrat mb-2">
          Desafío Azul
        </h1> */}
        <img 
          src="/images/logo modo claro.png" 
          alt="Desafío Azul Logo Claro"
          className="mx-auto mb-2 h-24 sm:h-32 block dark:hidden"
        />
        <img 
          src="/images/logo modo oscuro.png" 
          alt="Desafío Azul Logo Oscuro"
          className="mx-auto mb-2 h-24 sm:h-32 hidden dark:block"
        />
        <p className="text-lg text-text-secondary dark:text-gray-400">
          Tu plaza comienza aquí: visualiza, actúa y vence.
        </p>
      </div>

      {/* Sección Principal */}
      <div className="card p-6 sm:p-8 mb-8 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-primary/10 shadow-2xl shadow-primary/10 dark:shadow-primary/20 transition-all duration-300">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-white mb-4">
            Exámenes reales, resultados reales.
          </h2>
          <p className="text-text-secondary dark:text-gray-400 text-base sm:text-lg mb-6">
            Entrena con tests basados en el temario oficial y experimenta el formato real de las pruebas. Mejora tu ritmo, identifica tus áreas de mejora y alcanza la excelencia.
          </p>
          <Link
            to="/test"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-primary/20"
          >
            Iniciar Prueba Gratuita
          </Link>
        </div>
      </div>

      {/* Sección de Suscripción Premium */}
      <div className="card p-6 sm:p-8 mb-8 bg-gradient-to-br from-blue-50 via-primary/5 to-blue-100/50 dark:from-blue-900/20 dark:via-primary/10 dark:to-blue-800/20 border border-blue-100 dark:border-blue-800/30 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-white mb-4">
            {isPremium ? '¡Ya eres Premium!' : 'Desbloquea todo el potencial'}
          </h2>
          <p className="text-text-secondary dark:text-gray-400 text-base sm:text-lg mb-6">
            {isPremium 
              ? `Tienes acceso completo a todas las funcionalidades premium. Tu suscripción está activa hasta el ${subscriptionInfo.endDate ? new Date(subscriptionInfo.endDate).toLocaleDateString() : ''}.`
              : 'Actualiza a Premium por solo €9.99/mes y accede a todas las funcionalidades avanzadas para maximizar tu preparación. Además, puedes realizar un test de prueba gratuito antes de actualizar para probar la plataforma.'
            }
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-gray-400">
              <Zap className="w-4 h-4 text-primary" />
              <span>Tests ilimitados</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-gray-400">
              <Target className="w-4 h-4 text-primary" />
              <span>Análisis avanzado</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-text-secondary dark:text-gray-400">
              <Brain className="w-4 h-4 text-primary" />
              <span>Simulacros cronometrados</span>
            </div>
          </div>
          <div className="mb-6">
            <span className="text-3xl font-bold text-primary">€9.99</span>
            <span className="text-text-secondary dark:text-gray-400 ml-1">/mes</span>
          </div>
          <button
            onClick={handleUpgradeToPremium}
            disabled={isRedirecting}
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirigiendo...
              </>
            ) : isPremium ? (
              'Gestionar Suscripción'
            ) : (
              'Actualizar a Premium'
            )}
          </button>
        </div>
      </div>

      {/* Beneficios Clave */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="card p-6 bg-gradient-to-br from-primary/5 dark:from-primary/10 to-transparent shadow-2xl shadow-primary/10 dark:shadow-primary/20 transition-all duration-300">
          <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-4 shadow-inner">
            <Target className="w-6 h-6 text-primary dark:text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">
            Test a medida, mejora sin límites
          </h3>
          <p className="text-text-secondary dark:text-gray-400">
            Cada opositor es diferente, y tu preparación también debe serlo. Con los test a medida, puedes personalizar tus entrenamientos según tu nivel, tiempo disponible y áreas que necesitas reforzar.
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-primary/5 dark:from-primary/10 to-transparent shadow-2xl shadow-primary/10 dark:shadow-primary/20 transition-all duration-300">
          <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center mb-4 shadow-inner">
            <Brain className="w-6 h-6 text-primary dark:text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">
            Preguntas Actualizadas
          </h3>
          <p className="text-text-secondary dark:text-gray-400">
            Mantente un paso adelante con nuestra base de datos en constante actualización. Practica con preguntas renovadas y adaptadas a los últimos exámenes oficiales para que nada te tome por sorpresa.
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/10 shadow-2xl shadow-green-500/10 dark:shadow-green-500/20 transition-all duration-300 sm:col-span-2 lg:col-span-1">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4 shadow-inner">
            <User className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">
            Seguimiento de Progreso
          </h3>
          <p className="text-text-secondary dark:text-gray-400">
            El éxito en los psicotécnicos se basa en la práctica y el seguimiento. Con nuestra herramienta de progreso y estadísticas, podrás medir tu evolución, identificar tus puntos fuertes y reforzar las áreas que necesitas mejorar.
          </p>
        </div>
      </div>
    </div>
  );
}
