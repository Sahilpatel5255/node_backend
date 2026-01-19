import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import labRoutes from './routes/lab.routes';
import documentRoutes from './routes/document.routes';
import docContentRoutes from './routes/docContent.routes';

dotenv.config();

const app: Application = express();

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://docuveda-frontend.vercel.app',
    'https://www.docuveda.com',
    'https://api.metariq.com',
    'https://app.metariq.com',
];

app.use(cors({
    origin: corsOrigins,
    credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/signup', authRoutes);
app.use('/api/login', authRoutes);
app.use('/signup', authRoutes);
app.use('/login', authRoutes);
app.use('/jwt-login', authRoutes);
app.use('/user-info', authRoutes);
app.use('/test', authRoutes);

app.use('/users', userRoutes);
app.use('/labs', labRoutes);
app.use('/lab-assets', labRoutes);
app.use('/delete-lab', labRoutes);
app.use('/check-prefix', labRoutes);
app.use('/test-gcs', labRoutes);

app.use('/documents', documentRoutes);
app.use('/doc-content', docContentRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

export default app;
