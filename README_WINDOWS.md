# Windows үшін Орнату және Іске қосу Нұсқаулары

## Алғышарттар

1. **Python 3.8+** орнатыңыз
   - Скачать: https://www.python.org/downloads/
   - Орнату кезінде "Add Python to PATH" опциясын белгілеңіз

2. **Node.js 18+** орнатыңыз
   - Скачать: https://nodejs.org/
   - LTS версиясын таңдаңыз

3. **Git** (опционал)
   - Скачать: https://git-scm.com/download/win

## Жылдам Бастау

### 1. Проектті клонидау немесе ашу
```bash
# Егер Git пайдалансаңыз:
git clone <repository-url>
cd zhan

# Немесе архивтен шығарып ашыңыз
```

### 2. Серверлерді іске қосу

**Ең оңай жол:**
1. `start_services.bat` файлын екі рет басыңыз
2. Екі терезе ашылады (Backend және Frontend)
3. Браузерде ашыңыз: http://localhost:3000

**Немесе қолмен:**
```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (жаңа терезеден)
cd frontend
npm install
npm run dev
```

### 3. Серверлерді тоқтату

**Ең оңай жол:**
- `stop_services.bat` файлын екі рет басыңыз

**Немесе қолмен:**
- Терезелерді жабыңыз немесе Ctrl+C басыңыз

## Баптау

### API Ключтерін Орнату

1. `backend\.env` файлын ашыңыз
2. API ключтерін қосыңыз:
```env
CURSOR_API_KEY=your-cursor-api-key
OPENAI_API_KEY=your-openai-api-key
API_KEY=demo-api-key-12345
DEFAULT_TARGET_URL=
```

### Порттарды Өзгерту

Егер порттар бос емес болса:

**Backend портын өзгерту:**
- `start_services.bat` файлында `--port 8000` мәнін өзгертіңіз
- `frontend/lib/api.ts` файлында `API_URL` мәнін өзгертіңіз

**Frontend портын өзгерту:**
- `frontend/package.json` файлында `"dev": "next dev -p 3000"` мәнін өзгертіңіз

## Мәселелерді Шешу

### Порт бос емес
```bash
# Портты қолданушы процесті табу
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Процесті тоқтату (PID мәнін ауыстырыңыз)
taskkill /F /PID <PID>
```

### Python табылмады
- Python орнатылғанын тексеріңіз: `python --version`
- PATH-қа қосылғанын тексеріңіз
- Компьютерді қайта іске қосыңыз

### Node.js табылмады
- Node.js орнатылғанын тексеріңіз: `node --version`
- PATH-қа қосылғанын тексеріңіз
- Компьютерді қайта іске қосыңыз

### Dependencies орнату қатесі
```bash
# Backend
cd backend
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

# Frontend
cd frontend
npm cache clean --force
npm install
```

### Firewall мәселелері
- Windows Firewall-да порттарға рұқсат беріңіз (8000, 3000)
- Немесе Firewall-ды уақытша өшіріңіз (тек тестілеу үшін)

## Файлдар

- `start_services.bat` - Серверлерді іске қосу
- `stop_services.bat` - Серверлерді тоқтату
- `README_WINDOWS.md` - Бұл файл

## Қосымша Ақпарат

- Backend API: http://localhost:8000/docs
- Frontend: http://localhost:3000
- API Key: `demo-api-key-12345` (default)

## Қолдау

Мәселелер болса, логтарды тексеріңіз:
- Backend: терезеден көрінеді
- Frontend: терезеден көрінеді

