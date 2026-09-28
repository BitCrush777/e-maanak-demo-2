# e-MAANAK — Sovereign Legal Metrology Verification System

[![React 18](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.16-38B2AC.svg)](https://tailwindcss.com/)
[![i18n](https://img.shields.io/badge/Localization-English%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80-orange.svg)](https://react.i18next.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)

---

## 🏛️ Executive Summary

**e-MAANAK** is an institutional digital governance platform engineered for sovereign legal metrology administrations. The system digitizes the entire statutory verification lifecycle for commercial weighing and measuring instruments—from commercial custodian registration to multi-point field calibration, automated Maximum Permissible Error (MPE) tolerance auditing, tamper-evident certificate issuance, and real-time public QR verification.

Designed to mirror standard Indian e-Governance portals, the application delivers a high-density, authoritative user interface featuring **complete bilingual localization (English & हिन्दी)**, strict single-sheet A4 certificate generation, and an offline-resilient verification store.

---

## 🚀 Key Capabilities & Modules

### 1. 🇮🇳 Bilingual Administrative Localization (English & हिन्दी)
- **Instant Reactive Switching**: Change language anytime directly from the top utility bar without page reloads.
- **Formal Administrative Terminology**: Full Devanagari localization incorporating statutory legal metrology vocabulary (*उपभोक्ता मामले, विधिक मापविज्ञान प्रभाग, अधिकतम अनुमेय त्रुटि (MPE), प्रपत्र LM-01, प्रपत्र LM-02*).
- **Locale-Aware Formatting**: Dynamically formats timestamps using `en-IN` (e.g. `28 Sep 2026`) and `hi-IN` (e.g. `२८ सित॰ २०२६`) via `Intl.DateTimeFormat`.
- **Identity Integrity**: Technical identifiers (Serial Numbers, Certificate Numbers, Rule Codes, QR tokens) remain in canonical format to prevent verification collisions.

### 2. 📋 Form LM-01: Commercial Instrument Custodian Portal
- **Equipment Inventory Census**: Digital registry of commercial weighing and measuring instruments.
- **Statutory Filing Workflow**: Lodges official Form LM-01 applications for periodic verification cycles (6, 12, or 24-month intervals).
- **Compliance Tracking**: Live status badges (`VALID`, `PENDING_VERIFICATION`, `UNDER_REVIEW`, `EXPIRED`, `REVOKED`).

### 3. 🔬 Form LM-02: Field Verification Inspection Workbench
- **Multi-Point Test Load Calibration**: Interactive testing protocol for field verification officers.
- **Mathematical Tolerance Engine**: Evaluates observed readings against standard certified test weights at 20%, 50%, and 100% capacity spans.
- **Dynamic MPE Conformance**: Automatically computes absolute error and relative percentage error against statutory rules (`WEIGHING_SCALE_V1`).
- **Immediate Digital Stamping**: Approves and generates tamper-evident verification certificates on-site upon tolerance satisfaction.

### 4. 📄 A4 Single-Sheet Statutory Verification Certificate
- **Official Compliance Layout**: Compact geometric border, national metrology scale crest, and authoritative typography.
- **Real-Time Dynamic QR Code**: High-contrast, scannable QR code linking to the live public trust registry.
- **Cryptographic Fingerprint**: Deterministic SHA-256 HMAC integrity hash sealing the instrument details and calibration readings.
- **Zero-Overflow Print Architecture**: Strict CSS print rules (`@page { size: A4 portrait; margin: 8mm; }`) ensuring the certificate prints onto exactly one page in any browser or PDF generator.

### 5. 🛡️ Directorate Regulatory Console & Revocation Ledger
- **Statutory Revocation Registry**: Allows regulatory directors to invalidate non-compliant certificates instantly with mandatory legal justification.
- **Immutable Audit Trail**: Chronological telemetry recording officer inspections, rule revisions, and de-certification actions.
- **Census Telemetry**: Statewide census metrics across registered instruments, active applications, and compliance ratios.

### 6. 🔍 Public Citizen Verification Portal
- **Zero-Barrier Lookup**: Public verification accessible via direct URL (`/verify/:token`) or search bar without authentication.
- **Cryptographic Validation**: Real-time validation of certificate status, test readings, and issuing officer sign-off.

### 7. ⚡ Instant Portal Role Switcher
- **Header & Login Quick Access**: Switch seamlessly between **Custodian (Owner)**, **Verifying Officer**, and **Directorate Administrator** profiles for instant workflow demonstrations and testing.

---

## 🏗️ System Architecture

```
                               ┌───────────────────────────────────────────────┐
                               │             e-MAANAK Portal UI                │
                               │  React 18 + Vite + Tailwind CSS + i18next     │
                               │           (English / हिन्दी)                  │
                               └───────────────────────┬───────────────────────┘
                                                       │
                               ┌───────────────────────┴───────────────────────┐
                               │       Client-Side Simulation / Offline        │
                               │      LocalStorage Persistent Store            │
                               │       (Mock Rules, Instruments, Apps)         │
                               └───────────────────────┬───────────────────────┘
                                                       │
                                                       ▼
                               ┌───────────────────────────────────────────────┐
                               │           Supabase Auth Session / JWT         │
                               └───────────────────────┬───────────────────────┘
                                                       │
                                                       ▼
                               ┌───────────────────────────────────────────────┐
                               │            Express + TypeScript API           │
                               │        (RBAC, Zod Validation, OpenAPI)        │
                               └───────────────────────┬───────────────────────┘
                                                       │
                                                       ▼
                               ┌───────────────────────────────────────────────┐
                               │                   Prisma ORM                  │
                               └───────────────────────┬───────────────────────┘
                                                       │
                                                       ▼
                               ┌───────────────────────────────────────────────┐
                               │              PostgreSQL Database              │
                               │     (Instruments, Inspections, Revocations)   │
                               └───────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
e-maanak/
├── frontend/                       # React 18 + Vite frontend
│   ├── public/                     # Static assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── certificate/        # A4 Certificate Document & Print Styles
│   │   │   │   ├── CertificateDocument.tsx
│   │   │   │   └── PrintStyles.css
│   │   │   ├── common/             # E-Governance UI components
│   │   │   │   ├── GovernmentHeader.tsx   # Top utility bar & role switcher
│   │   │   │   ├── GovernmentFooter.tsx   # Institutional footer
│   │   │   │   ├── StatusBadge.tsx        # Localized compliance badges
│   │   │   │   ├── PageHeader.tsx         # Standard breadcrumbs & titles
│   │   │   │   ├── Pagination.tsx         # Localized table controls
│   │   │   │   └── Alert.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx     # Supabase Auth & Demo Role Provider
│   │   ├── i18n/
│   │   │   ├── index.ts            # i18next configuration & date formatters
│   │   │   └── locales/
│   │   │       ├── en.ts           # Complete English dictionary
│   │   │       └── hi.ts           # Formal Hindi (हिन्दी) dictionary
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx       # Authorized sign-in & role profiles
│   │   │   ├── OwnerDashboard.tsx  # Form LM-01 custodian workspace
│   │   │   ├── OfficerQueuePage.tsx# Form LM-02 calibration workbench
│   │   │   ├── AdminDashboard.tsx  # Directorate oversight & revocation
│   │   │   └── PublicVerifyPage.tsx# Citizen QR verification portal
│   │   ├── services/
│   │   │   ├── api.ts              # REST client with offline fallback
│   │   │   └── mockData.ts         # Deterministic statutory store
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css               # E-Governance design tokens
│   ├── index.html                  # Metadata & OpenGraph headers
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                        # Express + TypeScript REST API
│   ├── prisma/
│   │   ├── schema.prisma           # Relational metrology models
│   │   └── seed.ts                 # Database seed script
│   ├── src/
│   │   ├── controllers/            # Verification & certificate controllers
│   │   ├── middleware/             # Supabase JWT & RBAC guards
│   │   ├── routes/                 # Express API routing
│   │   └── index.ts                # Server bootstrap & Swagger docs
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
└── .gitignore
```

---

## 💻 Quick Start & Setup

### Prerequisites
- **Node.js**: `v20.x LTS` or higher
- **Package Manager**: `npm` (v9+) or `yarn`
- **Git**

---

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/BitCrush777/e-maanak-demo-2.git
cd e-maanak-demo-2

# Install Frontend dependencies
cd frontend
npm install

# Install Backend dependencies
cd ../backend
npm install
```

---

### 2. Running the Frontend Portal

```bash
cd frontend
npm run dev
```

The portal will launch at: **`http://localhost:5173`**

> **Note on Standalone Operation**: The frontend includes a built-in client-side statutory simulation engine (`mockData.ts`). You can test all role dashboards (Owner, Officer, Admin), issue certificates, and verify QR codes immediately without requiring a local database or live backend.

---

### 3. Running the Backend API (Optional)

```bash
cd backend

# Configure environment variables
cp .env.example .env

# Generate Prisma Client & Run Seed
npx prisma generate
npm run seed

# Launch Express Server
npm run dev
```

The backend server will run on: **`http://localhost:5000`**
- **Swagger Documentation**: `http://localhost:5000/api/docs`
- **Health Check**: `http://localhost:5000/api/v1/health`

---

## 🔑 Portal Role Access & Accounts

You can sign in using the **Quick Portal Access** options on the login screen, use the **Portal Role switcher** in the header, or log in with credentials:

| Role | Organization / Identity | Credentials | Key Workspaces |
| :--- | :--- | :--- | :--- |
| **Instrument Custodian** | Sovereign Agro Logistics Ltd. | `owner@emaanak.demo` / `DemoPass123!` | `/owner` • Form LM-01 Registration & Inventory |
| **Field Verifying Officer** | Inspector Rajesh Kumar (Zone-04) | `officer@emaanak.demo` / `DemoPass123!` | `/officer` • Form LM-02 Inspection Workbench |
| **Directorate Administrator** | Legal Metrology Root Authority | `admin@emaanak.demo` / `DemoPass123!` | `/admin` • Revocation Console & Rules Engine |
| **Public Citizen** | Open Public Verification | *No credentials required* | `/verify` • Real-Time Certificate Registry |

---

## 📐 Metrological Standard & Tolerance Formulas

The system implements the statutory Non-Automatic Weighing Instruments (NAWI) tolerance verification schedule:

$$\text{Absolute Error } (E) = \text{Observed Reading } (R) - \text{Reference Standard Mass } (M)$$

$$\text{Relative Error Percentage } (\%E) = \left( \frac{E}{M} \right) \times 100$$

- **Maximum Permissible Error (MPE)**: Defined at $\pm 0.05\%$ under Rule `WEIGHING_SCALE_V1`.
- **Test Load Points**: Tested systematically at $20\%$, $50\%$, and $100\%$ of rated capacity span.
- **Pass Threshold**: All test load points must strictly satisfy $|E| \le \text{MPE}$ for certificate approval.

---

## 🧪 Verification & Build Commands

```bash
# Frontend Typecheck
cd frontend
node ./node_modules/typescript/bin/tsc --noEmit

# Frontend Production Build
npm run build

# Backend Typecheck
cd ../backend
node ./node_modules/typescript/bin/tsc
```

---

## 🔒 Security & Traceability Assurance

- **Cryptographic Certificate Seals**: Certificates are bound to a SHA-256 HMAC digest computed from certificate metadata, serial numbers, and observed readings.
- **Strict Role-Based Access Control (RBAC)**: Route guards and API middleware enforce `OWNER`, `OFFICER`, and `ADMIN` role boundaries.
- **Persistent Audit Telemetry**: Every state transition (filing, inspection pass/fail, revocation) generates an immutable audit record with timestamps and actor attribution.
- **Zero Fabricated Claims**: Maintains regulatory clarity as a digital legal metrology software platform without misrepresenting unauthorized government emblems.

---

## 📄 Repository & Maintenance

- **Repository**: [https://github.com/BitCrush777/e-maanak-demo-2](https://github.com/BitCrush777/e-maanak-demo-2)
- **Primary Branch**: `main`
- **Application Name**: `e-MAANAK`
- **System Classification**: Sovereign Legal Metrology Verification System
