import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { apiSuccess, apiError } from '../utils/response';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// Signup endpoint
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, name, role, password } = req.body;

        if (!email || !name || !role || !password) {
            apiError(res, 'All fields are required', 400);
            return;
        }

        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            apiError(res, 'Email already exists', 400);
            return;
        }

        const user = await UserModel.create(email, name, role, password);

        apiSuccess(res, 'Signup successful', {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        }, 201);
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Non-JWT login endpoint
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            apiError(res, 'Email and password are required', 400);
            return;
        }

        const user = await UserModel.verifyPassword(email, password);

        if (!user) {
            apiError(res, 'Invalid credentials', 401);
            return;
        }

        if (!user.is_active) {
            apiError(res, 'User account is disabled', 403);
            return;
        }

        apiSuccess(res, 'Logged in successfully', {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// JWT login endpoint
router.post('/jwt-login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            apiError(res, 'Email and password are required', 400);
            return;
        }

        const user = await UserModel.verifyPassword(email, password);

        if (!user) {
            apiError(res, 'Invalid credentials', 401);
            return;
        }

        if (!user.is_active) {
            apiError(res, 'Your account has been deactivated. Please contact administrator.', 403);
            return;
        }

        // Update last login
        await UserModel.updateLastLogin(user.id);

        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        apiSuccess(res, 'Logged in successfully', {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                last_login: new Date().toISOString(),
            },
        });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Protected user info endpoint
router.get('/user-info', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    const user = req.user!;

    apiSuccess(res, 'User info retrieved successfully', {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    });
});

// Test endpoint
router.get('/test', (req: Request, res: Response): void => {
    res.send('Test view is working');
});

export default router;
