import { Storage } from '@google-cloud/storage';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'stage_bucket_test';
const GCS_CREDENTIALS_PATH = process.env.GCS_CREDENTIALS_PATH || './docuveda-staging-3f0d75950792.json';

// Initialize Google Cloud Storage
const storage = new Storage({
    keyFilename: path.resolve(GCS_CREDENTIALS_PATH),
});

const bucket = storage.bucket(GCS_BUCKET_NAME);

export const uploadToGCS = async (file: Express.Multer.File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.originalname}`;
        const blob = bucket.file(filename);

        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            reject(err);
        });

        blobStream.on('finish', async () => {
            // Make the file public
            await blob.makePublic();

            // Get the public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            resolve(publicUrl);
        });

        blobStream.end(file.buffer);
    });
};

export const testGCSConnection = async (): Promise<boolean> => {
    try {
        await bucket.exists();
        console.log('✅ GCS connection successful');
        return true;
    } catch (error) {
        console.error('❌ GCS connection failed:', error);
        return false;
    }
};
