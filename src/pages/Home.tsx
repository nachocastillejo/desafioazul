import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Target, User } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      {/* Sección de Identidad */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-2">
          Método Leal
        </h1>
        <p className="text-lg text-text-secondary dark:text-gray-400">
          Consigue tu plaza en la Policía Nacional
        </p>
      </div>

      {/* Sección Principal */}
      <div className="card p-6 sm:p-8 mb-8 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent dark:from-primary/10 shadow-2xl shadow-primary/10 dark:shadow-primary/20 transition-all duration-300">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary dark:text-white mb-4">
            Simula Exámenes y Supera la Oposición
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
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/10 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20 transition-all duration-300">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 shadow-inner">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">
            Tests a Medida
          </h3>
          <p className="text-text-secondary dark:text-gray-400">
            Personaliza el número de preguntas y focaliza tu estudio en los temas que más necesitas reforzar.
          </p>
        </div>

        <div className="card p-6 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/10 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20 transition-all duration-300">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4 shadow-inner">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary dark:text-white mb-2">
            Preguntas Actualizadas
          </h3>
          <p className="text-text-secondary dark:text-gray-400">
            Enfréntate a preguntas elaboradas a partir del temario oficial, para que siempre estés un paso adelante.
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
            Consulta tu historial de tests, analiza tus resultados y sigue tu evolución paso a paso para mejorar tu rendimiento.
          </p>
        </div>
      </div>
    </div>
  );
}
