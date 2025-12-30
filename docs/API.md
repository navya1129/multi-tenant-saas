# Enterprise Multi-Tenant Platform - REST API Reference

## Introduction
A comprehensive enterprise-grade multi-tenant system featuring project and task orchestration capabilities. The architecture implements strict tenant isolation, granular role-based permissions (RBAC), and flexible subscription-tier resource management.

**API Base URL:** `http://localhost:5000/api`

## Documentation Index
1. [Authentication Endpoints](#authentication-apis)
2. [Tenant Management](#tenant-apis)
3. [User Operations](#user-apis)
4. [Project Management](#project-apis)
5. [Task Operations](#task-apis)
6. [Error Response Handling](#error-handling)
7. [Demo Account Credentials](#test-credentials)

---

## Authentication APIs

### 1. Organization Registration
Establish a new tenant organization with administrative account.

**Endpoint:** `POST /api/auth/register-tenant`

**Request Payload:**
```json
{
  "tenantName": "Acme Corp",
  "subdomain": "acme",
  "adminEmail": "admin@acme.com",
  "adminPassword": "SecurePassword123!",
  "adminFullName": "John Admin"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "tenantId": "uuid-here",
    "adminEmail": "admin@acme.com",
    "tenantName": "Acme Corp"
  }
}
```

**Error Responses:**
- `400` - Subdomain conflict or schema validation failure
- `500` - Internal server error

---

### 2. User Authentication
Authenticate user credentials and receive authorization token.

**Endpoint:** `POST /api/auth/login`

**Request Payload:**
```json
{
  "email": "admin@demo.com",
  "password": "demo123",
  "tenantSubdomain": "demo"  // Optional for super_admin users
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "email": "admin@demo.com",
      "fullName": "Demo Admin",
      "role": "admin",
      "tenantId": "uuid-here"
    }
  }
}
```

**Token Specifications:**
- **Algorithm:** JWT (HS256)
- **Lifetime:** 24 hours
- **Usage:** `Authorization: Bearer <token>`

**Error Responses:**
- `401` - Authentication failed
- `404` - Account not found

---

### 3. Get Current User Info
Retrieve authenticated user details.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid-here",
    "email": "admin@demo.com",
    "fullName": "Demo Admin",
    "role": "admin",
    "tenantId": "uuid-here"
  }
}
```

**Error Cases:**
- `401` - Missing or invalid token
- `404` - User not found

---

### 4. Logout
Invalidate user session (token-based, client-side logout).

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Tenant APIs

### 1. List All Tenants (Super Admin Only)
Retrieve all registered tenants.

**Endpoint:** `GET /api/tenants`

**Headers:**
```
Authorization: Bearer <super_admin_token>
```

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "Demo Tenant",
      "subdomain": "demo",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Not super_admin

---

### 2. Get Tenant Details
Retrieve specific tenant information.

**Endpoint:** `GET /api/tenants/:tenantId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Demo Tenant",
    "subdomain": "demo",
    "status": "active",
    "subscription": {
      "plan": "pro",
      "maxUsers": 50,
      "maxProjects": 10
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Accessing different tenant
- `404` - Tenant not found

---

### 3. Update Tenant
Modify tenant details (Admin only).

**Endpoint:** `PUT /api/tenants/:tenantId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Tenant Name",
  "subscription": "enterprise"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "uuid-here",
    "name": "Updated Tenant Name",
    "subscription": "enterprise"
  }
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Not admin
- `404` - Tenant not found

---

## User APIs

### 1. Add User to Tenant
Create a new user within a tenant.

**Endpoint:** `POST /api/tenants/:tenantId/users`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "fullName": "New User",
  "role": "user"  // 'user' or 'admin'
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User added successfully",
  "data": {
    "id": "uuid-here",
    "email": "newuser@example.com",
    "fullName": "New User",
    "role": "user",
    "tenantId": "uuid-here"
  }
}
```

**Validation:**
- Email must be unique within tenant
- Password must be at least 8 characters
- Role must be 'user' or 'admin'

**Error Cases:**
- `400` - Validation error or subscription limit exceeded
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - Tenant not found

---

### 2. List Tenant Users
Retrieve all users in a tenant.

**Endpoint:** `GET /api/tenants/:tenantId/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "email": "admin@demo.com",
      "fullName": "Demo Admin",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Accessing different tenant
- `404` - Tenant not found

---

### 3. Update User
Modify user information.

**Endpoint:** `PUT /api/users/:userId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "role": "admin"  // Change user role
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid-here",
    "email": "user@demo.com",
    "fullName": "Updated Name",
    "role": "admin"
  }
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - User not found

---

### 4. Delete User
Remove a user from tenant.

**Endpoint:** `DELETE /api/users/:userId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - User not found

---

## Project APIs

### 1. Create Project
Create a new project within a tenant.

**Endpoint:** `POST /api/tenants/:tenantId/projects`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Mobile App Redesign",
  "description": "Complete redesign of the mobile application",
  "status": "active"  // 'active' or 'archived'
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "uuid-here",
    "name": "Mobile App Redesign",
    "description": "Complete redesign of the mobile application",
    "status": "active",
    "tenantId": "uuid-here",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Cases:**
- `400` - Validation error or subscription limit exceeded
- `401` - Not authenticated
- `404` - Tenant not found

---

### 2. List Projects
Retrieve all projects in a tenant.

**Endpoint:** `GET /api/tenants/:tenantId/projects`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10
- `status` (optional): Filter by status ('active', 'archived')

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "Mobile App Redesign",
      "description": "Complete redesign of the mobile application",
      "status": "active",
      "tenantId": "uuid-here",
      "taskCount": 5,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Accessing different tenant
- `404` - Tenant not found

---

### 3. Update Project
Modify project details.

**Endpoint:** `PUT /api/projects/:projectId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "archived"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "uuid-here",
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "archived"
  }
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - Project not found

---

### 4. Delete Project
Remove a project and all associated tasks.

**Endpoint:** `DELETE /api/projects/:projectId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - Project not found

---

## Task APIs

### 1. Create Task
Create a new task within a project.

**Endpoint:** `POST /api/projects/:projectId/tasks`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Design login page",
  "description": "Create responsive login page with email/password authentication",
  "priority": "high",  // 'low', 'medium', 'high'
  "status": "pending"  // 'pending', 'in_progress', 'completed'
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "uuid-here",
    "title": "Design login page",
    "description": "Create responsive login page with email/password authentication",
    "priority": "high",
    "status": "pending",
    "projectId": "uuid-here",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Cases:**
- `400` - Validation error
- `401` - Not authenticated
- `404` - Project not found

---

### 2. List Tasks
Retrieve all tasks in a project.

**Endpoint:** `GET /api/projects/:projectId/tasks`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 10
- `status` (optional): Filter by status ('pending', 'in_progress', 'completed')
- `priority` (optional): Filter by priority ('low', 'medium', 'high')

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "title": "Design login page",
      "description": "Create responsive login page with email/password authentication",
      "priority": "high",
      "status": "pending",
      "projectId": "uuid-here",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Accessing different tenant
- `404` - Project not found

---

### 3. Update Task
Modify task details.

**Endpoint:** `PUT /api/tasks/:taskId`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Design login page",
  "description": "Updated description",
  "priority": "medium",
  "status": "in_progress"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "uuid-here",
    "title": "Design login page",
    "priority": "medium",
    "status": "in_progress"
  }
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - Task not found

---

### 4. Delete Task
Remove a task.

**Endpoint:** `DELETE /api/tasks/:taskId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Cases:**
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - Task not found

---

## Error Handling

### Standard Error Response
All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Error Code Examples
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `LIMIT_EXCEEDED` - Subscription limit reached
- `ALREADY_EXISTS` - Resource already exists

---

## Test Credentials

### Super Admin (Can manage all tenants)
```
Email: super_admin@demo.com
Password: super_admin
Role: super_admin
```

### Demo Tenant Admin
```
Email: admin@demo.com
Password: demo123
Tenant Subdomain: demo
Role: admin
```

### Demo Tenant User
```
Email: user@demo.com
Password: demo123
Tenant Subdomain: demo
Role: user
```

---

## Authentication Flow

### 1. Register a New Tenant
```bash
POST /api/auth/register-tenant
{
  "tenantName": "Your Company",
  "subdomain": "yourcompany",
  "adminEmail": "admin@yourcompany.com",
  "adminPassword": "SecurePassword123!",
  "adminFullName": "Admin Name"
}
```

### 2. Login
```bash
POST /api/auth/login
{
  "email": "admin@yourcompany.com",
  "password": "SecurePassword123!",
  "tenantSubdomain": "yourcompany"
}
```

### 3. Use Token
Include token in all subsequent requests:
```bash
GET /api/tenants/{tenantId}
Headers:
  Authorization: Bearer {token}
```

### 4. Token Expiration
Tokens expire after 24 hours. Users must login again to get a new token.

---

## Audit Logging

All modifications are automatically logged with:
- User ID
- Tenant ID
- Action performed
- Timestamp
- IP Address (when available)

Audit logs help track changes for compliance and debugging.

---

## Rate Limiting & Quotas

**Subscription Plans:**

| Plan | Max Users | Max Projects | Features |
|------|-----------|--------------|----------|
| Free | 5 | 2 | Basic task management |
| Pro | 50 | 10 | Advanced features |
| Enterprise | Unlimited | Unlimited | Full feature access |

---

## Support

For API issues or questions, check:
1. Error messages in response
2. HTTP status codes
3. Request/response examples in this documentation
4. Backend logs for detailed error information

