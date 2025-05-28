import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Target, User } from 'lucide-react';

export default function Home() {
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
            className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-primary/20"
          >
            Iniciar Test
          </Link>
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
