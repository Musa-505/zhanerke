# API Key Setup Guide
API Key орнату нұсқаулығы

## Cursor API Key алу

### Әдіс 1: Cursor IDE арқылы
1. Cursor IDE-ны ашыңыз
2. `Cmd/Ctrl + ,` басып Settings-ке өтіңіз
3. "Account" немесе "API Keys" бөлімін табыңыз
4. "Create API Key" батырмасын басыңыз
5. API key-ді көшіріп алыңыз

### Әдіс 2: Cursor веб-сайты арқылы
1. https://cursor.sh сайтына өтіңіз
2. Sign In батырмасын басыңыз
3. Аккаунтыңызға кіріңіз
4. Settings → API Keys бетіне өтіңіз
5. Жаңа API key жасаңыз

## OpenAI API Key алу (Fallback - Ұсынылады)

OpenAI API key алу оңайырақ және біздің кодта fallback ретінде қолданылады:

1. https://platform.openai.com сайтына өтіңіз
2. Sign Up немесе Log In жасаңыз
3. https://platform.openai.com/api-keys бетіне өтіңіз
4. "Create new secret key" батырмасын басыңыз
5. API key-ді көшіріп алыңыз (бір рет ғана көрсетіледі!)

## Environment Variables орнату

API key-ді алғаннан кейін:

1. `backend/.env` файлын құрыңыз:
```bash
cd backend
cp .env.example .env
```

2. `.env` файлын ашып, API key-ді қосыңыз:

```env
# Cursor AI API (егер бар болса)
CURSOR_API_KEY=sk-your-cursor-api-key-here

# Немесе OpenAI API (fallback - ұсынылады)
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Default target URL
DEFAULT_TARGET_URL=http://localhost:8080
```

## Тестілеу

API key дұрыс орнатылғанын тексеру:

```bash
cd backend
python -c "from ai_analyzer import ai_analyzer; import asyncio; print(asyncio.run(ai_analyzer.analyze_attack_pattern({'attack_type': 'ddos', 'intensity': 5})))"
```

## Ескертулер

- ⚠️ API key-лерді ешқашан Git-ке commit жасамаңыз
- ⚠️ `.env` файлы `.gitignore`-да болуы керек
- ✅ OpenAI API key fallback ретінде жұмыс істейді
- ✅ Егер Cursor API key болмаса, OpenAI API автоматты түрде қолданылады

## Қосымша ақпарат

- OpenAI API Pricing: https://openai.com/pricing
- Cursor Documentation: https://cursor.sh/docs

