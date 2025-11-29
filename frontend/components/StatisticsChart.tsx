import React, { useState, useEffect } from 'react';
import { api, Statistics } from '@/lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

interface StatisticsChartProps {
  timeRange?: string;
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ timeRange = '24h' }) => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setError(null);
        const stats = await api.getStatistics(timeRange);
        setStatistics(stats);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Статистиканы алу сәтсіз аяқталды');
        toast.error('Статистиканы жүктеу сәтсіз аяқталды');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
    const interval = setInterval(fetchStatistics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Статистиканы жүктеу қатесі</p>
          <p className="text-sm mt-2">{error || 'Деректер жоқ'}</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const attackTypesData = Object.entries(statistics.attack_types).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
  }));

  const defenseMechanismsData = Object.entries(statistics.defense_mechanisms).map(([name, value]) => ({
    name: name.replace('_', ' ').toUpperCase(),
    value,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Статистика Панелі
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Барлық Шабуылдар</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {statistics.total_attacks}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Блокталған Шабуылдар</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {statistics.blocked_attacks}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Сәттілік Деңгейі</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {statistics.success_rate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Орташа Кідіріс</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {statistics.average_latency.toFixed(0)}мс
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Time Series Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Уақыт Бойынша Шабуылдар және Қорғаныс
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statistics.time_series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attacks" stroke="#ef4444" strokeWidth={2} name="Шабуылдар" />
              <Line type="monotone" dataKey="blocked" stroke="#10b981" strokeWidth={2} name="Блокталған" />
              <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} name="Кідіріс (мс)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Latency Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Жауап Кідірісі
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={statistics.time_series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} name="Кідіріс (мс)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attack Types Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Шабуыл Түрлерінің Таралуы
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={attackTypesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {attackTypesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Defense Mechanisms */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Қорғаныс Механизмдерінің Пайдалануы
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={defenseMechanismsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatisticsChart;

