import React, { useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface PortScanResult {
  scan_id: string;
  target: string;
  host: string;
  open_ports: Array<{ port: number; service: string; status: string }>;
  closed_ports: number[];
  filtered_ports: number[];
  total_scanned: number;
  duration: number;
  timestamp: string;
  port_details: Array<{
    port: number;
    service: string;
    status: string;
    protocol: string;
  }>;
}

const PortScanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [scanType, setScanType] = useState<'common' | 'all' | 'custom'>('common');
  const [customPorts, setCustomPorts] = useState('');
  const [scanResult, setScanResult] = useState<PortScanResult | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetUrl) {
      toast.error('Нысана URL міндетті');
      return;
    }

    setLoading(true);
    setScanResult(null);

    try {
      const ports = scanType === 'custom' 
        ? customPorts.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p))
        : undefined;

      const response = await api.scanPorts({
        target_url: targetUrl,
        ports: ports && ports.length > 0 ? ports : undefined,
        scan_type: scanType
      });

      setScanResult(response);
      toast.success(`Порт сканерлеу аяқталды: ${response.open_ports.length} ашық порт табылды`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Порт сканерлеу сәтсіз аяқталды');
      console.error('Port scan error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPortStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'filtered':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Порт Сканерлеу
        </h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
            ℹ️ Порт Сканерлеу Құралы
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Нысана сервердің ашық порттарын және сервистерін сканерлеу. Бұл құрал шынайы порт сканерлеуді орындайды.
            Тек өз серверлеріңізге немесе рұқсат берілген серверлерге тестілеңіз.
          </p>
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label htmlFor="target_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Нысана URL / Хост <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="target_url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="example.com немесе https://example.com немесе 192.168.1.1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Домен атауы немесе IP адресін енгізіңіз
            </p>
          </div>

          <div>
            <label htmlFor="scan_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Сканерлеу Түрі
            </label>
            <select
              id="scan_type"
              value={scanType}
              onChange={(e) => setScanType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="common">Жалпы Порттар (24 порт)</option>
              <option value="all">Барлық Порттар (1-65535, 100 портқа дейін шектеледі)</option>
              <option value="custom">Қолданбалы Порттар</option>
            </select>
          </div>

          {scanType === 'custom' && (
            <div>
              <label htmlFor="custom_ports" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Қолданбалы Порттар <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="custom_ports"
                value={customPorts}
                onChange={(e) => setCustomPorts(e.target.value)}
                placeholder="80, 443, 8080, 3306"
                required={scanType === 'custom'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Үтірмен бөлінген порт нөмірлерін енгізіңіз (мысалы: 80, 443, 8080)
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              Порттар сканерленуде...
            </span>
          ) : (
            'Порт Сканерлеуді Бастау'
          )}
          </button>
        </form>
      </div>

      {scanResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Сканерлеу Нәтижелері
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(scanResult.timestamp).toLocaleString()}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {scanResult.open_ports.length}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Ашық Порттар</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {scanResult.closed_ports.length}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Жабық Порттар</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {scanResult.filtered_ports.length}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">Фильтрленген Порттар</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {scanResult.duration.toFixed(2)}с
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Ұзақтық</div>
            </div>
          </div>

          {/* Target Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Нысана:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{scanResult.target}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Хост:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{scanResult.host}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Барлығы Сканерленген:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{scanResult.total_scanned}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Сканерлеу ID:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                  {scanResult.scan_id.slice(0, 8)}
                </span>
              </div>
            </div>
          </div>

          {/* Open Ports */}
          {scanResult.open_ports.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Ашық Порттар ({scanResult.open_ports.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Порт
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Сервис
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Статус
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {scanResult.open_ports.map((port) => (
                      <tr key={port.port} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {port.port}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {port.service}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPortStatusColor(port.status)}`}>
                            {port.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All Port Details */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Барлық Порт Детальдары ({scanResult.port_details.length})
            </h4>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                  <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Порт
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Сервис
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Протокол
                      </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {scanResult.port_details.map((port, index) => (
                    <tr key={`${port.port}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {port.port}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {port.service}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPortStatusColor(port.status)}`}>
                          {port.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {port.protocol}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortScanner;

