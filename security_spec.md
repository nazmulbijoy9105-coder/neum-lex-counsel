# Firestore Security Rules Specification

This document defines the security boundaries, data invariants, and threat analysis for the Firestore database.

## 1. Data Invariants

1. **User Identity Isolation**: A user can only access their own profile document (`/users/{userId}`) and their owned contract documents (`/contracts/{contractId}`).
2. **Contract Document Ownership**: The contract's `userId` must strictly match the ID of the authenticated user submitting the request.
3. **Log Immutability**: Governance logs are write-only for clients to log compliance triggers; they are read-only for admins and cannot be modified or deleted once stored.
4. **Verified Users**: For writing or reading highly secure RMG contract audit sheets, users must have a valid authenticated session.

---

## 2. The "Dirty Dozen" Threat Payloads

The following payloads represent malicious requests that the Firestore rules must actively reject:

1. **Self-Elevated Privilege Attack**: An unprivileged user attempts to register their role as `admin`.
2. **User Profile Hijacking**: User `usr-alpha` attempts to write directly to `/users/usr-beta`.
3. **Contract Spoofing (Foreign Owner)**: An authenticated user (`usr-alpha`) attempts to save a contract where `userId` is set to `usr-beta`.
4. **Third-Party Contract Read (Exfiltration)**: User `usr-alpha` tries to read an audit report stored in `/contracts/contract-beta` belonging to `usr-beta`.
5. **Contract Deletion Hijack**: User `usr-alpha` attempts to delete `/contracts/contract-beta` belonging to `usr-beta`.
6. **Field Injection (Ghost Fields)**: An update payload containing a ghost status field to circumvent compliance locks.
7. **Timestamp Spoofing**: Attempting to set `createdAt` or `updatedAt` to a manual client-side timestamp instead of the server's `request.time`.
8. **Malicious Document ID Poisoning**: Trying to create a contract with an extremely long or character-polluted identifier (e.g., `../vuln/%20` or size > 128 characters).
9. **Log Tampering**: An authenticated user attempts to update or delete a log document in `/logs/{logId}` to erase evidence of compliance failures.
10. **Blanket Read Request (Query Scraping)**: A user requests `getDocs(collection('contracts'))` without specifying a relational filtering condition `where("userId", "==", request.auth.uid)`.
11. **Anonymously Writing Records**: An completely unauthenticated guest trying to inject contracts or write governance logs.
12. **Double-Taxation Treaties (TRC) Override**: Attempting to alter a contract's metadata after its terminal expiry date has passed.

---

## 3. Test Cases (TDD Rules Assertions)

All listed "Dirty Dozen" payloads will result in a standard `PERMISSION_DENIED` error from the Firestore engine. The ruleset enforces this directly via the attribute check compiler.
