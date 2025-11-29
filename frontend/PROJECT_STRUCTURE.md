# Project Structure

```
zhan/
├── backend/                    # FastAPI Backend
│   ├── main.py                # Main API application
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Backend documentation
│
├── components/                 # React Components
│   ├── AttackSimulator.tsx    # Attack simulation UI
│   ├── DefenseMonitor.tsx     # Defense monitoring UI
│   ├── LogsViewer.tsx         # System logs viewer
│   └── StatisticsChart.tsx    # Statistics visualization
│
├── lib/                       # Utility Libraries
│   └── api.ts                 # API client and utilities
│
├── pages/                     # Next.js Pages
│   ├── _app.tsx               # App wrapper with providers
│   └── index.tsx              # Main dashboard page
│
├── styles/                    # Global Styles
│   └── globals.css            # TailwindCSS and global styles
│
├── public/                    # Static Assets
│   └── .gitkeep
│
├── .env.local.example         # Environment variables template
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
├── next.config.js            # Next.js configuration
├── package.json              # Node.js dependencies
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # TailwindCSS configuration
├── tsconfig.json             # TypeScript configuration
│
├── APPENDIX.md               # Detailed UI documentation (Kazakh)
├── README.md                 # Main project documentation
├── QUICKSTART.md             # Quick start guide
└── PROJECT_STRUCTURE.md       # This file
```

## File Descriptions

### Backend
- `main.py`: FastAPI application with all API endpoints
- `requirements.txt`: Python package dependencies

### Frontend Components
- `AttackSimulator.tsx`: Form component for starting attack simulations
- `DefenseMonitor.tsx`: Real-time defense status monitoring with charts
- `LogsViewer.tsx`: System logs display with filtering
- `StatisticsChart.tsx`: Statistical data visualization

### Configuration
- `next.config.js`: Next.js settings including API rewrites
- `tailwind.config.js`: TailwindCSS theme and color configuration
- `tsconfig.json`: TypeScript compiler options
- `.env.local.example`: Environment variables template

### Documentation
- `README.md`: Main project documentation (bilingual)
- `APPENDIX.md`: Detailed UI interface documentation in Kazakh
- `QUICKSTART.md`: Fast setup instructions

