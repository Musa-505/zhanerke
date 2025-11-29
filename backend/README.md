# FastAPI Backend - AI Attack & Defense System

## ⚠️ Important Notice

**This system executes REAL attacks for research and demonstration purposes.**
- Only use on servers you own or have explicit permission to test
- All attacks are executed in real-time, not simulated
- AI-powered defense mechanisms analyze and block attacks automatically

## Features

- **Real Attack Execution**: DDoS, SQL Injection, XSS, Brute Force, Port Scanning
- **AI-Powered Analysis**: Uses Cursor AI API (with OpenAI fallback) for threat detection
- **Intelligent Defense**: Automatic attack blocking based on AI analysis
- **Real-time Monitoring**: Live attack tracking and defense status

## API Endpoints

### Authentication
- `POST /auth/login` - Login and get JWT token

### Attacks
- `POST /api/attacks/simulate` - **Execute real attack** (requires target_url for most attack types)
- `GET /api/attacks/{attack_id}` - Get attack status and results
- `GET /api/attacks/history` - Get attack history

### Defense
- `GET /api/defense/status` - Get current defense status
- `GET /api/defense/history` - Get defense history
- `GET /api/defense/config` - Get defense configuration
- `GET /api/defense/mechanism/{mechanism_id}` - Get specific defense mechanism
- `PUT /api/defense/mechanism/{mechanism_id}` - Update defense mechanism
- `POST /api/defense/mechanism/{mechanism_id}/enable` - Enable defense mechanism
- `POST /api/defense/mechanism/{mechanism_id}/disable` - Disable defense mechanism

### AI Analysis
- `POST /api/ai/analyze` - Analyze attack pattern using AI
- `POST /api/ai/recommendations` - Get AI-powered defense recommendations

### Logs
- `GET /api/logs` - Get system logs
- `GET /api/logs/stream` - Stream logs (SSE)

### Statistics
- `GET /api/statistics` - Get system statistics

## API Documentation

Swagger UI: http://localhost:8000/docs  
ReDoc: http://localhost:8000/redoc

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Cursor AI API (primary)
CURSOR_API_URL=https://api.cursor.sh/v1
CURSOR_API_KEY=your-cursor-api-key-here

# OpenAI API (fallback)
OPENAI_API_KEY=your-openai-api-key-here

# Default target URL for attacks
DEFAULT_TARGET_URL=http://localhost:8080

# Security
JWT_SECRET=your-jwt-secret-key-here
API_KEY=demo-api-key
```

### 3. Get API Keys

**Cursor AI API:**
- Visit https://cursor.sh to get your API key
- Or use OpenAI API key as fallback

**OpenAI API (Fallback):**
- Visit https://platform.openai.com/api-keys
- Create an API key

### 4. Run the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Attack Types

### DDoS Attack
- **Requires**: `target_url`
- **Description**: Executes real distributed denial-of-service attack
- **Parameters**: `intensity` (1-10), `duration` (seconds)

### SQL Injection
- **Requires**: `target_url`
- **Description**: Tests for SQL injection vulnerabilities
- **Parameters**: `intensity` (1-10), `duration` (seconds)

### XSS (Cross-Site Scripting)
- **Requires**: `target_url`
- **Description**: Tests for XSS vulnerabilities
- **Parameters**: `intensity` (1-10), `duration` (seconds)

### Brute Force
- **Requires**: `target_url`
- **Description**: Attempts brute force login attacks
- **Parameters**: `intensity` (1-10), `duration` (seconds)

### Port Scanning
- **Requires**: `target_url`
- **Description**: Scans common ports on target server
- **Parameters**: `intensity` (1-10), `duration` (seconds)

## AI Defense System

The system uses AI to:
1. **Analyze attack patterns** in real-time
2. **Classify threat levels** (Low/Medium/High/Critical)
3. **Recommend defense mechanisms**
4. **Automatically block attacks** based on AI confidence

### Defense Mechanisms

- **AI Firewall**: Intelligent firewall with AI-powered threat detection
- **Intrusion Detection System (IDS)**: AI-based pattern analysis
- **AI Rate Limiting**: Adaptive rate limiting based on traffic patterns
- **AI Threat Detection**: Advanced AI model for attack classification
- **Behavioral Analysis**: Anomaly detection based on behavior patterns

## Authentication

For demo purposes, use:
- API Key: `demo-api-key`
- JWT Token: `demo-token`

In production, implement proper authentication.

## Example Request

```bash
curl -X POST "http://localhost:8000/api/attacks/simulate" \
  -H "X-API-Key: demo-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "attack_type": "ddos",
    "target_url": "https://your-server.com",
    "intensity": 5,
    "duration": 60
  }'
```

## Security Warning

⚠️ **This system executes REAL attacks. Use responsibly:**
- Only test on servers you own
- Get explicit permission before testing
- Do not use for malicious purposes
- Follow all applicable laws and regulations

