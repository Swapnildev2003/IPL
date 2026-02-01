# IPL Data Platform - Frontend

A modern, responsive React web application for visualizing and exploring IPL (Indian Premier League) cricket data. Built with React, Vite, and Recharts for rich data visualization.

## 🌐 Live Demo

**Live URL**: [https://ipl-ten-tau.vercel.app/](https://ipl-ten-tau.vercel.app/)

## 🚀 Features

- **Dashboard**: Overview of IPL statistics with interactive charts
- **Teams Page**: Points table with table/card view toggle
- **Players Page**: Player listings with search, role filters, and leaderboards (Orange/Purple Cap)
- **Matches Page**: Paginated match results with scorecards
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Theme**: Premium glassmorphism UI with smooth animations

## 📊 Key Components

### Pages (4 Screens)
1. **Dashboard** - Tournament overview with stats cards and charts
2. **Teams** - Points table and team cards
3. **Players** - Player directory with filtering and leaderboards
4. **Matches** - Match results with pagination

### Charts (2 Visualizations)
1. **Bar Chart** - Top Run Scorers (Orange Cap contenders)
2. **Pie Chart** - Team Wins Distribution

### Tables
- Points Table (Teams page)
- Top Batsmen Leaderboard (Players page)
- Top Bowlers Leaderboard (Players page)

### State Handling
- ✅ Loading states with animated spinner
- ✅ Error states with retry functionality
- ✅ Empty states with descriptive messages

## 🛠 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios (with interceptors)
- **Charts**: Recharts
- **Styling**: Vanilla CSS with CSS Variables (Design System)
- **Deployment**: Vercel

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js 18+
- Backend API running (locally or deployed)

### 1. Clone & Install
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

For production (using deployed backend):
```env
VITE_API_URL=https://ipl-backend-demg.onrender.com/api
```

### 3. Run Development Server
```bash
npm run dev
# App running on http://localhost:5173
```

### 4. Build for Production
```bash
npm run build
# Output in dist/ folder
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/             # API client and service methods
│   │   └── index.js     # Axios instance + all API endpoints
│   ├── components/      # Reusable UI components
│   │   ├── Layout.jsx   # Main app layout with sidebar
│   │   ├── Loading.jsx  # Loading spinner component
│   │   ├── ErrorState.jsx   # Error display with retry
│   │   └── EmptyState.jsx   # Empty data placeholder
│   ├── pages/           # Route page components
│   │   ├── Dashboard.jsx    # Stats overview + charts
│   │   ├── Teams.jsx        # Points table
│   │   ├── Players.jsx      # Player directory + leaderboards
│   │   └── Matches.jsx      # Match results
│   ├── App.jsx          # Root component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles (Design System)
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## 🎨 Design System

The application uses a custom CSS Design System with:
- **Color Palette**: Primary (Purple/Blue), Accent (Orange/Gold)
- **Typography**: Inter + Outfit fonts
- **Components**: Cards, Tables, Buttons, Forms with consistent styling
- **Dark Theme**: Premium glassmorphism effects
- **Animations**: Smooth transitions and micro-interactions

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Set **Root Directory** to `frontend`
4. Add Environment Variable: `VITE_API_URL` = `https://ipl-backend-demg.onrender.com/api`
5. Deploy

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Teams Page
![Teams](./screenshots/teams.png)

### Players Page
![Players](./screenshots/players.png)

### Matches Page
![Matches](./screenshots/matches.png)

> Note: Add screenshots to `frontend/screenshots/` folder

## 🔗 Related Links

- **Backend API**: [https://ipl-backend-demg.onrender.com](https://ipl-backend-demg.onrender.com)
- **API Documentation**: [https://ipl-backend-demg.onrender.com/api-docs](https://ipl-backend-demg.onrender.com/api-docs)
- **GitHub Repository**: [https://github.com/Swapnildev2003/IPL](https://github.com/Swapnildev2003/IPL)
