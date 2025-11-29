import React, { useState, useEffect } from 'react';
import { api, DefenseStatus } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

interface DefenseMonitorProps {
  refreshInterval?: number;
}

const DefenseMonitor: React.FC<DefenseMonitorProps> = ({ refreshInterval = 5000 }) => {
  const [defenseStatus, setDefenseStatus] = useState<DefenseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Array<{ timestamp: string; success_rate: number; blocked: number }>>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDefenseStatus = async () => {
    try {
      setError(null);
      const status = await api.getDefenseStatus();
      setDefenseStatus(status);
      
      // Update history for chart
      setHistory((prev) => [
        ...prev.slice(-19), // Keep last 20 points
        {
          timestamp: new Date(status.timestamp).toLocaleTimeString(),
          success_rate: status.success_rate,
          blocked: status.blocked_attacks,
        },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Қорғаныс статусын алу сәтсіз аяқталды');
      toast.error('Қорғаныс статусын жүктеу сәтсіз аяқталды');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefenseStatus();
    const interval = setInterval(fetchDefenseStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading && !defenseStatus) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error && !defenseStatus) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Қорғаныс статусын жүктеу қатесі</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Қорғаныс Мониторингі
      </h2>

      {defenseStatus && (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Барлық Шабуылдар</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {defenseStatus.total_attacks}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Блокталған Шабуылдар</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {defenseStatus.blocked_attacks}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Сәттілік Деңгейі</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {defenseStatus.success_rate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Active Defenses */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Белсенді Қорғаныс Механизмдері
            </h3>
            <div className="flex flex-wrap gap-2">
              {defenseStatus.active_defenses.length > 0 ? (
                defenseStatus.active_defenses.map((defense, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-success-500 text-white rounded-full text-sm"
                  >
                    {defense}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 dark:text-gray-400">Белсенді қорғаныс жоқ</span>
              )}
            </div>
          </div>

          {/* Success Rate Chart */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Уақыт Бойынша Қорғаныс Сәттілік Деңгейі
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="success_rate"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Сәттілік Деңгейі (%)"
                />
                <Line
                  type="monotone"
                  dataKey="blocked"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Блокталған Шабуылдар"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Статус:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  defenseStatus.status === 'active'
                    ? 'bg-success-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}
              >
                {defenseStatus.status === 'active' ? 'БЕЛСЕНДІ' : defenseStatus.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Соңғы жаңарту: {new Date(defenseStatus.timestamp).toLocaleString('kk-KZ')}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DefenseMonitor;

