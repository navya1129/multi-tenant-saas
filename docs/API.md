# Enterprise Multi-Tenant Platform – REST API Reference (Version A)

## Introduction
This REST API documentation describes an enterprise-ready multi-tenant platform that supports structured project and task management. The system is designed to allow multiple organizations to coexist securely within a single application while maintaining complete tenant-level isolation.

The platform enforces role-based access control (RBAC), ensuring that users can only perform actions permitted by their assigned roles. Subscription plans regulate the number of users, projects, and available features for each tenant.

**Base URL:** `http://localhost:5000/api`

---

## Authentication APIs

### Tenant Registration
Creates a new organization along with its primary administrator account.

**POST** `/api/auth/register-tenant`

This endpoint initializes a tenant, assigns a unique subdomain, and creates an admin user responsible for managing the organization.

---

### User Login
Validates user credentials and issues a JWT for authenticated access.

**POST** `/api/auth/login`

Upon successful login, a token is returned and must be included in all protected API requests.

---

### Current User Details
Fetches profile information of the logged-in user.

**GET** `/api/auth/me`

Requires a valid JWT in the Authorization header.

---

### Logout
Ends the user session on the client side.

**POST** `/api/auth/logout`

---

## Tenant Management APIs

### View All Tenants (Super Admin)
Returns a paginated list of all registered tenants.

**GET** `/api/tenants`

Accessible only to users with super admin privileges.

---

### Tenant Information
Retrieves detailed information about a specific tenant, including subscription details.

**GET** `/api/tenants/:tenantId`

---

### Update Tenant
Allows tenant administrators to modify organization settings.

**PUT** `/api/tenants/:tenantId`

---

## User Management APIs

### Create Tenant User
Adds a new user to a tenant with a defined role.

**POST** `/api/tenants/:tenantId/users`

---

### List Tenant Users
Displays all users associated with a tenant.

**GET** `/api/tenants/:tenantId/users`

---

### Update User
Updates user profile details or role assignments.

**PUT** `/api/users/:userId`

---

### Delete User
Removes a user from the tenant.

**DELETE** `/api/users/:userId`

---

## Project APIs

### Create Project
Registers a new project under a tenant.

**POST** `/api/tenants/:tenantId/projects`

---

### List Projects
Returns all projects belonging to a tenant.

**GET** `/api/tenants/:tenantId/projects`

---

### Update Project
Modifies project attributes such as name, description, or status.

**PUT** `/api/projects/:projectId`

---

### Delete Project
Deletes a project and all its related tasks.

**DELETE** `/api/projects/:projectId`

---

## Task APIs

### Create Task
Creates a task within a specified project.

**POST** `/api/projects/:projectId/tasks`

---

### List Tasks
Retrieves tasks associated with a project.

**GET** `/api/projects/:projectId/tasks`

---

### Update Task
Updates task properties including status and priority.

**PUT** `/api/tasks/:taskId`

---

### Delete Task
Removes a task from the system.

**DELETE** `/api/tasks/:taskId`

---

## Error Handling
All API errors follow a consistent response structure containing a success flag, error message, and error code. Standard HTTP status codes are used to indicate request outcomes.

---

## Security & Logging
All write operations are logged with user identity, tenant reference, action type, and timestamp. JWT authentication and RBAC are enforced across all protected routes.

---

## Subscription Plans
Plans define usage limits such as maximum users and projects. Higher-tier plans unlock additional features and increased quotas.
