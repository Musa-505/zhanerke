import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import AttackResults from './AttackResults';

interface AttackHistoryItem {
  attack_id: string;
  status: string;
  message: string;
  timestamp: string;
  estimated_duration?: number;
  attack_type?: string;
  intensity?: number;
  duration?: number;
  target_url?: string;
  result?: any;
  ai_analysis?: any;
  block_decision?: any;
}

const AttackHistory: React.FC = () => {
  const [attacks, setAttacks] = useState<AttackHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttackId, setSelectedAttackId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all'); // all, completed, running, failed
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttackHistory();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchAttackHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAttackHistory = async () => {
    try {
      setLoading(true);
      const response = await api.getAttackHistory();
      setAttacks(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error('Attack history fetch error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Шабуылдар тарихын алу сәтсіз аяқталды';
      toast.error(errorMessage);
      setAttacks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'running':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Аяқталды';
      case 'running':
        return 'Жалғасуда';
      case 'failed':
        return 'Сәтсіз';
      default:
        return status;
    }
  };

  const getAttackTypeLabel = (type?: string) => {
    const types: Record<string, string> = {
      'ddos': 'DDoS Шабуылы',
      'sql_injection': 'SQL Injection',
      'xss': 'Cross-Site Scripting (XSS)',
      'brute_force': 'Brute Force',
      'port_scan': 'Порт Сканерлеу',
      'phishing': 'Phishing Симуляциясы',
    };
    return types[type || ''] || type || 'Белгісіз';
  };

  const filteredAttacks = attacks.filter((attack) => {
    const matchesFilter = filter === 'all' || attack.status === filter;
    const matchesSearch = 
      !searchTerm ||
      attack.attack_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attack.target_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAttackTypeLabel(attack.attack_type).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Шабуылдар Тарихы
          </h2>
          <button
            onClick={fetchAttackHistory}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            Жаңарту
          </button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Статус Бойынша Фильтрлеу
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Барлығы</option>
              <option value="completed">Аяқталған</option>
              <option value="running">Жалғасуда</option>
              <option value="failed">Сәтсіз</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Іздеу
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ID, URL немесе шабуыл түрі бойынша іздеу..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {attacks.length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Барлық Шабуылдар</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {attacks.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Аяқталған</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {attacks.filter(a => a.status === 'running').length}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Жалғасуда</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {attacks.filter(a => a.status === 'failed').length}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">Сәтсіз</div>
          </div>
        </div>

        {/* Attacks List */}
        {filteredAttacks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {attacks.length === 0 ? 'Шабуылдар тарихы жоқ' : 'Іздеу нәтижелері табылмады'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAttacks.map((attack) => (
              <div
                key={attack.attack_id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => setSelectedAttackId(selectedAttackId === attack.attack_id ? null : attack.attack_id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(attack.status)}`}>
                        {getStatusText(attack.status)}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">
                        {getAttackTypeLabel(attack.attack_type)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">ID:</span>{' '}
                        <span className="font-mono text-xs">{attack.attack_id.slice(0, 8)}...</span>
                      </div>
                      {attack.target_url && (
                        <div>
                          <span className="font-medium">Нысана:</span>{' '}
                          <span className="truncate">{attack.target_url}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Уақыт:</span>{' '}
                        {new Date(attack.timestamp).toLocaleString('kk-KZ')}
                      </div>
                    </div>
                    {attack.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {attack.message}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedAttackId === attack.attack_id ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedAttackId === attack.attack_id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <AttackResults attackId={attack.attack_id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackHistory;

