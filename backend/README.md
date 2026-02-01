# IPL Data Platform - Backend API

This is the backend service for the IPL Data Platform, built with Node.js, Express, and PostgreSQL (Neon). It provides a comprehensive REST API to access and analyze IPL cricket data, including teams, players, matches, and statistics.

## 🌐 Live Demo
- **Base URL**: [https://ipl-backend-demg.onrender.com](https://ipl-backend-demg.onrender.com)
- **API Documentation**: [https://ipl-backend-demg.onrender.com/api-docs](https://ipl-backend-demg.onrender.com/api-docs)
- **Health Check**: [https://ipl-backend-demg.onrender.com/api/health](https://ipl-backend-demg.onrender.com/api/health)

## 🚀 Features

- **Relational Data Modeling**: robust schema for Teams, Players, Matches, Innings, and Performances.
- **RESTful API**: Standardized endpoints with JSON responses.
- **Advanced Querying**: Supports pagination (`page`, `limit`) and filtering.
- **Swagger/OpenAPI Documentation**: Interactive API documentation generated automatically.
- **Database Management**: Prisma ORM for type-safe database access and migrations.
- **Dockerized**: Multi-stage Docker build for optimized production deployment.

## 🛠 Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon Cloud)
- **ORM**: Prisma
- **Documentation**: Swagger/OpenAPI (swagger-jsdoc)
- **Containerization**: Docker & Docker Compose

## 🗄️ Database Schema

The database consists of the following 10 core models:
- `Team`: IPL franchises
- `Player`: Cricket players info
- `Match`: Match details and results
- `Venue`: Stadiums/Grounds
- `Innings`: Scorecard summary per innings
- `BattingPerformance`: Individual batting stats
- `BowlingPerformance`: Individual bowling stats
- `Standing`: Points table data
- `TeamPlayer`: Roster mapping
- `Venue`: Match locations

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)

### 1. Clone & Install
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Server Port (optional, default 5000)
PORT=5000
NODE_ENV=development
```

### 3. Database Migration & Seeding
Initialize the database structure and populate it with sample data:
```bash
# Push schema to database
npx prisma db push

# OR (if using migrations)
npx prisma migrate dev

# Seed the database
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
# API running on http://localhost:5000
```

## 🐳 Docker Setup

You can run the backend completely containerized without installing Node.js locally.

### Using Docker Compose
```bash
# Ensure your backend/.env file exists
docker-compose up -d --build
```
The API will be available at `http://localhost:5000`.

## 📚 API Documentation

Once the server is running, you can access the full interactive documentation at:

👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health Check |
| GET | `/api/teams` | List all teams (supports pagination) |
| GET | `/api/players` | List all players (supports search) |
| GET | `/api/matches` | List matches (filter by team/venue) |
| GET | `/api/stats/summary` | Tournament aggregated stats |

## 🚀 Deployment

The backend is configured for deployment on **Render**.

1. **Push to GitHub**: Ensure code is in a repository.
2. **Create Web Service on Render**:
   - Connect GitHub repo.
   - Select `Docker` runtime.
   - Base directory: `backend`
   - Add Environment Variable: `DATABASE_URL`.
3. **Deploy**: Render will build the Docker image and start the service.

## 📁 Project Structure

```
backend/
├── prisma/             # Database schema, migrations, and seeds
│   ├── schema.prisma   # Data model definition
│   └── seed.js         # Data seeding script
├── src/
│   ├── routes/         # API Route handlers (Teams, Players, Matches)
│   ├── lib/            # Shared utilities (Prisma client)
│   └── index.js        # Entry point and Express app setup
├── Dockerfile          # Production Docker image configuration
└── package.json        # Dependencies and scripts
```
