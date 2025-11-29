import React, { useState, useEffect } from 'react';
import { api, AttackResponse } from '@/lib/api';
import toast from 'react-hot-toast';

interface AttackResultsProps {
  attackId: string;
}

const AttackResults: React.FC<AttackResultsProps> = ({ attackId }) => {
  const [attack, setAttack] = useState<AttackResponse & { 
    result?: any; 
    ai_analysis?: any; 
    block_decision?: any;
    attack_type?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttack = async () => {
      try {
        const response = await api.getAttackStatus(attackId);
        setAttack(response as any);
      } catch (error: any) {
        toast.error('Шабуыл нәтижелерін алу сәтсіз аяқталды');
        console.error('Attack fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (attackId) {
      fetchAttack();
      // Auto-refresh every 2 seconds until completed
      const interval = setInterval(() => {
        fetchAttack();
        if (attack?.status === 'completed' || attack?.status === 'failed') {
          clearInterval(interval);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [attackId, attack?.status]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!attack) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-400">Шабуыл табылмады</p>
      </div>
    );
  }

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

  const renderAttackResults = () => {
    if (!attack.result) return null;

    const attackType = attack.attack_type || '';
    const result = attack.result;

    // Port Scan Results
    if (result.open_ports !== undefined || result.closed_ports !== undefined) {
      const portServicesMap: Record<number, string> = {
        21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
        80: 'HTTP', 110: 'POP3', 111: 'RPC', 135: 'MSRPC', 139: 'NetBIOS',
        143: 'IMAP', 443: 'HTTPS', 445: 'SMB', 993: 'IMAPS', 995: 'POP3S',
        1723: 'PPTP', 3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL',
        5900: 'VNC', 8080: 'HTTP-Proxy', 8443: 'HTTPS-Alt', 8888: 'HTTP-Alt', 9000: 'SonarQube'
      };

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {result.open_ports?.length || 0}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Ашық Порттар</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {result.closed_ports?.length || 0}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Жабық Порттар</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {result.filtered_ports?.length || 0}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Фильтрленген Порттар</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {result.duration ? result.duration.toFixed(2) : '0'}с
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Ұзақтық</div>
            </div>
          </div>

          {result.host && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Хост</p>
              <p className="font-semibold text-gray-800 dark:text-white">{result.host}</p>
              {result.total_scanned && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Барлығы сканерленген: {result.total_scanned} порт
                </p>
              )}
            </div>
          )}

          {result.open_ports && result.open_ports.length > 0 && (
            <div>
              <h5 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
                Ашық Порттар ({result.open_ports.length})
              </h5>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Порт
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Сервис
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Статус
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {result.open_ports.map((port: number) => (
                      <tr key={port} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {port}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {portServicesMap[port] || 'Белгісіз'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            АШЫҚ
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <h5 className="text-md font-semibold text-gray-800 dark:text-white mb-3">
              Барлық Порттар
            </h5>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {result.open_ports && result.open_ports.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Ашық:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.open_ports.map((port: number) => (
                        <span key={port} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded text-xs">
                          {port}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.closed_ports && result.closed_ports.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1">Жабық:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.closed_ports.slice(0, 20).map((port: number) => (
                        <span key={port} className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded text-xs">
                          {port}
                        </span>
                      ))}
                      {result.closed_ports.length > 20 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{result.closed_ports.length - 20} тағы
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {result.filtered_ports && result.filtered_ports.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 mb-1">Фильтрленген:</p>
                    <div className="flex flex-wrap gap-1">
                      {result.filtered_ports.slice(0, 20).map((port: number) => (
                        <span key={port} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded text-xs">
                          {port}
                        </span>
                      ))}
                      {result.filtered_ports.length > 20 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{result.filtered_ports.length - 20} тағы
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // DDoS Attack Results
    if (attackType === 'ddos' || result.requests_sent !== undefined) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {result.requests_sent || 0}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Жіберілген Сұраулар</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {result.successful_requests || 0}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Сәтті Сұраулар</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {result.failed_requests || 0}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Сәтсіз Сұраулар</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {result.average_rps ? result.average_rps.toFixed(1) : '0'}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Орташа RPS</div>
            </div>
          </div>
          {result.duration && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ұзақтық</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {result.duration.toFixed(2)} секунд
              </p>
            </div>
          )}
        </div>
      );
    }

    // SQL Injection Results
    if (attackType === 'sql_injection' || (result.attempts !== undefined && result.vulnerable !== undefined)) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {result.attempts || 0}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Әрекеттер Саны</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {result.detected || 0}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Анықталған</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {result.vulnerable || 0}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Зиянды</div>
            </div>
          </div>
          {result.vulnerable > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                ⚠️ SQL Injection уязвимость табылды!
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                Сервер SQL injection шабуылдарына сезімтал болып табылады.
              </p>
            </div>
          )}
          {result.duration && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ұзақтық</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {result.duration.toFixed(2)} секунд
              </p>
            </div>
          )}
        </div>
      );
    }

    // XSS Attack Results
    if (attackType === 'xss' || (result.attempts !== undefined && result.vulnerable !== undefined && result.detected !== undefined)) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {result.attempts || 0}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Әрекеттер Саны</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {result.detected || 0}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Анықталған</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {result.vulnerable || 0}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Зиянды</div>
            </div>
          </div>
          {result.vulnerable > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                ⚠️ XSS уязвимость табылды!
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                Сервер Cross-Site Scripting шабуылдарына сезімтал болып табылады.
              </p>
            </div>
          )}
          {result.duration && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ұзақтық</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {result.duration.toFixed(2)} секунд
              </p>
            </div>
          )}
        </div>
      );
    }

    // Brute Force Results
    if (attackType === 'brute_force' || result.blocked !== undefined) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {result.attempts || 0}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Әрекеттер Саны</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {result.blocked || 0}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Блокталған</div>
            </div>
          </div>
          {result.blocked > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                ℹ️ {result.blocked} әрекет қорғаныс жүйесі арқылы блокталды
              </p>
            </div>
          )}
          {result.duration && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ұзақтық</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {result.duration.toFixed(2)} секунд
              </p>
            </div>
          )}
        </div>
      );
    }

    // Default - show JSON for other attack types
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Шабуыл Нәтижелері
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(attack.status)}`}>
          {getStatusText(attack.status)}
        </span>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Шабуыл ID</p>
          <p className="font-mono text-sm text-gray-800 dark:text-white">{attack.attack_id}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Уақыт</p>
          <p className="text-sm text-gray-800 dark:text-white">
            {new Date(attack.timestamp).toLocaleString('kk-KZ')}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Хабарлама</p>
          <p className="text-sm text-gray-800 dark:text-white">{attack.message}</p>
        </div>
        {attack.estimated_duration && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Болжалды Ұзақтық</p>
            <p className="text-sm text-gray-800 dark:text-white">{attack.estimated_duration} секунд</p>
          </div>
        )}
      </div>

      {/* Attack Results */}
      {attack.result && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Шабуыл Нәтижелері
          </h4>
          {renderAttackResults()}
        </div>
      )}

      {/* AI Analysis */}
      {attack.ai_analysis && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            AI Талдау
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Шабуыл Жіктемесі</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {attack.ai_analysis.attack_classification || 'N/A'}
              </p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Қауіп Деңгейі</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {attack.ai_analysis.threat_level || 'N/A'}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Сенімділік</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {attack.ai_analysis.confidence ? (attack.ai_analysis.confidence * 100).toFixed(1) + '%' : 'N/A'}
              </p>
            </div>
            {attack.ai_analysis.recommended_defenses && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ұсынылған Қорғаныстар</p>
                <div className="flex flex-wrap gap-2">
                  {attack.ai_analysis.recommended_defenses.map((defense: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-xs">
                      {defense}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {attack.ai_analysis.characteristics && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Сипаттамалар</p>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>Үлгі:</strong> {attack.ai_analysis.characteristics.pattern || 'N/A'}</p>
                <p><strong>Дағдылық:</strong> {attack.ai_analysis.characteristics.sophistication || 'N/A'}</p>
                <p><strong>Потенциалды Зиян:</strong> {attack.ai_analysis.characteristics.potential_damage || 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Block Decision */}
      {attack.block_decision && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Блоктау Шешімі
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`rounded-lg p-4 ${attack.block_decision.should_block ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Блокталды ма?</p>
              <p className={`font-semibold ${attack.block_decision.should_block ? 'text-red-800 dark:text-red-300' : 'text-green-800 dark:text-green-300'}`}>
                {attack.block_decision.should_block ? 'Иә, блокталды' : 'Жоқ, блокталмады'}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">AI Сенімділігі</p>
              <p className="font-semibold text-gray-800 dark:text-white">
                {attack.block_decision.confidence ? (attack.block_decision.confidence * 100).toFixed(1) + '%' : 'N/A'}
              </p>
            </div>
            {attack.block_decision.reason && (
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Себеп</p>
                <p className="text-sm text-gray-800 dark:text-white">{attack.block_decision.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {attack.status === 'running' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            ⏳ Шабуыл әлі жалғасуда. Нәтижелер автоматты түрде жаңартылады...
          </p>
        </div>
      )}
    </div>
  );
};

export default AttackResults;

