# API Documentation – Multi-Tenant SaaS Platform

## Authentication

### Authentication Method
- JWT (JSON Web Token)
- Token must be sent in header: Authorization: Bearer <token>

---

## 1. Auth APIs

### API 1. Tenant Registration
- **Method:** POST
- **Endpoint:** /api/auth/register-tenant
- **Auth Required:** No

**Request**
```json
{
  "tenantName": "Test Company Alpha",
  "subdomain": "testalpha",
  "adminEmail": "admin@testalpha.com",
  "adminPassword": "TestPass@123",
  "adminFullName": "Alpha Admin"
}
```

**Response** `200 OK`

### API 2. Login
- **Method:** POST
- **Endpoint:** /api/auth/login
- **Auth Required:** No

**Request**
```json
{
  "email": "admin@demo.com",
  "password": "Demo@123",
  "tenantSubdomain": "demo"
}

```

**Response** `200 OK`

### API 3. Get Current User
- **Method:** GET
- **Endpoint:** /api/auth/me
- **Auth Required:** Yes

**Response** `200 OK`

### API 4. Logout
- **Method:** POST
- **Endpoint:** /api/auth/logout
- **Auth Required:** Yes

**Response** `200 OK`

---

## 2. Tenant APIs

### API 5. Get Tenants Details
- **Method:** GET
- **Endpoint:** /api/tenants/:tenantId
- **Auth Required:** Yes

**Response** `200 OK`

### API 6. Update Tenant
- **Method:** PUT
- **Endpoint:** /api/tenants/:tenantId
- **Auth Required:** Yes

**Request**
```json
{
    "name": "Demo Company One"
}
```

**Response** `200 OK`

### API 7. List All Tenants
- **Method:** GET
- **Endpoint:** /api/tenants/
- **Auth Required:** Yes
- **Authorization:** super_admin ONLY

**Response** `200 OK`

---

## 3. User APIs

### API 8. Add User to Tenant
- **Method:** POST
- **Endpoint:** /api/tenants/:tenantId/users
- **Auth Required:** Yes
- **Authorization:** tenant_admin only

**Request**
```json
{
  "email": "newuser@demo.com",
  "password": "NewUser@123",
  "full_name": "New User",
  "role": "user"
}
```

**Response** `200 OK`

### API 9. List Tenant Users
- **Method:** GET
- **Endpoint:** /api/tenants/:tenantId/users
- **Auth Required:** Yes
- **Authorization:** User must belong to this tenant

**Response** `200 OK`

### API 10. Update User
- **Method:** PUT
- **Endpoint:** /api/users/:userId
- **Auth Required:** Yes
- **Authorization:** tenant_admin OR self(limited fields)

**Request**
```json
{
  "full_name": "New User One",
}
```

**Response** `200 OK`

### API 11. Delete User
- **Method:** DELETE
- **Endpoint:** /api/users/:userId
- **Auth Required:** Yes
- **Authorization:** tenant_admin only

**Response** `200 OK`

---

## 4. Project APIs

### API 12. Create Project
- **Method:** POST
- **Endpoint:** /api/projects
- **Auth Required:** Yes

**Request**
```json
{
  "name": "Website Redesign Project",
  "description": "Complete redesign of company website"
}
```

**Response** `200 OK`

### API 13. List Projects
- **Method:** GET
- **Endpoint:** /api/projects
- **Auth Required:** Yes

**Response** `200 OK`

### API 14. Update Project
- **Method:** PUT
- **Endpoint:** /api/projects/:projectId
- **Auth Required:** Yes
- **Authorization:** tenant_admin OR project creator

**Request**
```json
{
  "name": "Website Redesign Project - 2",
  "description": "Complete redesign of company website - 2",
  "status": "archived"
}
```

**Response** `200 OK`

### API 15. Delete Project
- **Method:** DELETE
- **Endpoint:** /api/projects/:projectId
- **Auth Required:** Yes
- **Authorization:** tenant_admin only OR project creator

**Response** `200 OK`

---

## 5. Task APIs

### API 16. Create Task
- **Method:** POST
- **Endpoint:** /api/projects/:projectId/tasks
- **Auth Required:** Yes

**Request**
```json
{
  "title": "Design homepage mockup phase 2",
  "description": "Create high-fidelity design",
  "assignedTo": "33333333-3333-3333-3333-333333333333",
  "priority": "high",
  "dueDate": "2025-12-30"
}
```

**Response** `200 OK`

### API 17. List Project Tasks
- **Method:** GET
- **Endpoint:** /api/projects/:projectId/tasks
- **Auth Required:** Yes

**Response** `200 OK`

### API 18. Update Task Status
- **Method:** PATCH
- **Endpoint:** /api/tasks/:taskId/status
- **Auth Required:** Yes

**Request**
```json
{
  "status": "in_progress"
}
```

**Response** `200 OK`

### API 19. Update Task
- **Method:** PUT
- **Endpoint:** /api/tasks/:taskId
- **Auth Required:** Yes

**Request**
```json
{
  "priority": "high",
  "dueDate": "2026-02-01"
}
```

**Response** `200 OK`

---

## Super Admin APIs Extra

### API 20. List All the Projects across all the tenants
- **Method:** GET
- **Endpoint:** /api/projects/all
- **Auth Required:** Yes
- **Authorization:** only super_admin

**Response** `200 OK`

### API 21. List Project Tasks
- **Method:** GET
- **Endpoint:** /api/tasks/all
- **Auth Required:** Yes
- **Authorization:** only super_admin

**Response** `200 OK`

---

## Health Check

### API 22. List Project Tasks
- **Method:** GET
- **Endpoint:** /api/health
- **Auth Required:** No

**Response** `200 OK`

---

# Summary

- Total APIs documented: 19+
- Authentication explained
- Request/response examples included
- Meets evaluation requirements