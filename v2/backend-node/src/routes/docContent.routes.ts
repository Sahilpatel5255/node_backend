import { Router, Response, Request } from 'express';
import { DocContentModel } from '../models/DocContent';
import { LabModel } from '../models/Lab';
import { apiSuccess, apiError } from '../utils/response';

const router = Router();

// List or create document content
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { lab_prefix, document_id } = req.query;

        if (!lab_prefix) {
            apiError(res, 'lab_prefix parameter is required', 400);
            return;
        }

        // Verify lab exists
        const lab = await LabModel.findByPrefix(lab_prefix as string);
        if (!lab) {
            apiError(res, `Lab with prefix "${lab_prefix}" does not exist`, 400);
            return;
        }

        let contents;
        if (document_id) {
            contents = await DocContentModel.findByDocument(lab_prefix as string, document_id as string);
        } else {
            contents = await DocContentModel.findAll(lab_prefix as string);
        }

        apiSuccess(res, 'Document contents fetched successfully', { contents });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { lab_prefix, document_id, content } = req.body;

        if (!lab_prefix || !document_id || !content) {
            apiError(res, 'lab_prefix, document_id, and content are required', 400);
            return;
        }

        // Verify lab exists
        const lab = await LabModel.findByPrefix(lab_prefix);
        if (!lab) {
            apiError(res, `Lab with prefix "${lab_prefix}" does not exist`, 400);
            return;
        }

        await DocContentModel.save(lab_prefix, document_id, content);

        apiSuccess(res, 'Document content saved successfully', null, 201);
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Bulk save document contents
router.post('/bulk-save', async (req: Request, res: Response): Promise<void> => {
    try {
        const { lab_prefix, documents } = req.body;

        if (!lab_prefix || !documents) {
            apiError(res, 'lab_prefix and documents are required', 400);
            return;
        }

        // Verify lab exists
        const lab = await LabModel.findByPrefix(lab_prefix);
        if (!lab) {
            apiError(res, `Lab with prefix "${lab_prefix}" does not exist`, 400);
            return;
        }

        const count = await DocContentModel.bulkSave(lab_prefix, documents);

        apiSuccess(res, 'Document contents saved successfully', { count }, 201);
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Get content by document
router.get('/by-document/:labPrefix/:documentId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { labPrefix, documentId } = req.params;

        // Verify lab exists
        const lab = await LabModel.findByPrefix(labPrefix);
        if (!lab) {
            apiError(res, `Lab with prefix "${labPrefix}" does not exist`, 400);
            return;
        }

        const contents = await DocContentModel.findByDocument(labPrefix, documentId);

        apiSuccess(res, 'Document content fetched successfully', { contents });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Delete document content (optional - not in Django but useful)
router.delete('/:labPrefix/:documentId', async (req: Request, res: Response): Promise<void> => {
    try {
        const { labPrefix, documentId } = req.params;

        const deleted = await DocContentModel.delete(labPrefix, documentId);

        if (!deleted) {
            apiError(res, 'Content not found', 404);
            return;
        }

        apiSuccess(res, 'Content deleted successfully', null, 204);
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

export default router;
