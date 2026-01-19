import { Router, Response, Request } from 'express';
import { DocumentModel } from '../models/Document';
import { apiSuccess, apiError } from '../utils/response';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

// List or create documents
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const documents = await DocumentModel.findAll();
        apiSuccess(res, 'Documents fetched successfully', { documents });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, content } = req.body;
        const ownerId = req.user!.id;

        if (!title || !content) {
            apiError(res, 'title and content are required', 400);
            return;
        }

        const document = await DocumentModel.create(title, content, ownerId);

        apiSuccess(res, 'Document created successfully', { document }, 201);
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Get, update, or delete a specific document
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const document = await DocumentModel.findById(id);

        if (!document) {
            apiError(res, 'Document not found', 404);
            return;
        }

        apiSuccess(res, 'Document fetched successfully', { document });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const { title, content } = req.body;

        const document = await DocumentModel.update(id, { title, content });

        if (!document) {
            apiError(res, 'Document not found', 404);
            return;
        }

        apiSuccess(res, 'Document updated successfully', { document });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await DocumentModel.delete(id);

        if (!deleted) {
            apiError(res, 'Document not found', 404);
            return;
        }

        apiSuccess(res, 'Document deleted successfully', null, 204);
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

export default router;
