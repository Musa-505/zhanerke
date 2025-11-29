# AI Attack & Defense System - UI Interface Documentation

## Кіріспе (Introduction)

Бұл жоба жасанды интеллект арқылы шабуылдар мен қорғаныс жасау әдістерін зерттеу үшін дайындалған демонстрациялық платформа. UI интерфейсі Next.js және TailwindCSS арқылы құрылған, ал backend FastAPI фреймворкінде жазылған.

This project is a demonstration platform for researching attack and defense methods using artificial intelligence. The UI interface is built with Next.js and TailwindCSS, while the backend is written in FastAPI framework.

---

## UI Архитектурасы (UI Architecture)

### Компоненттік құрылым (Component Structure)

Жүйе модульдік компоненттік архитектураға негізделген:

```
src/
├── pages/
│   ├── _app.tsx          # Next.js app wrapper
│   └── index.tsx          # Main dashboard page
├── components/
│   ├── AttackSimulator.tsx    # Attack simulation component
│   ├── DefenseMonitor.tsx     # Defense monitoring component
│   ├── LogsViewer.tsx         # System logs viewer
│   └── StatisticsChart.tsx    # Statistics visualization
├── lib/
│   └── api.ts            # API client and utilities
└── styles/
    └── globals.css       # Global styles
```

### Негізгі компоненттер (Main Components)

#### 1. **AttackSimulator** 
Шабуыл симуляциясын бастауға арналған компонент. Пайдаланушы шабуыл түрін, интенсивтілікті және ұзақтықты таңдай алады.

#### 2. **DefenseMonitor**
Қорғаныс жүйесінің нақты уақыттағы күйін көрсететін компонент. Блокталған шабуылдар саны, сәттілік деңгейі және белсенді қорғаныс механизмдерін көрсетеді.

#### 3. **LogsViewer**
Жүйе логтарын көрсететін компонент. Фильтрлеу және нақты уақытта жаңарту мүмкіндіктері бар.

#### 4. **StatisticsChart**
Статистикалық деректерді визуализациялайтын компонент. Recharts кітапханасын пайдаланады.

---

## UI Кодының Мысалдары (UI Code Examples)

### pages/index.tsx

```tsx
import React, { useState } from 'react';
import Head from 'next/head';
import AttackSimulator from '@/components/AttackSimulator';
import DefenseMonitor from '@/components/DefenseMonitor';
import LogsViewer from '@/components/LogsViewer';
import StatisticsChart from '@/components/StatisticsChart';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'defense' | 'logs' | 'statistics'>('simulator');

  return (
    <>
      <Head>
        <title>AI Attack & Defense System</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation and content */}
      </div>
    </>
  );
}
```

### components/AttackSimulator.tsx

```tsx
import React, { useState } from 'react';
import { api, AttackRequest } from '@/lib/api';
import toast from 'react-hot-toast';

const AttackSimulator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AttackRequest>({
    attack_type: 'ddos',
    intensity: 5,
    duration: 60,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.simulateAttack(formData);
      toast.success('Attack simulation started');
    } catch (error) {
      toast.error('Failed to start attack');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### components/DefenseMonitor.tsx

```tsx
import React, { useState, useEffect } from 'react';
import { api, DefenseStatus } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DefenseMonitor: React.FC = () => {
  const [defenseStatus, setDefenseStatus] = useState<DefenseStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await api.getDefenseStatus();
      setDefenseStatus(status);
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Status display and charts */}
    </div>
  );
};
```

---

## API Байланысы (API Integration)

### lib/api.ts - API Client

```typescript
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  async simulateAttack(attackData: AttackRequest): Promise<AttackResponse> {
    const response = await apiClient.post('/api/attacks/simulate', attackData);
    return response.data;
  },

  async getDefenseStatus(): Promise<DefenseStatus> {
    const response = await apiClient.get('/api/defense/status');
    return response.data;
  },
};
```

### API Сұрау Мысалдары (API Request Examples)

#### POST Request - Attack Simulation

```typescript
// Using fetch
const response = await fetch('http://localhost:8000/api/attacks/simulate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    attack_type: 'ddos',
    intensity: 5,
    duration: 60,
  }),
});
const data = await response.json();

// Using axios (recommended)
const response = await api.simulateAttack({
  attack_type: 'ddos',
  intensity: 5,
  duration: 60,
});
```

#### GET Request - Defense Status

```typescript
// Using fetch
const response = await fetch('http://localhost:8000/api/defense/status', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const status = await response.json();

// Using axios
const status = await api.getDefenseStatus();
```

---

## UI және API Интеграциясы (UI and API Integration)

### Environment Configuration

`.env.local` файлында API URL конфигурациясы:

```env
API_URL=http://localhost:8000
API_KEY=your-api-key-here
JWT_SECRET=your-jwt-secret-here
```

### Next.js Configuration

`next.config.js` файлында API rewrites:

```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/:path*`,
      },
    ];
  },
};
```

---

## UI Визуализация Элементтері (UI Visualization Elements)

### Chart.js / Recharts Интеграциясы

```tsx
import { LineChart, Line, BarChart, Bar, PieChart, Pie, ResponsiveContainer } from 'recharts';

// Line Chart Example
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={timeSeriesData}>
    <XAxis dataKey="timestamp" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="attacks" stroke="#ef4444" />
    <Line type="monotone" dataKey="blocked" stroke="#10b981" />
  </LineChart>
</ResponsiveContainer>

// Pie Chart Example
<PieChart>
  <Pie
    data={attackTypesData}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    outerRadius={80}
  />
</PieChart>
```

### Loading / Error / Success Messages

```tsx
import toast from 'react-hot-toast';

// Success message
toast.success('Attack simulation started successfully');

// Error message
toast.error('Failed to start attack simulation');

// Loading state
{loading ? (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
) : (
  <button>Submit</button>
)}
```

### Response Latency және Defense Success Graph

```tsx
<LineChart data={statistics.time_series}>
  <Line type="monotone" dataKey="latency" stroke="#3b82f6" name="Latency (ms)" />
  <Line type="monotone" dataKey="success_rate" stroke="#10b981" name="Success Rate (%)" />
</LineChart>
```

---

## UI Қауіпсіздігі (UI Security)

### JWT Authentication

```typescript
// Login function
const login = async (username: string, password: string) => {
  const response = await api.login(username, password);
  Cookies.set('auth_token', response.token, { expires: 7 });
};

// Token in requests
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Key Authentication

```typescript
// Set API key
Cookies.set('api_key', apiKey, { expires: 7 });

// Use in requests
apiClient.interceptors.request.use((config) => {
  const apiKey = Cookies.get('api_key');
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});
```

### HTTPS және CORS Configuration

**Backend (FastAPI):**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Frontend (Next.js):**

Production ортасында HTTPS қолданыңыз және `.env.local` файлында:

```env
API_URL=https://api.yourdomain.com
HTTPS_ENABLED=true
```

---

## UI Скриншот / Схема Сипаттамасы (UI Screenshot / Schema Description)

### Интерфейс Макеті (Interface Layout)

```
┌─────────────────────────────────────────────────────────────┐
│  Header: AI Attack & Defense System                         │
│  Status: System Online                                       │
├─────────────────────────────────────────────────────────────┤
│  [Attack Simulator] [Defense Monitor] [Logs] [Statistics]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Attack Simulator    │  │  Information Panel  │        │
│  │                      │  │                      │        │
│  │  [Attack Type]       │  │  Research purposes   │        │
│  │  [Intensity]         │  │  only                │        │
│  │  [Duration]          │  │                      │        │
│  │  [Start Button]      │  │                      │        │
│  └──────────────────────┘  └──────────────────────┘        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Компонент Байланысы (Component Relationships)

```
index.tsx (Main Page)
├── AttackSimulator
│   └── api.simulateAttack()
├── DefenseMonitor
│   ├── api.getDefenseStatus()
│   └── StatisticsChart (nested)
├── LogsViewer
│   └── api.getLogs()
└── StatisticsChart
    └── api.getStatistics()
```

---

## UI Орнату және Іске Қосу Нұсқаулығы (Installation and Setup Guide)

### Алғышарттар (Prerequisites)

- Node.js 18+ 
- npm немесе yarn
- Python 3.9+

### Frontend Орнату (Frontend Setup)

```bash
# Dependencies орнату
npm install

# Development серверін іске қосу
npm run dev

# Production build
npm run build
npm start
```

### Backend Орнату (Backend Setup)

```bash
# Virtual environment құру
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Dependencies орнату
pip install -r backend/requirements.txt

# Server іске қосу
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Configuration

1. `.env.local` файлын құрыңыз:

```env
API_URL=http://localhost:8000
API_KEY=demo-api-key
```

2. Backend үшін environment variables:

```bash
export API_KEY=demo-api-key
export JWT_SECRET=your-secret-key
```

---

## Қолданушы Нұсқаулығы (User Guide)

### 1. Жүйеге Кіру (System Access)

- Браузерде `http://localhost:3000` ашыңыз
- Backend серверінің жұмыс істеп тұрғанын тексеріңіз (`http://localhost:8000`)

### 2. Attack Simulator Пайдалану

1. "Attack Simulator" табын таңдаңыз
2. Шабуыл түрін таңдаңыз (DDoS, SQL Injection, т.б.)
3. Интенсивтілікті және ұзақтықты орнатыңыз
4. "Start Attack Simulation" батырмасын басыңыз
5. Нәтижелерді "Defense Monitor" табында көріңіз

### 3. Defense Monitor Көру

- "Defense Monitor" табында нақты уақыттағы қорғаныс күйін көріңіз
- Блокталған шабуылдар саны мен сәттілік деңгейін бақылаңыз
- Графиктерде уақыт бойынша өзгерістерді көріңіз

### 4. System Logs Тексеру

- "System Logs" табында барлық жүйе логтарын көріңіз
- Лог деңгейі бойынша фильтрлеңіз (INFO, WARNING, ERROR, SUCCESS)
- Лог санын реттеңіз (50, 100, 200, 500)

### 5. Statistics Көру

- "Statistics" табында жалпы статистиканы көріңіз
- Шабуыл түрлерінің таралуын көріңіз
- Қорғаныс механизмдерінің пайдалануын талдаңыз

---

## Техникалық Детальдар (Technical Details)

### Технологиялар (Technologies)

- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS
- **Charts:** Recharts 2.10
- **HTTP Client:** Axios 1.6
- **Notifications:** React Hot Toast
- **Backend:** FastAPI, Python 3.9+
- **Authentication:** JWT, API Keys

### Браузер Қолдауы (Browser Support)

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

### Performance

- Code splitting (automatic with Next.js)
- Image optimization
- API response caching
- Real-time updates with polling

---

## Ескертулер (Notes)

⚠️ **Маңызды:** Бұл жүйе тек зерттеу және демонстрация мақсатында дайындалған. Барлық шабуылдар симуляция түрінде жүзеге асырылады және нақты зиян келтірмейді.

⚠️ **Important:** This system is designed for research and demonstration purposes only. All attacks are simulated and do not cause actual harm.

---

## Лицензия (License)

Бұл жоба зерттеу мақсатында дайындалған. Коммерциялық мақсатта пайдалануға тыйым салынады.

This project is created for research purposes. Commercial use is prohibited.

---

## Автор (Author)

Диплом жұмысы - Жасанды интеллект арқылы шабуылдар мен қорғаныс жасау әдістерін әзірлеу

Diploma Work - Development of Attack and Defense Methods Using Artificial Intelligence

