# ================================================================
# e-MAANAK — SIH 2026 PROTOTYPE
# Sovereign Legal Metrology Verification Platform
# ================================================================

## Project Overview

e-Maanak is a sovereign legal metrology verification platform built as a prototype for SIH 2026 (Problem ID: SIH26036).

The system enables:
- **Owners** to register instruments and track verification applications
- **Officers** to perform field inspections with offline support
- **Administrators** to manage the system, view analytics, and audit logs
- **Public users** to verify certificates via QR codes

## Architecture

```
                    e-MAANAK

                 React + Vite
                      │
                      ▼
               Supabase Auth
                      │
                Auth Session
                      │
                      ▼
             Express + TypeScript
                      │
                Authorization
                      │
                      ▼
                    Prisma
                      │
                      ▼
             Supabase PostgreSQL
```

## Technology Stack

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- @supabase/supabase-js

### Backend
- Node.js 20 LTS
- Express
- TypeScript
- Prisma ORM
- Zod validation
- JWT verification

### Database
- Supabase PostgreSQL

### Authentication
- Supabase Auth

### Deployment
- Frontend: Render Static Site
- Backend: Render Web Service
- Database: Supabase PostgreSQL

## Folder Structure

```
e-maanak/
├── frontend/              # React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API clients
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/               # Express + TypeScript API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth, RBAC, validation
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utilities
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
└── .gitignore
```

## Local Setup

### Prerequisites
- Node.js 20 LTS
- npm or yarn
- Git
- Supabase account

### 1. Clone Repository

```bash
git clone <repository-url>
cd e-maanak
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Note your project URL and anon/public key
3. Get your service role key (for backend only)

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment example
cp .env.example .env

# Edit .env with your values:
# - DATABASE_URL (from Supabase → Connection Pooling)
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (development only)
npm run seed

# Start development server
npm run dev
```

Backend runs on http://localhost:5000

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment example
cp .env.example .env

# Edit .env with your values:
# - VITE_API_URL=http://localhost:5000
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_PUBLISHABLE_KEY

# Start development server
npm run dev
```

Frontend runs on http://localhost:5173

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Backend (.env)

```env
PORT=5000
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Demo Accounts

After running the seed script, use these demo accounts:

| Role   | Email                  | Password     |
|--------|------------------------|--------------|
| Owner  | owner@emaanak.demo     | DemoPass123! |
| Officer| officer@emaanak.demo   | DemoPass123! |
| Admin  | admin@emaanak.demo     | DemoPass123! |

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:5000/api/docs
- OpenAPI JSON: http://localhost:5000/api/openapi.json

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## PWA Installation

The Officer portal supports offline operation as a PWA:

1. Open the application in Chrome/Edge
2. Click the install icon in the address bar
3. The app can be used offline for field inspections

## Deployment

### Render Frontend (Static Site)

1. Connect your GitHub repository
2. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`
3. Add environment variables:
   - `VITE_API_URL` (your Render backend URL)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

### Render Backend (Web Service)

1. Connect your GitHub repository
2. Configure:
   - Root Directory: `backend`
   - Build Command: `npm ci && npx prisma generate && npm run build`
   - Start Command: `npm start`
3. Add environment variables:
   - `PORT` (Render provides this automatically)
   - `DATABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ALLOWED_ORIGINS` (your Render frontend URL)

## Security Notes

- Never commit `.env` files
- Service role keys must remain server-side only
- All API requests require authentication except public verification
- RBAC is enforced on the backend
- Input validation using Zod on all endpoints
- CORS configured for specific origins only

## Known Limitations

This is a prototype demonstration:

1. Demo rules are configurable but not actual statutory requirements
2. Certificates are demonstration prototypes, not legally binding documents
3. Rate limiting is in-process (not distributed)
4. Some edge cases in conflict resolution may need refinement
5. Federation adapter is a placeholder for future implementation

## License

SIH 2026 Prototype - Demonstration Purpose Only

## Contact

For questions about this prototype, refer to SIH 2026 documentation.
