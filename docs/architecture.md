# Architecture Documentation – Version A

## System Design Overview

### High-Level System Architecture

```mermaid
graph TB
    subgraph Client
        Browser[Client Browser]
    end

    subgraph Frontend["Frontend Tier (Port 3000)"]
        FE[React Application<br/>Vite + React Router]
    end

    subgraph Backend["Backend Tier (Port 5000)"]
        API[Express Server<br/>Node.js + TypeScript]
        AUTH[JWT Verification<br/>Middleware]
        PERM[RBAC Authorization<br/>Middleware]
        TENANT[Tenant Scope<br/>Middleware]
    end

    subgraph Database["Data Layer (Port 5432)"]
        DB[(PostgreSQL 15<br/>Tenant-Aware Database)]
    end

    Browser --> FE
    FE --> API
    API --> AUTH
    AUTH --> PERM
    PERM --> TENANT
    TENANT --> DB
```

### Component Breakdown

**Client Layer**
- End users interact with the system using standard web browsers over HTTP or HTTPS

**Frontend Layer (3000)**
- Built using React 18 and bundled with Vite
- Client-side routing via React Router
- Secure routes protected by authentication checks
- Adaptive and responsive user interface

**Backend Layer (5000)**
- REST API implemented using Express and TypeScript
- JWT middleware responsible for token validation
- RBAC layer ensures role-specific access
- Tenant middleware enforces data separation
- Centralized error handling across endpoints

**Database Layer (5432)**
- PostgreSQL 15 used for persistent storage
- Multi-tenant design using tenant_id references
- Prisma ORM for database abstraction
- Migration and seed automation

## Authentication Lifecycle

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant J as JWT
    participant D as Database

    U->>F: Submit credentials and tenant
    F->>A: Login request
    A->>D: Validate tenant
    D-->>A: Tenant found
    A->>D: Validate user
    D-->>A: User verified
    A->>J: Issue token
    J-->>A: JWT
    A-->>F: Token + user info
    F->>F: Save token
    F-->>U: Navigate to dashboard
```

## Database Design

### Entity Relationships

```mermaid
erDiagram
    TENANTS ||--o{ USERS : owns
    TENANTS ||--o{ PROJECTS : manages
    TENANTS ||--o{ TASKS : contains
    TENANTS ||--o{ AUDIT_LOGS : records

    USERS ||--o{ PROJECTS : creates
    USERS ||--o{ TASKS : assigned
    USERS ||--o{ AUDIT_LOGS : logs

    PROJECTS ||--o{ TASKS : includes
```

### Table Summary

**tenants**
- Organization-level data
- Unique subdomain per tenant
- Subscription and quota configuration

**users**
- Login and identity records
- Linked to tenants
- Role-based permissions

**projects**
- Project entities scoped to tenants
- Lifecycle controlled via status

**tasks**
- Work items within projects
- Priority and progress tracking

**audit_logs**
- Records security-relevant actions
- Used for compliance and traceability

## Tenant Isolation Model

```mermaid
graph TB
    Filter[Tenant Filter]
    A[Tenant A]
    B[Tenant B]

    Filter --> A
    Filter --> B
```

- All records include tenant_id
- JWT token supplies tenant context
- Super admins bypass tenant restrictions
- Indexed tenant_id for performance

## API Structure

### Core Endpoints

**Auth**
- Register tenant
- Login / Logout
- Fetch current user

**Tenants**
- View and update tenant details
- List all tenants (super admin)

**Users**
- Create, read, update, delete tenant users

**Projects**
- Manage tenant projects

**Tasks**
- Manage project tasks

## Security Model

- Stateless JWT authentication
- 24-hour token validity
- Role and tenant-based authorization
- Layered middleware request processing

## API Responses

Success:
```json
{ "success": true, "data": {} }
```

Failure:
```json
{ "success": false, "message": "Error" }
```
