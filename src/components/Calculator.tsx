import React, { useState } from 'react';
import { Calculator as CalcIcon } from 'lucide-react';

export default function Calculator() {
  const [totalQuestions, setTotalQuestions] = useState(100);
  const [correctAnswers, setCorrectAnswers] = useState(72);
  const [incorrectAnswers, setIncorrectAnswers] = useState(18);
  const [alternatives, setAlternatives] = useState(3);
  const [score, setScore] = useState<number | null>(null);

  const calculateScore = () => {
    const penalization = incorrectAnswers / (alternatives - 1);
    const result = ((correctAnswers - penalization) * 10) / totalQuestions;
    setScore(Math.max(0, Number(result.toFixed(2))));
  };

  // Nuevo estilo: fondo blanco en modo claro y gris oscuro en modo oscuro, sin gradiente.
  const cardStyle =
    "card p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 rounded-xl";

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className={cardStyle}>
        <div className="flex items-center space-x-3 p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
            <CalcIcon className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary dark:text-white">
            Calculadora de Nota
          </h1>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
              Número de preguntas
            </label>
            <select
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="input-field"
            >
              {Array.from({ length: 100 }, (_, i) => 100 - i).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
              Número de aciertos
            </label>
            <select
              value={correctAnswers}
              onChange={(e) => setCorrectAnswers(Number(e.target.value))}
              className="input-field"
            >
              {Array.from({ length: totalQuestions + 1 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
              Número de errores
            </label>
            <select
              value={incorrectAnswers}
              onChange={(e) => setIncorrectAnswers(Number(e.target.value))}
              className="input-field"
            >
              {Array.from({ length: totalQuestions - correctAnswers + 1 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
              Número de alternativas de respuesta
            </label>
            <div className="flex space-x-2">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setAlternatives(num)}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-colors ${
                    alternatives === num
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                      : 'bg-gray-50 dark:bg-gray-700 text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm text-text-secondary dark:text-gray-400">
            Se utilizará la fórmula: [ A - E / (n - 1) ] * 10 / P
            <div className="mt-2 text-xs">
              Siendo:
              <ul className="mt-1 space-y-1">
                <li>• A: número de aciertos</li>
                <li>• E: número de errores</li>
                <li>• n: número de alternativas</li>
                <li>• P: número total de preguntas</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={calculateScore}
              className="btn-primary px-6 py-2.5 rounded-xl"
            >
              Calcular
            </button>
            {score !== null && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-text-secondary dark:text-gray-400">
                  Nota:
                </span>
                <span className="text-3xl font-bold text-primary">{score}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
