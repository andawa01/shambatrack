# DECISIONS.md

## ShambaTrack – Design Decisions

### Project Overview

ShambaTrack is a cooperative management platform designed to digitize agricultural operations for farmer cooperatives. The platform manages farmers, deliveries, loans, wallets, payments, audit trails, and cooperative reporting while supporting multiple cooperatives within a single deployment.

The system was designed to solve common challenges faced by agricultural cooperatives:

- Duplicate or ghost farmer records
- Lack of transparency in farmer payments
- Manual loan tracking
- Limited reporting capabilities
- Difficulty auditing user actions
- Poor visibility into cooperative financial performance

---

# Assumptions

Several assumptions were made during implementation:

1. Every farmer belongs to exactly one cooperative.
2. A cooperative administrator can only manage records belonging to their cooperative.
3. Farmers can only access their own records.
4. Loan approval and loan disbursement are separate business processes.
5. Wallet balances represent money available to the farmer.
6. Audit logs must never be modified once written.
7. Internet connectivity is available for system access.
8. SMS notifications are simulated rather than integrated with a live provider.

---

# Chosen Expansion Areas

The following expansion areas were selected:

## 1. Multi-Cooperative Tenancy

Multiple cooperatives can operate within the same deployment.

Implementation:

- Every business record contains a coop_id.
- All cooperative queries are filtered using the authenticated user's coop_id.
- Cooperative administrators cannot access records from another cooperative.

Reason:

This reflects how a real SaaS cooperative platform would operate and demonstrates tenant isolation.

---

## 2. Audit Trail

All significant actions are recorded.

Examples:

- Login
- Loan creation
- Loan approval
- Loan disbursement
- Loan repayment
- Farmer creation
- Wallet transactions

Stored data includes:

- User
- Action
- Entity
- Entity ID
- Timestamp
- Metadata
- IP Address
- User Agent

Reason:

This directly addresses the ghost farmer problem described in the brief by creating accountability for every action.

---

## 3. Credit Readiness

Farmer production and financial history can be used to evaluate lending readiness.

The platform records:

- Production history
- Loan history
- Repayment history
- Outstanding balances

Reason:

One of the business goals in the brief is enabling lenders to evaluate trustworthy farmer production records.

---

## 4. Reporting and Export

Management reporting includes:

- Loan summaries
- Farmer summaries
- Wallet balances
- Production reports

Reason:

Cooperative management requires visibility into financial and operational performance.

--

## 5. Notifications

The platform includes an internal notification system that allows cooperative administrators to communicate directly with farmers.

Features:

- Cooperative administrators can create notifications.
- Notifications are delivered only to farmers within the same cooperative.
- Farmers can view notifications in their dashboard.
- Farmers can mark notifications as read.
- Read status is tracked per notification.

Notifications are stored in MongoDB because notification records are document-oriented, flexible in structure, and do not require complex relational joins.

Reason:

One of the challenges identified in the brief is cooperative communication with farmers. While the brief mentions SMS notifications, this implementation provides the communication workflow and delivery tracking layer that can later be integrated with an SMS gateway.

---

# Data Storage Strategy

The system intentionally uses two persistence paradigms.

## MySQL

Used for transactional and relational data.

Examples:

- Users
- Farmers
- Cooperatives
- Products
- Deliveries
- Wallets
- Loans
- Loan Transactions

Reason:

These entities contain strong relationships and require transactional consistency.

---

## MongoDB

Used for audit logging.

Examples:

- Audit logs
- Activity history

Reason:

Audit events are append-only records and fit naturally into a document database.

I considered storing audit logs in MySQL, but MongoDB provides more flexibility for storing variable metadata structures without frequent schema changes.

---

# Authentication and Authorization

Authentication uses JWT tokens.

Authorization uses role-based access control.

Roles:

- System Admin
- Cooperative Admin
- Farmer

Examples:

- Farmers cannot access another farmer's records.
- Cooperative admins cannot access another cooperative's data.
- System administrators can access all cooperatives.

All authorization checks are enforced on the server.

---

# Threat Model

Potential attacks considered:

## Accessing another cooperative's data

Mitigation:

All queries include cooperative ownership checks using coop_id.

---

## Accessing another farmer's profile

Mitigation:

Farmer endpoints always use the authenticated farmer's identity.

---

## Loan manipulation

Mitigation:

Loan status transitions are validated.

Example:

Pending → Approved → Disbursed

Invalid transitions are rejected.

---

## Double disbursement

Mitigation:

Loan status validation occurs within a database transaction.

Disbursed loans cannot be disbursed again.

---

# Money Safety

Money-related operations use database transactions.

Protected operations:

- Loan disbursement
- Loan repayment
- Wallet updates

Transactions ensure:

- Atomic updates
- Rollback on failure
- Prevention of partial writes

This prevents inconsistent financial records.

---

# Testing Strategy

Priority was given to business-critical functionality.

Tested areas:

- Authentication
- Authorization
- Loan lifecycle
- Wallet updates
- Audit log generation

Reason:

These areas directly impact security and financial correctness.

Areas intentionally given lower priority:

- Styling
- Minor UI components

These have lower business risk.

---

# AI Usage Disclosure

AI tools used:

- ChatGPT

Used for:

- Architecture discussions
- Code review
- Refactoring suggestions
- Documentation drafting

Example of rejected AI suggestion:

An early suggestion stored all audit logs in MySQL. This was rejected because MongoDB provided more flexibility for event metadata and future expansion.

All final design decisions and implementations were reviewed and understood before adoption.

---

# What Was Cut

Due to time constraints the following features were not fully implemented:

- Offline synchronization
- Real SMS gateway integration
- Advanced dispute management workflow
- Automated scheduled reporting

---

# What I Would Build With Two More Weeks

1. Full dispute and correction workflow.
2. Offline-first field clerk application.
3. Automated SMS notifications.
4. Advanced analytics dashboard.
5. Farmer credit scoring engine.
6. PDF and CSV reporting exports.
7. Background job processing using queues.
