import multer from 'multer';

// Use memory storage for file uploads
const storage = multer.memoryStorage();

// File filter for validation
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept all file types for now (can be restricted later)
    cb(null, true);
};

// Configure multer
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
