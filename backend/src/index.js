import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Import routes
import teamRoutes from './routes/teams.js';
import playerRoutes from './routes/players.js';
import matchRoutes from './routes/matches.js';
import statsRoutes from './routes/stats.js';

// Import Prisma for keep-alive
import prisma from './lib/prisma.js';

// Load environment variables
dotenv.config();

// ==================== Keep-Alive Functionality ====================
// Prevents Render (free tier) and Neon database from going to sleep
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

const keepAlive = async () => {
    try {
        // Simple query to keep the database connection warm
        await prisma.$queryRaw`SELECT 1`;
        console.log(`[Keep-Alive] Database ping successful at ${new Date().toISOString()}`);
    } catch (error) {
        console.error('[Keep-Alive] Database ping failed:', error.message);
    }
};

// Start keep-alive interval (only in production)
if (process.env.NODE_ENV === 'production') {
    setInterval(keepAlive, KEEP_ALIVE_INTERVAL);
    console.log('[Keep-Alive] Started - pinging database every 5 minutes');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger configuration
const isProduction = process.env.NODE_ENV === 'production';
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'IPL Data Platform API',
            version: '1.0.0',
            description: 'A comprehensive API for IPL cricket data including teams, players, matches, and statistics',
            contact: {
                name: 'IPL Data API'
            }
        },
        servers: isProduction
            ? [
                {
                    url: 'https://ipl-backend-demg.onrender.com',
                    description: 'Production server'
                }
            ]
            : [
                {
                    url: `http://localhost:${PORT}`,
                    description: 'Development server'
                }
            ]
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'IPL Data Platform API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to IPL Data Platform API',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            teams: '/api/teams',
            players: '/api/players',
            matches: '/api/matches',
            stats: '/api/stats',
            health: '/api/health'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`
    });
});

app.listen(PORT, () => {
    console.log(` IPL Data Platform API running on http://localhost:${PORT}`);
    console.log(` API Documentation available at http://localhost:${PORT}/api-docs`);
});

export default app;
