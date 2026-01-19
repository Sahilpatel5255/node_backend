import { Router, Response } from 'express';
import { LabModel } from '../models/Lab';
import { apiSuccess, apiError } from '../utils/response';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadToGCS, testGCSConnection } from '../utils/storage';
import { AuthRequest } from '../types';

const router = Router();

// Lab onboarding with file uploads
router.post('/onboarding', authenticate, upload.fields([
    { name: 'nabl_certificate', maxCount: 1 },
    { name: 'company_registration', maxCount: 1 },
    { name: 'pollution_certificate', maxCount: 1 },
    { name: 'cmo_certificate', maxCount: 1 },
    { name: 'lab_logo', maxCount: 1 },
    { name: 'director_signature', maxCount: 1 },
    { name: 'consultant_signature', maxCount: 1 },
    { name: 'quality_manager_signature', maxCount: 1 },
    { name: 'doctor_signature', maxCount: 1 },
    { name: 'staff_list', maxCount: 1 },
    { name: 'equipment_list', maxCount: 1 },
    { name: 'calibrator_details', maxCount: 1 },
    { name: 'scope_list', maxCount: 1 },
]), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const data: any = { ...req.body };

        // Upload files to GCS
        const fileFields = [
            'nabl_certificate', 'company_registration', 'pollution_certificate',
            'cmo_certificate', 'lab_logo', 'director_signature', 'consultant_signature',
            'quality_manager_signature', 'doctor_signature', 'staff_list',
            'equipment_list', 'calibrator_details', 'scope_list',
        ];

        for (const field of fileFields) {
            if (files && files[field] && files[field][0]) {
                const fileUrl = await uploadToGCS(files[field][0]);
                data[`${field}_url`] = fileUrl;
            }
        }

        // Parse JSON fields
        if (typeof data.sample_source === 'string') {
            data.sample_source = JSON.parse(data.sample_source);
        }
        if (typeof data.selected_departments === 'string') {
            data.selected_departments = JSON.parse(data.selected_departments);
        }

        data.lab_status = 'active';

        const lab = await LabModel.create(data);

        // Create schema for the lab
        try {
            await LabModel.createSchema(lab.document_id_prefix);
        } catch (error: any) {
            apiError(res, `Lab saved, but failed to create schema: ${error.message}`, 500);
            return;
        }

        apiSuccess(res, 'Lab onboarded successfully', { lab }, 201);
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Get all labs
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const labs = await LabModel.findAll();
        apiSuccess(res, 'Labs fetched successfully', { labs });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Get lab detail
router.get('/:labId', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const lab = await LabModel.findByPrefix(req.params.labId);

        if (!lab) {
            apiError(res, 'Lab not found', 404);
            return;
        }

        apiSuccess(res, 'Lab detail fetched successfully', { lab });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Update lab
router.put('/:labId/update', authenticate, upload.fields([
    { name: 'lab_logo', maxCount: 1 },
    { name: 'director_signature', maxCount: 1 },
    { name: 'consultant_signature', maxCount: 1 },
    { name: 'quality_manager_signature', maxCount: 1 },
    { name: 'doctor_signature', maxCount: 1 },
    { name: 'staff_list', maxCount: 1 },
    { name: 'equipment_list', maxCount: 1 },
    { name: 'scope_list', maxCount: 1 },
    { name: 'nabl_certificate', maxCount: 1 },
    { name: 'company_registration', maxCount: 1 },
    { name: 'pollution_certificate', maxCount: 1 },
    { name: 'cmo_certificate', maxCount: 1 },
    { name: 'calibrator_details', maxCount: 1 },
]), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const labId = req.params.labId;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const updates: any = { ...req.body };

        // Upload new files
        const fileFieldMap: Record<string, string> = {
            'lab_logo': 'lab_logo_url',
            'director_signature': 'director_signature_url',
            'consultant_signature': 'consultant_signature_url',
            'quality_manager_signature': 'quality_manager_signature_url',
            'doctor_signature': 'doctor_signature_url',
            'staff_list': 'staff_list_url',
            'equipment_list': 'equipment_list_url',
            'scope_list': 'scope_list_url',
            'nabl_certificate': 'nabl_certificate_url',
            'company_registration': 'company_registration_url',
            'pollution_certificate': 'pollution_certificate_url',
            'cmo_certificate': 'cmo_certificate_url',
            'calibrator_details': 'calibrator_details_url',
        };

        for (const [field, urlField] of Object.entries(fileFieldMap)) {
            if (files && files[field] && files[field][0]) {
                const fileUrl = await uploadToGCS(files[field][0]);
                updates[urlField] = fileUrl;
            }
        }

        // Parse JSON fields
        if (typeof updates.sample_source === 'string') {
            updates.sample_source = JSON.parse(updates.sample_source);
        }
        if (typeof updates.selected_departments === 'string') {
            updates.selected_departments = JSON.parse(updates.selected_departments);
        }

        // Handle boolean conversion
        if (typeof updates.has_referral_lab_mou === 'string') {
            updates.has_referral_lab_mou = updates.has_referral_lab_mou.toLowerCase() === 'true';
        }

        // Handle removed images
        if (updates.removed_images) {
            const removed = typeof updates.removed_images === 'string'
                ? JSON.parse(updates.removed_images)
                : updates.removed_images;

            for (const img of removed) {
                if (fileFieldMap[img]) {
                    updates[fileFieldMap[img]] = null;
                }
            }
        }

        const lab = await LabModel.update(labId, updates);

        if (!lab) {
            apiError(res, 'Lab not found', 404);
            return;
        }

        apiSuccess(res, 'Lab updated successfully', { lab });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 400);
    }
});

// Update lab files
router.post('/:labId/update-files', authenticate, upload.fields([
    { name: 'nabl_certificate', maxCount: 1 },
    { name: 'company_registration', maxCount: 1 },
    { name: 'pollution_certificate', maxCount: 1 },
    { name: 'cmo_certificate', maxCount: 1 },
    { name: 'lab_logo', maxCount: 1 },
    { name: 'director_signature', maxCount: 1 },
    { name: 'consultant_signature', maxCount: 1 },
    { name: 'staff_list', maxCount: 1 },
    { name: 'equipment_list', maxCount: 1 },
    { name: 'calibrator_details', maxCount: 1 },
    { name: 'scope_list', maxCount: 1 },
    { name: 'quality_manager_signature', maxCount: 1 },
    { name: 'doctor_signature', maxCount: 1 },
]), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const labId = req.params.labId;
        const lab = await LabModel.findByPrefix(labId);

        if (!lab) {
            apiError(res, 'Lab not found', 404);
            return;
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const updatedFiles: Record<string, any> = {};
        const updates: any = {};

        const fieldMapping: Record<string, string> = {
            'nabl_certificate': 'nabl_certificate_url',
            'company_registration': 'company_registration_url',
            'pollution_certificate': 'pollution_certificate_url',
            'cmo_certificate': 'cmo_certificate_url',
            'lab_logo': 'lab_logo_url',
            'director_signature': 'director_signature_url',
            'consultant_signature': 'consultant_signature_url',
            'staff_list': 'staff_list_url',
            'equipment_list': 'equipment_list_url',
            'calibrator_details': 'calibrator_details_url',
            'scope_list': 'scope_list_url',
            'quality_manager_signature': 'quality_manager_signature_url',
            'doctor_signature': 'doctor_signature_url',
        };

        for (const [fieldName, urlField] of Object.entries(fieldMapping)) {
            if (files && files[fieldName] && files[fieldName][0]) {
                const file = files[fieldName][0];
                const fileUrl = await uploadToGCS(file);
                updates[urlField] = fileUrl;
                updatedFiles[fieldName] = { url: fileUrl, fileName: file.originalname };
            } else if (req.body[fieldName] && req.body[fieldName].startsWith('http')) {
                const fileUrl = req.body[fieldName];
                updates[urlField] = fileUrl;
                const filename = fileUrl.split('/').pop() || `${fieldName}.pdf`;
                updatedFiles[fieldName] = { url: fileUrl, fileName: filename };
            }
        }

        await LabModel.update(labId, updates);

        apiSuccess(res, 'Files updated successfully', { updated_files: updatedFiles });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Update lab status
router.patch('/:labId/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const labId = req.params.labId;
        const { lab_status } = req.body;

        if (!['active', 'inactive'].includes(lab_status)) {
            apiError(res, 'Invalid status', 400);
            return;
        }

        const lab = await LabModel.update(labId, { lab_status });

        if (!lab) {
            apiError(res, 'Lab not found', 404);
            return;
        }

        apiSuccess(res, `Lab status updated to ${lab_status}`, { lab });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Get/Update lab document settings
router.get('/:labId/document-settings', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const lab = await LabModel.findByPrefix(req.params.labId);

        if (!lab) {
            apiError(res, 'Lab not found', 404);
            return;
        }

        apiSuccess(res, 'Lab document settings fetched successfully', {
            settings: {
                issue_no: lab.issue_no,
                issue_date: lab.issue_date,
            },
        });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

router.put('/:labId/document-settings', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const labId = req.params.labId;
        const { issue_no, issue_date } = req.body;

        const updates: any = {};
        if (issue_no !== undefined) updates.issue_no = issue_no;
        if (issue_date !== undefined) updates.issue_date = issue_date;

        const lab = await LabModel.update(labId, updates);

        if (!lab) {
            apiError(res, 'Lab not found', 404);
            return;
        }

        apiSuccess(res, 'Lab document settings updated successfully', {
            settings: {
                issue_no: lab.issue_no,
                issue_date: lab.issue_date,
            },
        });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Get lab assets
router.get('/lab-assets/:labId', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const lab = await LabModel.findByPrefix(req.params.labId);

        if (!lab) {
            apiError(res, 'Lab not found', 404);
            return;
        }

        apiSuccess(res, 'Lab assets fetched successfully', {
            lab_assets: {
                document_id_prefix: lab.document_id_prefix,
                name: lab.name,
                address: lab.address,
                lab_logo_url: lab.lab_logo_url,
                director_signature_url: lab.director_signature_url,
                consultant_signature_url: lab.consultant_signature_url,
            },
        });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Delete lab
router.post('/delete-lab', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { prefix } = req.body;

        if (!prefix) {
            apiError(res, 'prefix is required', 400);
            return;
        }

        const deleted = await LabModel.delete(prefix);

        if (!deleted) {
            apiError(res, `Lab with prefix '${prefix}' not found`, 404);
            return;
        }

        apiSuccess(res, `Lab '${prefix}' deleted`, null);
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Check lab prefix
router.post('/check-prefix', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const prefix = req.body.checkprefix || req.body.prefix;

        if (!prefix) {
            apiError(res, 'prefix is required', 400);
            return;
        }

        const exists = await LabModel.checkPrefixExists(prefix.trim());

        apiSuccess(res, 'Prefix check completed', { exists });
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

// Test GCS connection
router.get('/test-gcs', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const success = await testGCSConnection();

        if (success) {
            apiSuccess(res, 'GCS connection successful', null);
        } else {
            apiError(res, 'GCS connection failed', 500);
        }
    } catch (error: any) {
        apiError(res, `Server error: ${error.message}`, 500);
    }
});

export default router;
