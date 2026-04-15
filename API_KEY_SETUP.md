# API Key Setup Guide
API Key орнату нұсқаулығы

## Google Gemini API Key алу

1. https://aistudio.google.com/app/apikey сайтына өтіңіз
2. Google аккаунтыңызбен кіріңіз
3. "Create API Key" батырмасын басыңыз
4. API key-ді көшіріп алыңыз

## Environment Variables орнату

`backend/.env` файлын жасаңыз:

```env
GEMINI_API_KEY=your-gemini-api-key-here

# Default target URL
DEFAULT_TARGET_URL=http://localhost:8080
```

## Package орнату

```bash
cd backend
pip install -r requirements.txt
```

## Тестілеу

```bash
cd backend
python -c "from ai_analyzer import ai_analyzer; import asyncio; print(asyncio.run(ai_analyzer.analyze_attack_pattern({'attack_type': 'ddos', 'intensity': 5})))"
```

## Ескертулер

- ⚠️ API key-ді ешқашан Git-ке commit жасамаңыз
- ⚠️ `.env` файлы `.gitignore`-да болуы керек
- ✅ Gemini API key болмаса, rule-based analysis автоматты түрде қолданылады
- ✅ Тегін квота: Gemini 1.5 Flash — минутына 15 сұраныс

## Қосымша ақпарат

- Gemini API Pricing: https://ai.google.dev/pricing
- Google AI Studio: https://aistudio.google.com
