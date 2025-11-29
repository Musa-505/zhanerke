import React, { useState } from 'react';
import Head from 'next/head';
import AttackSimulator from '@/components/AttackSimulator';
import DefenseMonitor from '@/components/DefenseMonitor';
import DefenseControl from '@/components/DefenseControl';
import LogsViewer from '@/components/LogsViewer';
import StatisticsChart from '@/components/StatisticsChart';
import PortScanner from '@/components/PortScanner';
import Documentation from '@/components/Documentation';
import AttackHistory from '@/components/AttackHistory';
import { AttackResponse } from '@/lib/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'defense' | 'defense-control' | 'logs' | 'statistics' | 'port-scanner' | 'documentation' | 'history'>('simulator');
  const [recentAttacks, setRecentAttacks] = useState<AttackResponse[]>([]);
  const [defenseConfigUpdated, setDefenseConfigUpdated] = useState(0);

  const handleAttackStart = (response: AttackResponse) => {
    setRecentAttacks((prev) => [response, ...prev.slice(0, 4)]);
  };

  return (
    <>
      <Head>
        <title>AI Шабуыл және Қорғаныс Жүйесі - Зерттеу Панелі</title>
        <meta name="description" content="Жасанды интеллект арқылы шабуылдар мен қорғаныс әдістерін зерттеу жүйесі" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  AI Шабуыл және Қорғаныс Жүйесі
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Зерттеу және Демонстрация Платформасы
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                  Жүйе Онлайн
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {[
                { id: 'simulator', label: 'Шабуыл Симуляторы' },
                { id: 'port-scanner', label: 'Порт Сканерлеу' },
                { id: 'history', label: 'Шабуылдар Тарихы' },
                { id: 'defense', label: 'Қорғаныс Мониторингі' },
                { id: 'defense-control', label: 'Қорғаныс Басқару' },
                { id: 'logs', label: 'Жүйе Логтары' },
                { id: 'statistics', label: 'Статистика' },
                { id: 'documentation', label: 'Құжаттар' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Recent Attacks Sidebar */}
          {recentAttacks.length > 0 && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Соңғы Шабуыл Симуляциялары
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentAttacks.map((attack) => (
                  <div
                    key={attack.attack_id}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                  >
                    <span className="font-medium">{attack.attack_id.slice(0, 8)}</span>
                    <span className="mx-2 text-gray-500">•</span>
                    <span className={attack.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}>
                      {attack.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'simulator' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AttackSimulator onAttackStart={handleAttackStart} />
                </div>
                <div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Ақпарат
                    </h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">
                        ⚠️ Шынайы Шабуыл Орындау Режимі
                      </p>
                      <p>
                        Бұл жүйе зерттеу және демонстрация мақсатында шынайы шабуылдар орындайды.
                        Тек өз серверлеріңізге немесе рұқсат берілген серверлерге тестілеңіз.
                      </p>
                      <p>
                        AI-негізді қорғаныс механизмдері Cursor AI API арқылы нақты уақытта 
                        шабуылдарды талдап, қауіптерді автоматты түрде анықтап блоктайды.
                      </p>
                      <p className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <strong>Ескерту:</strong> DDoS, SQL Injection, XSS, Brute Force және 
                        Port Scan шабуылдары үшін Target URL міндетті.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'defense' && <DefenseMonitor key={defenseConfigUpdated} />}

            {activeTab === 'defense-control' && (
              <DefenseControl
                onConfigUpdate={() => {
                  setDefenseConfigUpdated((prev) => prev + 1);
                }}
              />
            )}

            {activeTab === 'port-scanner' && <PortScanner />}

            {activeTab === 'history' && <AttackHistory />}

            {activeTab === 'logs' && <LogsViewer />}

            {activeTab === 'statistics' && <StatisticsChart />}

            {activeTab === 'documentation' && <Documentation />}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              © 2024 AI Шабуыл және Қорғаныс Зерттеу Жүйесі. Тек білім беру және зерттеу мақсатында.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

