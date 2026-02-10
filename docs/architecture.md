# System Architecture Document
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. System Architecture Diagram

The system follows a three-tier architecture consisting of a client layer, application layer, and data layer.

### Components:
- **Client (Browser):** End users access the system via a web browser.
- **Frontend Application:** A React-based single-page application responsible for UI rendering and API communication.
- **Backend API Server:** A Node.js (Express) REST API that handles authentication, business logic, and data access.
- **Database:** PostgreSQL database used for persistent data storage.
- **Authentication Flow:** JWT-based authentication is used for securing API endpoints.

### Authentication Flow:
- User submits login credentials via the frontend.
- Backend validates credentials and issues a JWT.
- Frontend stores JWT and attaches it to all protected API requests.
- Backend validates JWT and enforces role-based access control.

**Diagram Location:**  
`docs/images/system-architecture.png`

---

## 2. Database Schema Design (ERD)

The database follows a shared schema multi-tenant design where all tenant data is stored in shared tables and isolated using a `tenant_id` column.

### Tables Overview:

- **tenants**
  - id (PK)
  - name
  - subdomain (UNIQUE)
  - subscription_plan
  - max_users
  - max_projects
  - created_at

- **users**
  - id (PK)
  - tenant_id (FK, nullable for Super Admin)
  - email
  - password_hash
  - full_name
  - role
  - is_active
  - created_at

- **projects**
  - id (PK)
  - tenant_id (FK)
  - name
  - description
  - status
  - created_at

- **tasks**
  - id (PK)
  - tenant_id (FK)
  - project_id (FK)
  - title
  - description
  - status
  - priority
  - assigned_to
  - due_date
  - created_at

- **audit_logs**
  - id (PK)
  - tenant_id (FK)
  - user_id (FK)
  - action
  - entity_type
  - entity_id
  - ip_address
  - created_at

### Relationships:
- One tenant can have many users
- One tenant can have many projects
- One project can have many tasks
- One user can have many audit logs

Indexes are applied on all `tenant_id` columns to improve query performance and ensure efficient data isolation.

**ERD Image Location:**  
`docs/images/database-erd.png`

---

## 3. API Architecture

### Authentication Module

- **POST /api/auth/register-tenant**  
  Auth Required: No  
  Roles: Public  

- **POST /api/auth/login**  
  Auth Required: No  
  Roles: Public  

- **POST /api/auth/me**  
  Auth Required: Yes  
  Roles: All authenticated users

- **POST /api/auth/logout**  
  Auth Required: Yes  
  Roles: All authenticated users

---

### Tenant Module

- **GET /api/tenants/:tenantId**  
  Auth Required: Yes  
  Roles: Tenant Admin  

- **GET /api/tenants**  
  Auth Required: Yes  
  Roles: Super Admin  

- **PUT /api/tenants/:tenantId**  
  Auth Required: Yes  
  Roles: Tenant Admin

---

### User Module

- **POST /api/tenants/:tenantId/users**  
  Auth Required: Yes  
  Roles: Tenant Admin  

- **GET /api/tenants/:tenantId/users**  
  Auth Required: Yes  
  Roles: Tenant Admin  

- **PUT /api/users/:userId**  
  Auth Required: Yes  
  Roles: Tenant Admin, Self (Only full_name)

- **DELETE /api/users/:userId**  
  Auth Required: Yes  
  Roles: Tenant Admin 

---

### Project Module

- **POST /api/projects**  
  Auth Required: Yes  
  Roles: Tenant Admin, User

- **GET /api/projects**  
  Auth Required: Yes  
  Roles: Tenant Admin, User  

- **PUT /api/projects/:projectId**  
  Auth Required: Yes  
  Roles: Tenant Admin, User (Project Creator) 

- **DELETE /api/projects/:projectId**  
  Auth Required: Yes  
  Roles: Tenant Admin, User (Project Creator)

---

### Task Module

- **POST /api/projects/:projectId/tasks**  
  Auth Required: Yes  
  Roles: Tenant Admin, User  

- **GET /api/projects/:projectId/tasks**  
  Auth Required: Yes  
  Roles: Tenant Admin, User  

- **PATCH /api/tasks/:taskId/status**  
  Auth Required: Yes  
  Roles: Tenant Admin, End User

- **PUT /api/tasks/:taskId**  
  Auth Required: Yes  
  Roles: Tenant Admin, End User  

---

### System Module

- **GET /api/projects/all**  
  Auth Required: Yes  
  Roles: Super Admin

- **GET /api/tasks/all**  
  Auth Required: Yes  
  Roles: Super Admin

- **GET /api/health**  
  Auth Required: No  
  Roles: Public  


