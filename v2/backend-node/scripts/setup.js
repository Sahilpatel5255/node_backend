#!/usr/bin/env node

/**
 * Setup script for Docuveda Node.js backend
 * This script helps create the .env file with proper configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

console.log('🚀 Docuveda Backend Setup\n');

// Check if .env already exists
if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
        if (answer.toLowerCase() !== 'y') {
            console.log('Setup cancelled.');
            rl.close();
            process.exit(0);
        }
        createEnvFile();
    });
} else {
    createEnvFile();
}

function createEnvFile() {
    // Read example file
    const exampleContent = fs.readFileSync(envExamplePath, 'utf8');

    console.log('\n📝 Creating .env file with default values...\n');

    // Use default values from Django settings
    const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=34.71.211.220
DB_PORT=5432
DB_NAME=test_db
DB_USER=postgres
DB_PASSWORD=Docuveda@2025

# JWT Configuration
JWT_SECRET=django-insecure-%#ifdfm=a(-6ow#xi=)99+8471z#b_m(*(%bi4-++n_&vvr521
JWT_ACCESS_EXPIRY=45m
JWT_REFRESH_EXPIRY=30d

# Google Cloud Storage
GCS_BUCKET_NAME=stage_bucket_test
GCS_CREDENTIALS_PATH=./docuveda-staging-3f0d75950792.json

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,https://docuveda-frontend.vercel.app,https://www.docuveda.com,https://api.metariq.com,https://app.metariq.com
`;

    fs.writeFileSync(envPath, envContent);

    console.log('✅ .env file created successfully!\n');
    console.log('📋 Configuration Summary:');
    console.log('  - Database: test_db @ 34.71.211.220');
    console.log('  - Port: 3000');
    console.log('  - GCS Bucket: stage_bucket_test');
    console.log('\n⚠️  Important:');
    console.log('  - Ensure docuveda-staging-3f0d75950792.json is in the root directory');
    console.log('  - Update JWT_SECRET in production');
    console.log('\n🎉 Setup complete! Run "npm run dev" to start the server.\n');

    rl.close();
}
