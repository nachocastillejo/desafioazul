import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { User, Clock, Target, TrendingUp } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const stats = {
    examsTaken: 5,
    averageScore: 75,
    totalTime: '12h 30m',
    bestScore: 85
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.fullName}</h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Exámenes</h3>
          </div>
          <p className="text-3xl font-bold">{stats.examsTaken}</p>
          <p className="text-gray-600">completados</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Promedio</h3>
          </div>
          <p className="text-3xl font-bold">{stats.averageScore}%</p>
          <p className="text-gray-600">de aciertos</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Clock className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Tiempo</h3>
          </div>
          <p className="text-3xl font-bold">{stats.totalTime}</p>
          <p className="text-gray-600">de estudio</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Target className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold">Mejor Nota</h3>
          </div>
          <p className="text-3xl font-bold">{stats.bestScore}%</p>
          <p className="text-gray-600">máxima</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-4">Historial de Exámenes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Fecha</th>
                <th className="text-left py-3">Tipo</th>
                <th className="text-left py-3">Puntuación</th>
                <th className="text-left py-3">Tiempo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3">12/03/2025</td>
                <td className="py-3">Simulacro Completo</td>
                <td className="py-3">85%</td>
                <td className="py-3">85 min</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">10/03/2025</td>
                <td className="py-3">Constitución</td>
                <td className="py-3">78%</td>
                <td className="py-3">45 min</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">08/03/2025</td>
                <td className="py-3">Derecho Penal</td>
                <td className="py-3">82%</td>
                <td className="py-3">30 min</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}