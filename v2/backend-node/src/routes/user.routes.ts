import { Router, Response } from 'express';
import { UserModel } from '../models/User';
import { apiSuccess, apiError } from '../utils/response';
import { authenticate, canManageUsers } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// Get all users
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await UserModel.findAll();

        const usersData = users.map(user => ({
            id: user.id,
            name: user.name,
            full_name: user.name,
            email: user.email,
            role: user.role,
            is_active: user.is_active,
        }));

        apiSuccess(res, 'Users fetched successfully', { users: usersData });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Update user status
router.patch('/:userId/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = parseInt(req.params.userId);
        const { is_active } = req.body;

        if (is_active === undefined) {
            apiError(res, 'is_active field is required', 400);
            return;
        }

        const user = await UserModel.updateStatus(userId, is_active);

        if (!user) {
            apiError(res, 'User not found', 404);
            return;
        }

        apiSuccess(res, `User status updated to ${is_active ? 'Active' : 'Inactive'}`, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
                last_login: user.last_login ? user.last_login.toISOString() : null,
            },
        });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Get user detail by email
router.get('/:email', authenticate, canManageUsers, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const email = req.params.email;
        const user = await UserModel.findByEmail(email);

        if (!user) {
            apiError(res, 'User not found', 404);
            return;
        }

        apiSuccess(res, 'User detail fetched successfully', {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
                last_login: user.last_login ? user.last_login.toISOString() : null,
                date_joined: user.date_joined.toISOString(),
            },
        });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Update user
router.put('/:email/update', authenticate, canManageUsers, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const email = req.params.email;
        const { name, role, password } = req.body;

        const updates: any = {};
        if (name) updates.name = name;
        if (role) updates.role = role;
        if (password) updates.password = password;

        const user = await UserModel.update(email, updates);

        if (!user) {
            apiError(res, 'User not found', 404);
            return;
        }

        apiSuccess(res, 'User updated successfully', {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_active: user.is_active,
                last_login: user.last_login ? user.last_login.toISOString() : null,
                date_joined: user.date_joined.toISOString(),
            },
        });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Delete user
router.delete('/:email/delete', authenticate, canManageUsers, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const email = req.params.email;
        const user = await UserModel.findByEmail(email);

        if (!user) {
            apiError(res, 'User not found', 404);
            return;
        }

        // Prevent deleting yourself
        if (user.id === req.user!.id) {
            apiError(res, 'You cannot delete your own account', 400);
            return;
        }

        // Prevent deleting the last super_admin
        if (user.role === 'super_admin') {
            const allUsers = await UserModel.findAll();
            const superAdminCount = allUsers.filter(u => u.role === 'super_admin').length;

            if (superAdminCount <= 1) {
                apiError(res, 'Cannot delete the last super_admin', 400);
                return;
            }
        }

        await UserModel.delete(email);

        apiSuccess(res, `User ${email} deleted successfully`, null);
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

export default router;
