import React, { useState } from 'react';
import { api, AttackRequest, AttackResponse } from '@/lib/api';
import toast from 'react-hot-toast';
import AttackResults from './AttackResults';

interface AttackSimulatorProps {
  onAttackStart?: (response: AttackResponse) => void;
}

const AttackSimulator: React.FC<AttackSimulatorProps> = ({ onAttackStart }) => {
  const [loading, setLoading] = useState(false);
  const [currentAttackId, setCurrentAttackId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AttackRequest>({
    attack_type: 'ddos',
    target_url: '',
    intensity: 5,
    duration: 60,
    parameters: {},
  });

  const attackTypes = [
    { value: 'ddos', label: 'DDoS Шабуылы' },
    { value: 'sql_injection', label: 'SQL Injection' },
    { value: 'xss', label: 'Cross-Site Scripting (XSS)' },
    { value: 'brute_force', label: 'Brute Force' },
    { value: 'port_scan', label: 'Порт Сканерлеу' },
    { value: 'phishing', label: 'Phishing Симуляциясы' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate target URL for real attacks
    if (['ddos', 'sql_injection', 'xss', 'brute_force', 'port_scan'].includes(formData.attack_type) && !formData.target_url) {
      toast.error('Бұл шабуыл түрі үшін Target URL міндетті');
      setLoading(false);
      return;
    }

    try {
      const response = await api.simulateAttack(formData);
      toast.success('Шынайы шабуыл сәтті басталды');
      setCurrentAttackId(response.attack_id);
      if (onAttackStart) {
        onAttackStart(response);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Шабуылды бастау сәтсіз аяқталды');
      console.error('Attack error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'intensity' || name === 'duration' ? parseInt(value) : value,
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Шабуыл Симуляторы
      </h2>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium mb-2">
          ⚠️ Шынайы Шабуыл Орындау Режимі
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-400">
          Бұл жүйе зерттеу және демонстрация мақсатында шынайы шабуылдар орындайды. 
          Тек өз серверлеріңізге немесе рұқсат берілген серверлерге тестілеңіз. 
          DDoS, SQL Injection, XSS, Brute Force және Port Scan шабуылдары үшін Target URL міндетті.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="attack_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Шабуыл Түрі
          </label>
          <select
            id="attack_type"
            name="attack_type"
            value={formData.attack_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            {attackTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="target_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Нысана URL {['ddos', 'sql_injection', 'xss', 'brute_force', 'port_scan'].includes(formData.attack_type) && <span className="text-red-500">*</span>}
          </label>
          <input
            type="url"
            id="target_url"
            name="target_url"
            value={formData.target_url}
            onChange={handleChange}
            placeholder="https://your-server.com"
            required={['ddos', 'sql_injection', 'xss', 'brute_force', 'port_scan'].includes(formData.attack_type)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {['ddos', 'sql_injection', 'xss', 'brute_force', 'port_scan'].includes(formData.attack_type) && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {formData.attack_type.replace('_', ' ')} шабуылдары үшін міндетті
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Интенсивтілік (1-10)
            </label>
            <input
              type="number"
              id="intensity"
              name="intensity"
              value={formData.intensity}
              onChange={handleChange}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ұзақтық (секунд)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              max="3600"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-danger-500 hover:bg-danger-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Шабуыл басталуда...
            </span>
          ) : (
            'Шынайы Шабуылды Бастау'
          )}
        </button>
      </form>

      {/* Attack Results */}
      {currentAttackId && (
        <div className="mt-6">
          <AttackResults attackId={currentAttackId} />
        </div>
      )}
    </div>
  );
};

export default AttackSimulator;

