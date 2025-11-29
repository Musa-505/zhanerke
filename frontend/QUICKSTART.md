# Quick Start Guide

## Fast Setup (5 минут)

### 1. Backend іске қосу

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend жұмыс істеп тұрғанын тексеру: http://localhost:8000/docs

### 2. Frontend іске қосу

```bash
# Жаңа терминалда
npm install
cp env.example .env.local
npm run dev
```

Frontend ашылуы: http://localhost:3000

### 3. Тестілеу

1. Браузерде http://localhost:3000 ашыңыз
2. "Attack Simulator" табын таңдаңыз
3. Шабуыл түрін таңдап, "Start Attack Simulation" басыңыз
4. "Defense Monitor" табында нәтижелерді көріңіз

## Troubleshooting

### Backend қателері

- Port 8000 бос емес: `lsof -ti:8000 | xargs kill` (macOS/Linux)
- Python модульдері жоқ: `pip install -r backend/requirements.txt`

### Frontend қателері

- Port 3000 бос емес: `lsof -ti:3000 | xargs kill` (macOS/Linux)
- Dependencies қателері: `rm -rf node_modules package-lock.json && npm install`
- API қосылу қателері: `.env.local` файлында `API_URL` дұрыс екенін тексеріңіз

## Production Build

```bash
# Frontend
npm run build
npm start

# Backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

