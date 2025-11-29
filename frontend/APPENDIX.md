# Қосымша: UI Интерфейсі мен Интеграциясы

## 1. UI Архитектурасы

### 1.1 Жүйенің Компоненттік Құрылымы

Жүйе модульдік компоненттік архитектураға негізделген, әр компонент өз міндетін орындайды:

#### AttackSimulator Компоненті
- **Мақсаты:** Шабуыл симуляциясын бастау
- **Функционалдығы:**
  - Шабуыл түрін таңдау (DDoS, SQL Injection, XSS, т.б.)
  - Интенсивтілік параметрін орнату (1-10)
  - Ұзақтықты көрсету (секундпен)
  - API арқылы шабуылды бастау
  - Нәтижелерді көрсету

#### DefenseMonitor Компоненті
- **Мақсаты:** Қорғаныс жүйесінің күйін мониторинг
- **Функционалдығы:**
  - Нақты уақыттағы статистика (блокталған шабуылдар, сәттілік деңгейі)
  - Белсенді қорғаныс механизмдерін көрсету
  - Уақыт бойынша графиктер (Recharts)
  - Автоматты жаңарту (5 секунд сайын)

#### LogsViewer Компоненті
- **Мақсаты:** Жүйе логтарын көрсету
- **Функционалдығы:**
  - Лог деңгейі бойынша фильтрлеу (INFO, WARNING, ERROR, SUCCESS)
  - Лог санын реттеу (50-500)
  - Автоматты скролл
  - Нақты уақытта жаңарту

#### StatisticsChart Компоненті
- **Мақсаты:** Статистикалық деректерді визуализациялау
- **Функционалдығы:**
  - Шабуыл түрлерінің таралуы (Pie Chart)
  - Қорғаныс механизмдерінің пайдалануы (Bar Chart)
  - Уақыт бойынша өзгерістер (Line Chart)
  - Latency графигі

### 1.2 Компонент Байланысы

```
┌─────────────────────────────────────────┐
│         index.tsx (Main Page)          │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │  Tab 1   │  │  Tab 2   │  ...      │
│  └──────────┘  └──────────┘           │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  AttackSimulator                │  │
│  │    ↓                            │  │
│  │  api.simulateAttack()           │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  DefenseMonitor                 │  │
│  │    ↓                            │  │
│  │  api.getDefenseStatus()         │  │
│  │    ↓                            │  │
│  │  StatisticsChart (nested)      │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│         lib/api.ts                      │
│  - Axios client configuration          │
│  - Request/Response interceptors        │
│  - Authentication handling              │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│      FastAPI Backend (main.py)          │
│  - /api/attacks/simulate               │
│  - /api/defense/status                 │
│  - /api/logs                           │
│  - /api/statistics                     │
└─────────────────────────────────────────┘
```

---

## 2. UI Кодының Толық Мысалдары

### 2.1 pages/index.tsx - Негізгі Бет

```tsx
import React, { useState } from 'react';
import Head from 'next/head';
import AttackSimulator from '@/components/AttackSimulator';
import DefenseMonitor from '@/components/DefenseMonitor';
import LogsViewer from '@/components/LogsViewer';
import StatisticsChart from '@/components/StatisticsChart';
import { AttackResponse } from '@/lib/api';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'defense' | 'logs' | 'statistics'>('simulator');
  const [recentAttacks, setRecentAttacks] = useState<AttackResponse[]>([]);

  const handleAttackStart = (response: AttackResponse) => {
    setRecentAttacks((prev) => [response, ...prev.slice(0, 4)]);
  };

  return (
    <>
      <Head>
        <title>AI Attack & Defense System - Research Dashboard</title>
        <meta name="description" content="AI-powered attack and defense simulation system" />
      </Head>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Header, Navigation, Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'simulator' && (
            <AttackSimulator onAttackStart={handleAttackStart} />
          )}
          {activeTab === 'defense' && <DefenseMonitor />}
          {activeTab === 'logs' && <LogsViewer />}
          {activeTab === 'statistics' && <StatisticsChart />}
        </main>
      </div>
    </>
  );
}
```

### 2.2 components/AttackSimulator.tsx - Толық Код

Компоненттің толық коды жобада `components/AttackSimulator.tsx` файлында орналасқан. Негізгі ерекшеліктері:

- **Form Management:** React hooks арқылы форма мәліметтерін басқару
- **API Integration:** `api.simulateAttack()` функциясын шақыру
- **Error Handling:** try-catch блоктары мен toast хабарламалары
- **Loading States:** Күту күйін көрсету
- **TypeScript Types:** Типтау қауіпсіздігі

### 2.3 components/DefenseMonitor.tsx - Толық Код

Компоненттің толық коды жобада `components/DefenseMonitor.tsx` файлында орналасқан. Негізгі ерекшеліктері:

- **Real-time Updates:** `useEffect` және `setInterval` арқылы
- **Chart Visualization:** Recharts кітапханасы
- **Status Cards:** Статистикалық карточкалар
- **Error Handling:** Қате жағдайларын өңдеу

---

## 3. API Байланысы - Толық Мысалдар

### 3.1 lib/api.ts - API Client

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    const apiKey = Cookies.get('api_key');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      Cookies.remove('api_key');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  async simulateAttack(attackData: AttackRequest): Promise<AttackResponse> {
    const response = await apiClient.post('/api/attacks/simulate', attackData);
    return response.data;
  },
  
  async getDefenseStatus(): Promise<DefenseStatus> {
    const response = await apiClient.get('/api/defense/status');
    return response.data;
  },
  
  // ... other API methods
};
```

### 3.2 POST Request Мысалы - Fetch API

```typescript
// Using native fetch API
const simulateAttackWithFetch = async (attackData: AttackRequest) => {
  const token = Cookies.get('auth_token');
  
  try {
    const response = await fetch('http://localhost:8000/api/attacks/simulate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(attackData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: AttackResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Attack simulation failed:', error);
    throw error;
  }
};
```

### 3.3 GET Request Мысалы - Axios

```typescript
// Using Axios (recommended)
const getDefenseStatusWithAxios = async (): Promise<DefenseStatus> => {
  try {
    const response = await apiClient.get('/api/defense/status', {
      params: {
        include_history: true,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
    }
    throw error;
  }
};
```

---

## 4. UI және API Интеграциясы

### 4.1 Environment Configuration

`.env.local` файлы (немесе `env.example`):

```env
# API Configuration
API_URL=http://localhost:8000

# Authentication
API_KEY=demo-api-key
JWT_SECRET=your-jwt-secret-here

# HTTPS (production)
HTTPS_ENABLED=false
```

### 4.2 Next.js Configuration

`next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'http://localhost:8000',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:8000'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### 4.3 API URL Configuration

Компоненттерде API URL пайдалану:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                process.env.API_URL || 
                'http://localhost:8000';
```

---

## 5. UI Визуализация Элементтері

### 5.1 Recharts Интеграциясы

#### Line Chart - Уақыт Бойынша Өзгерістер

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={timeSeriesData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="timestamp" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line 
      type="monotone" 
      dataKey="attacks" 
      stroke="#ef4444" 
      strokeWidth={2} 
      name="Attacks" 
    />
    <Line 
      type="monotone" 
      dataKey="blocked" 
      stroke="#10b981" 
      strokeWidth={2} 
      name="Blocked" 
    />
  </LineChart>
</ResponsiveContainer>
```

#### Pie Chart - Шабуыл Түрлерінің Таралуы

```tsx
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

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
```

### 5.2 Loading / Error / Success Messages

#### React Hot Toast Интеграциясы

```tsx
import toast from 'react-hot-toast';

// Success message
toast.success('Attack simulation started successfully', {
  duration: 3000,
  position: 'top-right',
});

// Error message
toast.error('Failed to start attack simulation', {
  duration: 4000,
  position: 'top-right',
});

// Loading state in component
{loading ? (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    <span className="ml-3">Processing...</span>
  </div>
) : (
  <button onClick={handleSubmit}>Submit</button>
)}
```

### 5.3 Response Latency және Defense Success Graph

```tsx
// Latency Chart
<LineChart data={statistics.time_series}>
  <Line 
    type="monotone" 
    dataKey="latency" 
    stroke="#3b82f6" 
    strokeWidth={2} 
    name="Latency (ms)" 
  />
</LineChart>

// Defense Success Rate Chart
<LineChart data={defenseHistory}>
  <Line 
    type="monotone" 
    dataKey="success_rate" 
    stroke="#10b981" 
    strokeWidth={2} 
    name="Success Rate (%)" 
  />
</LineChart>
```

---

## 6. UI Қауіпсіздігі

### 6.1 JWT Authentication

```typescript
// Login function
const login = async (username: string, password: string) => {
  try {
    const response = await api.login(username, password);
    Cookies.set('auth_token', response.token, { 
      expires: 7, // 7 days
      secure: true, // HTTPS only
      sameSite: 'strict'
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Token verification in requests
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 6.2 API Key Authentication

```typescript
// Set API key
const setApiKey = async (apiKey: string) => {
  Cookies.set('api_key', apiKey, { 
    expires: 7,
    secure: true,
    sameSite: 'strict'
  });
};

// Use in requests
apiClient.interceptors.request.use((config) => {
  const apiKey = Cookies.get('api_key');
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});
```

### 6.3 HTTPS және CORS Configuration

#### Backend (FastAPI)

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://yourdomain.com"  # Production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

#### Frontend (Next.js)

Production ортасында:

```javascript
// next.config.js
const nextConfig = {
  // Force HTTPS in production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};
```

---

## 7. UI Скриншот / Схема Сипаттамасы

### 7.1 Интерфейс Макеті (ASCII Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│  Header                                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AI Attack & Defense System          [System Online]     │  │
│  │  Research & Demonstration Platform                       │  │
│  └──────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  Navigation Tabs                                                │
│  [Attack Simulator] [Defense Monitor] [Logs] [Statistics]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────┐  ┌──────────────────────────┐  │
│  │  Attack Simulator          │  │  Information Panel       │  │
│  │                            │  │                          │  │
│  │  Attack Type: [Dropdown]   │  │  ⚠️ Research purposes     │  │
│  │  Target URL:  [Input]      │  │     only                 │  │
│  │  Intensity:   [1-10]       │  │                          │  │
│  │  Duration:    [seconds]    │  │  All attacks are         │  │
│  │                            │  │  simulated               │  │
│  │  [Start Attack Simulation] │  │                          │  │
│  └────────────────────────────┘  └──────────────────────────┘  │
│                                                                  │
│  Recent Attacks: [attack-id-1] [attack-id-2] ...              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Компонент Байланысы Диаграммасы

```
┌─────────────────────────────────────────────────────────────┐
│                    index.tsx                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Tab State   │  │  Recent       │  │  Navigation   │     │
│  │  Management  │  │  Attacks      │  │  Component    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│AttackSimulator│ │DefenseMonitor│ │  LogsViewer  │ │StatisticsChart│
│              │ │              │ │              │ │              │
│ - Form       │ │ - Status    │ │ - Filter     │ │ - Charts     │
│ - Submit     │ │ - Charts    │ │ - Auto-refresh│ │ - Statistics │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       └────────────────┴────────────────┴────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │   lib/api.ts    │
              │                 │
              │ - Axios client  │
              │ - Interceptors  │
              │ - API methods   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  FastAPI Backend│
              │                 │
              │ - /api/attacks  │
              │ - /api/defense  │
              │ - /api/logs     │
              │ - /api/stats    │
              └─────────────────┘
```

---

## 8. UI Орнату және Іске Қосу Нұсқаулығы

### 8.1 Алғышарттар

- Node.js 18+ 
- npm 9+ немесе yarn 1.22+
- Python 3.9+
- Git

### 8.2 Frontend Орнату

```bash
# 1. Dependencies орнату
npm install

# 2. Environment файлын құру
cp env.example .env.local
# .env.local файлын өзгертіңіз

# 3. Development серверін іске қосу
npm run dev

# Браузерде ашыңыз: http://localhost:3000
```

### 8.3 Production Build

```bash
# Build құру
npm run build

# Production серверін іске қосу
npm start

# Статикалық экспорт (optional)
npm run export
```

### 8.4 Backend Орнату

```bash
# 1. Virtual environment құру
python -m venv venv

# 2. Virtual environment іске қосу
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 3. Dependencies орнату
pip install -r backend/requirements.txt

# 4. Server іске қосу
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# API документациясы: http://localhost:8000/docs
```

### 8.5 Docker орнату (Optional)

```dockerfile
# Dockerfile (example)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 9. Қолданушы Нұсқаулығы

### 9.1 Жүйеге Кіру

1. Backend серверін іске қосыңыз (`http://localhost:8000`)
2. Frontend серверін іске қосыңыз (`http://localhost:3000`)
3. Браузерде `http://localhost:3000` ашыңыз

### 9.2 Attack Simulator Пайдалану

1. "Attack Simulator" табын таңдаңыз
2. Шабуыл түрін таңдаңыз:
   - DDoS Attack
   - SQL Injection
   - Cross-Site Scripting (XSS)
   - Brute Force
   - Port Scanning
   - Phishing Simulation
3. Параметрлерді орнатыңыз:
   - Intensity: 1-10 (шабуыл қарқындылығы)
   - Duration: секундпен (шабуыл ұзақтығы)
4. "Start Attack Simulation" батырмасын басыңыз
5. Нәтижелерді "Defense Monitor" табында көріңіз

### 9.3 Defense Monitor Көру

1. "Defense Monitor" табын таңдаңыз
2. Көрсетілетін ақпарат:
   - Total Attacks: Жалпы шабуылдар саны
   - Blocked Attacks: Блокталған шабуылдар
   - Success Rate: Қорғаныс сәттілік деңгейі (%)
   - Active Defenses: Белсенді қорғаныс механизмдері
3. Графиктерде уақыт бойынша өзгерістерді бақылаңыз

### 9.4 System Logs Тексеру

1. "System Logs" табын таңдаңыз
2. Фильтрлеу опциялары:
   - All Levels: Барлық логтар
   - INFO: Ақпараттық хабарламалар
   - WARNING: Ескертулер
   - ERROR: Қателер
   - SUCCESS: Сәтті операциялар
3. Лог санын реттеңіз (50, 100, 200, 500)
4. Логтар автоматты түрде жаңартылады

### 9.5 Statistics Көру

1. "Statistics" табын таңдаңыз
2. Көрсетілетін статистика:
   - Summary Cards: Жалпы статистика
   - Attacks & Defense Over Time: Уақыт бойынша график
   - Response Latency: Жауап беру кідірісі
   - Attack Types Distribution: Шабуыл түрлерінің таралуы
   - Defense Mechanisms Usage: Қорғаныс механизмдерінің пайдалануы

---

## 10. Техникалық Детальдар

### 10.1 Технологиялар

- **Frontend Framework:** Next.js 14.0.4
- **UI Library:** React 18.2.0
- **Language:** TypeScript 5.3.3
- **Styling:** TailwindCSS 3.4.0
- **Charts:** Recharts 2.10.3
- **HTTP Client:** Axios 1.6.2
- **Notifications:** React Hot Toast 2.4.1
- **Backend Framework:** FastAPI 0.104.1
- **Python Version:** 3.9+

### 10.2 Браузер Қолдауы

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

### 10.3 Performance Оптимизациялары

- Code splitting (Next.js automatic)
- Image optimization
- API response caching
- Real-time updates with efficient polling
- Lazy loading компоненттер

---

## 11. Ескертулер

⚠️ **Маңызды:** Бұл жүйе тек зерттеу және демонстрация мақсатында дайындалған. Барлық шабуылдар симуляция түрінде жүзеге асырылады және нақты зиян келтірмейді.

⚠️ **Important:** This system is designed for research and demonstration purposes only. All attacks are simulated and do not cause actual harm.

### Қауіпсіздік Ескертулері

- Production ортасында міндетті түрде HTTPS қолданыңыз
- API ключтерін және JWT токендерін қауіпсіз сақтаңыз
- CORS конфигурациясын дұрыс орнатыңыз
- Rate limiting қосыңыз
- Input validation орындаңыз

---

## 12. Қорытынды

Бұл UI интерфейсі жасанды интеллект арқылы шабуылдар мен қорғаныс жасау әдістерін зерттеу үшін толық функционалды демонстрациялық платформаны қамтамасыз етеді. Жүйе модульдік архитектураға негізделген, оңай кеңейтіледі және заманауи веб-технологияларын пайдаланады.

---

**Дата:** 2024  
**Автор:** Диплом жұмысы - Жасанды интеллект арқылы шабуылдар мен қорғаныс жасау әдістерін әзірлеу

