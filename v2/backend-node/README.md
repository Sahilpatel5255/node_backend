# Docuveda Backend - Node.js/Express

Node.js/Express backend for Docuveda, migrated from Django.

## Features

- **Authentication**: JWT-based authentication with access and refresh tokens
- **User Management**: Complete CRUD operations with role-based access control
- **Lab Management**: Comprehensive lab onboarding and management with file uploads
- **Document Content**: Schema-based document storage per lab
- **File Storage**: Google Cloud Storage integration for file uploads
- **Database**: PostgreSQL with connection pooling

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (already configured)
- Google Cloud Storage credentials

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development

DB_HOST=34.71.211.220
DB_PORT=5432
DB_NAME=test_db
DB_USER=postgres
DB_PASSWORD=Docuveda@2025

JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=45m
JWT_REFRESH_EXPIRY=30d

GCS_BUCKET_NAME=stage_bucket_test
GCS_CREDENTIALS_PATH=./docuveda-staging-3f0d75950792.json

CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

4. Ensure GCS credentials file is in the root directory

## Development

Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Production

Build and run:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - Non-JWT login
- `POST /jwt-login` - JWT login
- `GET /user-info` - Get authenticated user info

### User Management
- `GET /users` - List all users
- `GET /users/:email` - Get user details
- `PUT /users/:email/update` - Update user
- `DELETE /users/:email/delete` - Delete user
- `PATCH /users/:userId/status` - Update user status

### Lab Management
- `POST /labs/onboarding` - Create new lab
- `GET /labs` - List all labs
- `GET /labs/:labId` - Get lab details
- `PUT /labs/:labId/update` - Update lab
- `POST /labs/:labId/update-files` - Update lab files
- `PATCH /labs/:labId/status` - Update lab status
- `GET /labs/:labId/document-settings` - Get document settings
- `PUT /labs/:labId/document-settings` - Update document settings
- `GET /lab-assets/:labId` - Get lab assets
- `POST /delete-lab` - Delete lab
- `POST /check-prefix` - Check lab prefix availability

### Document Content
- `GET /doc-content` - List document contents (query: lab_prefix, document_id)
- `POST /doc-content` - Create document content
- `POST /doc-content/bulk-save` - Bulk save documents
- `GET /doc-content/by-document/:labPrefix/:documentId` - Get content by document

### Documents
- `GET /documents` - List all documents
- `POST /documents` - Create document
- `GET /documents/:id` - Get document
- `PUT /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document

## Project Structure

```
backend-node/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL configuration
│   ├── middleware/
│   │   ├── auth.ts              # Authentication middleware
│   │   └── upload.ts            # File upload middleware
│   ├── models/
│   │   ├── User.ts              # User model
│   │   ├── Lab.ts               # Lab model
│   │   ├── Document.ts          # Document model
│   │   └── DocContent.ts        # DocContent model
│   ├── routes/
│   │   ├── auth.routes.ts       # Authentication routes
│   │   ├── user.routes.ts       # User management routes
│   │   ├── lab.routes.ts        # Lab management routes
│   │   ├── document.routes.ts   # Document routes
│   │   └── docContent.routes.ts # Document content routes
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── utils/
│   │   ├── response.ts          # API response utilities
│   │   ├── jwt.ts               # JWT utilities
│   │   └── storage.ts           # Google Cloud Storage utilities
│   ├── app.ts                   # Express application
│   └── server.ts                # Server entry point
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## Migration from Django

This backend maintains 100% API compatibility with the Django backend:
- Same database schema and tables
- Same API response format
- Same authentication mechanism
- Same file storage (Google Cloud Storage)

To migrate:
1. Update frontend API base URL to point to this Node.js backend
2. Ensure database credentials are correct
3. Copy GCS credentials file
4. Start the Node.js server
5. Test all endpoints

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | PostgreSQL host | - |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | - |
| `DB_USER` | Database user | - |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_ACCESS_EXPIRY` | Access token expiry | 45m |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | 30d |
| `GCS_BUCKET_NAME` | GCS bucket name | - |
| `GCS_CREDENTIALS_PATH` | Path to GCS credentials | - |
| `CORS_ORIGINS` | Allowed CORS origins | - |

## License

ISC
