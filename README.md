# ShambaTrack

## Overview

ShambaTrack is a multi-tenant agricultural cooperative management platform designed to digitize farmer operations, production tracking, loan management, wallet accounting, and audit monitoring.

The platform helps cooperatives replace paper-based and spreadsheet-driven workflows with a secure, centralized system that improves transparency, accountability, and operational efficiency.

---

## Live Demo

Frontend:

```
https://shambatrack.vercel.app/
```

Backend API:

```
https://shambatrack.onrender.com/
```

---

## Features

### Authentication & Authorization

- JWT Authentication
- Role-Based Access Control (RBAC)
- Protected API Routes
- Protected Frontend Routes

Supported Roles:

- System Administrator
- Cooperative Administrator
- Farmer

---

### Multi-Cooperative Tenancy

Supports multiple cooperatives on a single deployment.

Features:

- Cooperative isolation
- Tenant-aware data access
- Role-restricted operations
- Cross-tenant access prevention

---

### Farmer Management

- Register farmers
- Manage farmer profiles
- View farmer information
- Cooperative membership management

---

### Wallet Management

- Wallet balance tracking
- Credit operations
- Debit operations
- Transaction history

---

### Loan Management

Loan Lifecycle:

1. Create Loan
2. Approve Loan
3. Disburse Loan
4. Repay Loan
5. Complete Loan

Features:

- Loan status tracking
- Repayment history
- Outstanding balance calculation
- Loan summaries

---

### Product & Production Tracking

- Product registration
- Farmer production records
- Production summaries
- Cooperative-level visibility

---

### Audit Trail

Every significant action is recorded.

Examples:

- Login
- Farmer creation
- Loan creation
- Loan approval
- Loan disbursement
- Loan repayment
- Wallet transactions

Captured Information:

- User
- Timestamp
- Action
- Entity
- Metadata
- IP Address
- User Agent

---

### Reporting

Management dashboards provide:

- Loan summaries
- Farmer summaries
- Production reports
- Wallet reports

---

## Expansion Areas Implemented

### Multi-Cooperative Tenancy

Data isolation enforced using:

```sql
coop_id
```

Every cooperative only accesses its own data.

---

### Audit Trail

Implemented using MongoDB.

Tracks:

- Who performed an action
- What action was performed
- When it happened
- Additional metadata

---

### Credit Readiness

The platform stores:

- Production history
- Loan history
- Repayment history

These records can be used to evaluate farmer creditworthiness.

---

### Reporting & Export

Management can view operational summaries and performance reports across the cooperative.

---

### Notifications

The platform includes an internal farmer notification system.

Features:

- Cooperative administrators can send notifications.
- Notifications are scoped to the sender's cooperative.
- Farmers receive notifications in their dashboard.
- Read and unread states are tracked.
- Farmers can mark notifications as read.

Stored Information:

- Notification title
- Notification message
- Recipient farmer
- Cooperative ID
- Read status
- Created timestamp

MongoDB is used for notification storage because notification payloads are flexible and event-oriented.

---

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js

### Relational Database

- MySQL

Used for:

- Users
- Farmers
- Cooperatives
- Wallets
- Loans
- Products
- Transactions

### Document Database

- MongoDB

Used for:

Used for:

- Audit Logs
- Notifications

---

## Project Structure

```text
shambatrack/

├── frontend/
│   ├── src/
│   ├── pages/
│   ├── layouts/
│   ├── components/
│   └── api/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── config/
│   ├── utils/
│   └── services/
│
├── README.md
├── DECISIONS.md
└── .env.example
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/andawa01/shambatrack

cd shambatrack
```

---

## Backend Setup

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

Configure:

```env
PORT=5000

JWT_SECRET=your-secret

MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=
MYSQL_PASSWORD=password
MYSQL_DATABASE=

MONGO_URI=
```

Run migrations / seeders:

```bash
npm run seed
```

Start backend:

```bash
npm run dev
```

---

## Frontend Setup

Navigate to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create environment file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

---

## Demo Accounts

### System Administrator

```text
Username: superadmin
Password: SuperSecurePassword123
```

### Cooperative Administrator

```text
Username: coopadmin
Password: password123
```

### Farmer

```text
Username: james_farmer
Password: Farmer@123
```

---

## Security

Implemented protections:

- JWT Authentication
- Password Hashing (bcrypt)
- Role-Based Authorization
- Cooperative Data Isolation
- Protected Routes
- Audit Logging
- Transaction-Based Financial Operations

---

## Financial Integrity

Money-related operations are protected using database transactions.

Examples:

- Loan Disbursement
- Loan Repayment
- Wallet Updates

This prevents:

- Partial writes
- Data inconsistency
- Duplicate financial operations

---

## Testing

Areas tested:

- Authentication
- Authorization
- Loan Management
- Wallet Operations
- Audit Logging

Priority was given to business-critical functionality and permission boundaries.

---

## API Overview

### Authentication

```http
POST /api/auth/login
```

---

### Farmers

```http
GET    /api/farmers
POST   /api/farmers
GET    /api/farmers/:id
PUT    /api/farmers/:id
```

---

### Loans

```http
POST   /api/loans
PUT    /api/loans/:id/approve
PUT    /api/loans/:id/disburse
POST   /api/loans/:id/repay
GET    /api/loans
```

---

### Wallets

```http
GET    /api/wallets
POST   /api/wallets/credit
POST   /api/wallets/debit
```

---

### Audit Logs

```http
GET /api/audit-logs
GET /api/audit-log/farmer
Grt /api/audit-log/coop-admin
```

---

## Future Improvements

Given additional development time, the following would be added:

- Offline-first field data entry
- SMS notification service
- PDF report generation
- CSV exports
- Farmer dispute workflows
- Background job processing
- Automated reporting
- Advanced credit scoring

---

## Author

Evans Andawa

ShambaTrack – Full Stack Developer Internship Submission
