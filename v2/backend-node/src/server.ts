import dotenv from 'dotenv';
import app from './app';
import pool from './config/database';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Test database connection
const testConnection = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ Database connection test successful');
    } catch (error) {
        console.error('❌ Database connection test failed:', error);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    try {
        await testConnection();

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 CORS enabled for configured origins`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});

startServer();
