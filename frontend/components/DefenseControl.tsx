import React, { useState, useEffect } from 'react';
import { api, DefenseConfig, DefenseMechanism } from '@/lib/api';
import toast from 'react-hot-toast';

interface DefenseControlProps {
  onConfigUpdate?: () => void;
}

const DefenseControl: React.FC<DefenseControlProps> = ({ onConfigUpdate }) => {
  const [config, setConfig] = useState<DefenseConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setError(null);
      const defenseConfig = await api.getDefenseConfig();
      setConfig(defenseConfig);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Қорғаныс конфигурациясын алу сәтсіз аяқталды');
      toast.error('Қорғаныс конфигурациясын жүктеу сәтсіз аяқталды');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const toggleDefense = async (mechanismId: string, enabled: boolean) => {
    try {
      setSaving(true);
      await api.updateDefenseMechanism(mechanismId, { enabled });
      toast.success(`Қорғаныс механизмі ${enabled ? 'қосылды' : 'өшірілді'}`);
      await fetchConfig();
      if (onConfigUpdate) {
        onConfigUpdate();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Қорғаныс механизмін жаңарту сәтсіз аяқталды');
    } finally {
      setSaving(false);
    }
  };

  const updateDefenseSettings = async (mechanismId: string, settings: Record<string, any>) => {
    try {
      setSaving(true);
      await api.updateDefenseMechanism(mechanismId, { settings });
      toast.success('Қорғаныс баптаулары сәтті жаңартылды');
      await fetchConfig();
      if (onConfigUpdate) {
        onConfigUpdate();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Қорғаныс баптауларын жаңарту сәтсіз аяқталды');
    } finally {
      setSaving(false);
    }
  };

  const enableAllDefenses = async () => {
    if (!config) return;
    try {
      setSaving(true);
      for (const mechanism of config.mechanisms) {
        if (!mechanism.enabled) {
          await api.updateDefenseMechanism(mechanism.id, { enabled: true });
        }
      }
      toast.success('Барлық қорғаныс механизмдері қосылды');
      await fetchConfig();
      if (onConfigUpdate) {
        onConfigUpdate();
      }
    } catch (err: any) {
      toast.error('Барлық қорғаныстарды қосу сәтсіз аяқталды');
    } finally {
      setSaving(false);
    }
  };

  const disableAllDefenses = async () => {
    if (!config) return;
    try {
      setSaving(true);
      for (const mechanism of config.mechanisms) {
        if (mechanism.enabled) {
          await api.updateDefenseMechanism(mechanism.id, { enabled: false });
        }
      }
      toast.success('Барлық қорғаныс механизмдері өшірілді');
      await fetchConfig();
      if (onConfigUpdate) {
        onConfigUpdate();
      }
    } catch (err: any) {
      toast.error('Барлық қорғаныстарды өшіру сәтсіз аяқталды');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Қорғаныс конфигурациясын жүктеу қатесі</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Қорғаныс Басқару
        </h2>
        <div className="flex gap-2">
          <button
            onClick={enableAllDefenses}
            disabled={saving}
            className="px-4 py-2 bg-success-500 hover:bg-success-600 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Барлығын Қосу
          </button>
          <button
            onClick={disableAllDefenses}
            disabled={saving}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Барлығын Өшіру
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        ⚡ AI-негізді қорғаныс механизмдерін басқару. Нақты қорғаныстарды қосып/өшіру және олардың параметрлерін баптау.
      </p>

      {config && (
        <div className="space-y-4">
          {config.mechanisms.map((mechanism) => (
            <div
              key={mechanism.id}
              className={`border rounded-lg p-4 ${
                mechanism.enabled
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                  : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/10'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {mechanism.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        mechanism.enabled
                          ? 'bg-success-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {mechanism.enabled ? 'Белсенді' : 'Белсенді Емес'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {mechanism.description}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mechanism.enabled}
                    onChange={(e) => toggleDefense(mechanism.id, e.target.checked)}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-success-500"></div>
                </label>
              </div>

              {mechanism.enabled && mechanism.settings && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Баптаулар
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(mechanism.settings).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </label>
                        {typeof value === 'boolean' ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                updateDefenseSettings(mechanism.id, {
                                  ...mechanism.settings,
                                  [key]: e.target.checked,
                                })
                              }
                              disabled={saving}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        ) : typeof value === 'number' ? (
                          <input
                            type="number"
                            value={value}
                            onChange={(e) =>
                              updateDefenseSettings(mechanism.id, {
                                ...mechanism.settings,
                                [key]: parseFloat(e.target.value) || 0,
                              })
                            }
                            disabled={saving}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        ) : (
                          <input
                            type="text"
                            value={String(value)}
                            onChange={(e) =>
                              updateDefenseSettings(mechanism.id, {
                                ...mechanism.settings,
                                [key]: e.target.value,
                              })
                            }
                            disabled={saving}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mechanism.stats && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Блокталған</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {mechanism.stats.blocked || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Сәттілік Деңгейі</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {mechanism.stats.success_rate?.toFixed(1) || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Жауап Уақыты</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {mechanism.stats.response_time?.toFixed(0) || 0}мс
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DefenseControl;

