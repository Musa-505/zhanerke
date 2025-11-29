import React, { useState, useEffect, useRef } from 'react';
import { api, LogEntry } from '@/lib/api';
import toast from 'react-hot-toast';

interface LogsViewerProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const LogsViewer: React.FC<LogsViewerProps> = ({ autoRefresh = true, refreshInterval = 2000 }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [limit, setLimit] = useState<number>(100);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchLogs = async () => {
    try {
      const fetchedLogs = await api.getLogs(limit, filter !== 'all' ? filter : undefined);
      setLogs(fetchedLogs);
    } catch (error: any) {
      toast.error('Логтарды алу сәтсіз аяқталды');
      console.error('Logs fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [filter, limit, autoRefresh, refreshInterval]);

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700';
      case 'WARNING':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
      case 'SUCCESS':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
      case 'INFO':
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
    }
  };

  const filteredLogs = filter === 'all' ? logs : logs.filter((log) => log.level === filter);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Жүйе Логтары
        </h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">Барлық Деңгейлер</option>
            <option value="INFO">Ақпарат</option>
            <option value="WARNING">Ескерту</option>
            <option value="ERROR">Қате</option>
            <option value="SUCCESS">Сәтті</option>
          </select>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value={50}>50 лог</option>
            <option value={100}>100 лог</option>
            <option value={200}>200 лог</option>
            <option value={500}>500 лог</option>
          </select>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
          {filteredLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Логтар жоқ</p>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.log_id}
                className={`mb-2 p-2 rounded border-l-4 ${getLogLevelColor(log.level)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="font-bold">{log.level}</span>
                    <span className="mx-2 text-gray-600 dark:text-gray-400">|</span>
                    <span className="text-gray-600 dark:text-gray-400">{log.category}</span>
                    <span className="mx-2 text-gray-600 dark:text-gray-400">|</span>
                    <span className="text-gray-500 dark:text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-gray-800 dark:text-gray-200">{log.message}</p>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-gray-600 dark:text-gray-400">
                      Метадеректер
                    </summary>
                    <pre className="mt-1 text-xs bg-gray-800 p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
};

export default LogsViewer;

