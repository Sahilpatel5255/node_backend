import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { UserModel } from '../models/User';
import { apiError } from '../utils/response';

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            apiError(res, 'Authentication required', 401);
            return;
        }

        const token = authHeader.substring(7);
        const payload = verifyToken(token);

        if (!payload) {
            apiError(res, 'Invalid or expired token', 401);
            return;
        }

        const user = await UserModel.findById(payload.userId);

        if (!user) {
            apiError(res, 'User not found', 401);
            return;
        }

        if (!user.is_active) {
            apiError(res, 'User account is disabled', 403);
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        apiError(res, 'Authentication failed', 401);
    }
};

export const isAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user || req.user.role !== 'admin') {
        apiError(res, 'Admin access required', 403);
        return;
    }
    next();
};

export const canManageUsers = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user || !['super_admin', 'manager_admin'].includes(req.user.role)) {
        apiError(res, 'Insufficient permissions', 403);
        return;
    }
    next();
};
