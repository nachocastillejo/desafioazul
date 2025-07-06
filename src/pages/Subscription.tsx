import React, { useState } from 'react';
import { CheckCircle, Crown, Zap, Target, Brain, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export default function Subscription() {
  const { isPremium, createCheckoutSession, subscriptionInfo, createCustomerPortalSession, loading } = useSubscription();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isPortalRedirecting, setIsPortalRedirecting] = useState(false);

  const handleUpgrade = async () => {
    if (isPremium) return;
    setIsRedirecting(true);
    try {
      await createCheckoutSession();
    } finally {
      setIsRedirecting(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsPortalRedirecting(true);
    try {
      await createCustomerPortalSession();
    } finally {
      setIsPortalRedirecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const planFeatures = [
    'Acceso a todas las preguntas disponibles',
    'Tests personalizados ilimitados',
    'Análisis detallado de progreso',
    'Simulacros cronometrados',
    'Estadísticas avanzadas',
    'Soporte prioritario',
  ];

  const featureCards = [
    { icon: Zap, title: 'Tests Ilimitados', description: 'Sin restricciones' },
    { icon: Target, title: 'Análisis Avanzado', description: 'Progreso detallado' },
    { icon: Brain, title: 'Tests Personalizados', description: 'Adaptados a ti' },
    { icon: ShieldCheck, title: 'Simulacros', description: 'Condiciones reales' },
  ];

  if (isPremium) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <div className="text-center mb-8">
          <Crown className="mx-auto w-16 h-16 text-amber-500 bg-amber-100 dark:bg-amber-800/20 p-3 rounded-full mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestiona tu Suscripción</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Actualmente tienes el Plan Premium.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Detalles del Plan</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              subscriptionInfo.cancelAtPeriodEnd 
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' 
                : 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
            }`}>
              {subscriptionInfo.cancelAtPeriodEnd ? 'Cancelada' : 'Activa'}
            </span>
          </div>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Suscripción</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">Premium Mensual</span>
            </div>
            {subscriptionInfo.endDate && (
              <div className="flex justify-between">
                <span>{subscriptionInfo.cancelAtPeriodEnd ? "Tu suscripción finaliza el" : "Próximo cobro"}</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {new Date(subscriptionInfo.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          <div className="mt-6">
            <button
              onClick={handleManageSubscription}
              disabled={isPortalRedirecting}
              className="w-full flex items-center justify-center py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-all disabled:opacity-50"
            >
              {isPortalRedirecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Cargando portal...
                </>
              ) : (
                <>
                  Gestionar mi suscripción
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">Serás redirigido a Stripe para gestionar tu plan.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto my-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Actualizar a Premium</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Desbloquea todas las funcionalidades y maximiza tu preparación.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Plan Premium</p>
          <p className="text-5xl font-extrabold text-primary my-2">€9.99<span className="text-lg font-medium text-gray-500 dark:text-gray-400">/mes</span></p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Cancela cuando quieras</p>
        </div>
        <ul className="space-y-3 mb-8">
          {planFeatures.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-gray-800 dark:text-gray-200">{feature}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={handleUpgrade}
          disabled={isRedirecting}
          className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:from-primary-hover hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRedirecting ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Redirigiendo...
            </div>
          ) : 'Actualizar ahora'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {featureCards.map((card, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl flex items-center">
            <card.icon className="w-6 h-6 text-primary mr-3" />
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{card.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">¿Por qué actualizar a Premium?</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Con Premium tendrás acceso completo a todas las herramientas necesarias para maximizar tu preparación y conseguir los mejores resultados en tus oposiciones.
        </p>
      </div>
    </div>
  );
} 