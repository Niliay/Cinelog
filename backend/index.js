const express = require('express');
const cors = require('cors');
const routes = require('./routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🎬 CineLog API\'ye hoş geldiniz!',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me'
            },
            movies: {
                popular: 'GET /api/movies/popular',
                details: 'GET /api/movies/:id',
                search: 'GET /api/movies/search/:query',
                trending: 'GET /api/movies/trending'
            },
            user: {
                profile: 'GET /api/user/profile',
                addToList: 'POST /api/user/add-to-list',
                removeFromList: 'DELETE /api/user/remove-from-list',
                lists: 'GET /api/user/lists/:listType',
                rate: 'POST /api/user/rate',
                review: 'POST /api/user/review',
                movieStatus: 'GET /api/user/movie-status/:movieId',
                updateUsername: 'PUT /api/user/username'
            }
        }
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint bulunamadı'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('🚨 Global Error:', error);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Sunucu hatası'
            : error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CineLog Backend running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME}`);
    console.log(`🎬 TMDB API: ${process.env.TMDB_API_KEY ? 'Connected' : 'Not configured'}`);
});