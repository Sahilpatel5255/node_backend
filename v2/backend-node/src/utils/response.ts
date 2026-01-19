import { Response } from 'express';
import { ApiResponse } from '../types';

export const apiSuccess = <T = any>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(response);
};

export const apiError = (
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: any
): Response => {
    const response: ApiResponse = {
        success: false,
        message,
        errors,
    };
    return res.status(statusCode).json(response);
};
