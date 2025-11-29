import React from 'react';

const Documentation: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          Жүйе Құжаттамасы
        </h1>

        {/* Кіріспе */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Кіріспе
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Бұл жүйе жасанды интеллект арқылы шабуылдар мен қорғаныс әдістерін зерттеу үшін 
              дайындалған демонстрациялық платформа. Жүйе шынайы шабуылдар жасап, AI-негізді 
              қорғаныс механизмдерін тестілеуге мүмкіндік береді.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                ⚠️ Маңызды: Бұл жүйе тек зерттеу және демонстрация мақсатында дайындалған. 
                Тек өз серверлеріңізге немесе рұқсат берілген серверлерге тестілеңіз.
              </p>
            </div>
          </div>
        </section>

        {/* Негізгі Мүмкіндіктер */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Негізгі Мүмкіндіктер
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                1. Шабуыл Симуляторы
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Шынайы шабуылдар жасау: DDoS, SQL Injection, XSS, Brute Force, Port Scan, 
                Phishing симуляциясы
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                2. Порт Сканерлеу
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Сервер порттарын сканерлеу, ашық порттарды табу, сервистерді анықтау
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                3. Қорғаныс Мониторингі
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Нақты уақыттағы қорғаныс күйін бақылау, блокталған шабуылдар саны, 
                сәттілік деңгейі
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                4. AI-негізді Талдау
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cursor AI API арқылы шабуыл үлгілерін талдау, қауіп деңгейін анықтау, 
                қорғаныс ұсыныстары
              </p>
            </div>
          </div>
        </section>

        {/* Қолдану Нұсқаулығы */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Қолдану Нұсқаулығы
          </h2>

          {/* Шабуыл Симуляторы */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
              Шабуыл Симуляторы
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>"Шабуыл Симуляторы" табын таңдаңыз</li>
              <li>Шабуыл түрін таңдаңыз (DDoS, SQL Injection, XSS, т.б.)</li>
              <li>Target URL енгізіңіз (көптеген шабуылдар үшін міндетті)</li>
              <li>Интенсивтілікті орнатыңыз (1-10)</li>
              <li>Ұзақтықты орнатыңыз (секунд)</li>
              <li>"Шынайы Шабуылды Бастау" батырмасын басыңыз</li>
            </ol>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                <strong>Ескерту:</strong> DDoS, SQL Injection, XSS, Brute Force, Port Scan 
                шабуылдары үшін Target URL міндетті.
              </p>
            </div>
          </div>

          {/* Порт Сканерлеу */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
              Порт Сканерлеу
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>"Порт Сканерлеу" табын таңдаңыз</li>
              <li>Target URL немесе IP адресін енгізіңіз</li>
              <li>Сканерлеу түрін таңдаңыз:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li><strong>Жалпы порттар:</strong> 24 кең таралған порт</li>
                  <li><strong>Барлық порттар:</strong> 1-65535 (100 портқа дейін шектеледі)</li>
                  <li><strong>Қолданбалы:</strong> Өзіңіз порттарды көрсетіңіз</li>
                </ul>
              </li>
              <li>"Порт Сканерлеуді Бастау" батырмасын басыңыз</li>
              <li>Нәтижелерді көріңіз: ашық, жабық, фильтрленген порттар</li>
            </ol>
          </div>

          {/* Қорғаныс Мониторингі */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
              Қорғаныс Мониторингі
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              "Қорғаныс Мониторингі" табында:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>Нақты уақыттағы қорғаныс күйін көру</li>
              <li>Блокталған шабуылдар саны</li>
              <li>Сәттілік деңгейі</li>
              <li>Белсенді қорғаныс механизмдері</li>
              <li>Уақыт бойынша графиктер</li>
            </ul>
          </div>

          {/* Қорғаныс Басқару */}
          <div className="mb-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">
              Қорғаныс Басқару
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              "Қорғаныс Басқару" табында қорғаныс механизмдерін басқаруға болады:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>AI Firewall - қосып/өшіру</li>
              <li>Intrusion Detection System (IDS) - баптау</li>
              <li>AI Rate Limiting - параметрлерді өзгерту</li>
              <li>AI Threat Detection - модель баптаулары</li>
              <li>Behavioral Analysis - қосып/өшіру</li>
            </ul>
          </div>
        </section>

        {/* Шабуыл Түрлері */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Шабуыл Түрлері
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                DDoS (Distributed Denial of Service)
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Серверді шабуылдармен басып тастау арқылы қызмет көрсетуді тоқтату. 
                Интенсивтілік 1-10 аралығында, әрбір бірлік 10 req/s құрайды.
              </p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                SQL Injection
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                SQL сұрауларына зиянды код енгізу арқылы дерекқорға қол жеткізу. 
                Әртүрлі SQL payload-тарды тестілейді.
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                XSS (Cross-Site Scripting)
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Веб-қосымшаларға зиянды JavaScript коды енгізу. 
                XSS payload-тарды тестілейді және олардың шағылуын тексереді.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                Brute Force
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Парольдерді күшпен табу әрекеттері. Кең таралған парольдерді тестілейді.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">
                Port Scanning
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Сервер порттарын сканерлеу арқылы ашық порттарды және сервистерді табу.
              </p>
            </div>
          </div>
        </section>

        {/* Қорғаныс Механизмдері */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Қорғаныс Механизмдері
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
                AI Firewall
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                AI-негізді қауіп анықтау және автоматты ереже генерациясы бар 
                интеллектуалды firewall
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
                Intrusion Detection System (IDS)
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Желі үлгілерін және мінез-құлықтарды талдайтын AI-негізді 
                бұзылу анықтау жүйесі
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
                AI Rate Limiting
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Трафик үлгілері мен шабуыл қолтаңбаларына сәйкес бейімделетін 
                интеллектуалды rate limiting
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
                AI Threat Detection
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Нақты уақытта әртүрлі шабуыл үлгілерін анықтау және 
                жіктеу үшін жетілдірілген AI моделі
              </p>
            </div>
          </div>
        </section>

        {/* AI Талдау */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            AI-негізді Талдау
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Жүйе Cursor AI API (немесе OpenAI API fallback) арқылы шабуылдарды талдайды:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li><strong>Шабуыл жіктемесі:</strong> Шабуыл түрін анықтау</li>
              <li><strong>Қауіп деңгейі:</strong> Low, Medium, High, Critical</li>
              <li><strong>Қорғаныс ұсыныстары:</strong> Қандай механизмдерді қосу керек</li>
              <li><strong>Автоматты блоктау:</strong> AI сенімділігіне байланысты шабуылдарды блоктау</li>
            </ul>
          </div>
        </section>

        {/* Техникалық Ақпарат */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Техникалық Ақпарат
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Frontend</h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Next.js 14</li>
                <li>• React 18</li>
                <li>• TypeScript</li>
                <li>• TailwindCSS</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Backend</h3>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• FastAPI</li>
                <li>• Python 3.9+</li>
                <li>• Cursor AI API / OpenAI API</li>
                <li>• Real-time attack execution</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Ескертулер */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Ескертулер
          </h2>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-red-800 dark:text-red-300">
              <li>Бұл жүйе тек зерттеу және демонстрация мақсатында</li>
              <li>Тек өз серверлеріңізге немесе рұқсат берілген серверлерге тестілеңіз</li>
              <li>Зиян келтіру мақсатында пайдаланбаңыз</li>
              <li>Барлық заңдар мен ережелерді сақтаңыз</li>
            </ul>
          </div>
        </section>

        {/* Байланыс */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Көмек
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Егер сізде сұрақтар болса немесе көмек қажет болса, жүйе логтарын 
            "Жүйе Логтары" табында тексеріңіз немесе статистиканы "Статистика" 
            табында көріңіз.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Documentation;

