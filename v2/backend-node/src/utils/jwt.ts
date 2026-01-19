import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '45m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

export const generateAccessToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRY });
};

export const verifyToken = (token: string): JWTPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
};
