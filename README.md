
# Enterprise Multi-Tenant Task Management Platform

An enterprise-ready, scalable multi-tenant solution built to manage projects and tasks efficiently across organizations. Developed using modern technologies such as **Node.js**, **Express**, **React**, and **PostgreSQL**, and fully containerized with **Docker** for smooth deployment and portability.

---

## ✨ Key Capabilities

- **Strong Tenant Isolation** – Ensures complete separation of data between organizations  
- **Role-Based Access Control** – Three defined roles: super_admin, tenant_admin, and user  
- **Secure Authentication** – JWT-based authentication with 24-hour expiry and bcrypt-hashed passwords  
- **Extensive REST API** – 19 robust endpoints supporting full CRUD functionality  
- **Subscription Enforcement** – Plan-driven limits for users and projects  
- **Audit Logging** – Automatic tracking of all critical actions  
- **React-Powered UI** – Clean interface with protected routes and global state handling  
- **Automated Database Setup** – Schema migrations and seed data handled automatically  
- **Docker-Oriented Design** – Fully orchestrated services with health checks via Docker Compose  

---

## 🏗️ Platform Architecture

```
Client Layer (React SPA)
        ↓
Application Layer (Node.js + Express)
        ↓
Data Layer (PostgreSQL)
```

- Frontend served on **localhost:3000**
- Backend API exposed on **localhost:5000/api**
- Database available on **port 5432**

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose installed  
- Node.js 18+ (only for local development)

### Start the Application
```bash
docker-compose up -d
```

Once running, the platform can be accessed at:
- Web UI: http://localhost:3000  
- API: http://localhost:5000/api  
- Database: localhost:5432  

### Verify Services
```bash
docker-compose ps
```

### Stop the Platform
```bash
docker-compose down
```

---

## 📱 Using the Application

### Demo Login Credentials

**Super Administrator**
- Email: superadmin@system.com  
- Password: Admin@123  

**Tenant Administrator (Demo Org)**
- Email: admin@demo.com  
- Password: Demo@123  
- Organization: demo  

**Standard Users**
- user1@demo.com / User@123  
- user2@demo.com / User@123  
- Organization: demo  

---

### Tenant Registration
Use the **Register** option to create a new organization and assign an administrator account.

### User Management
- View all users within a tenant  
- Add users with assigned roles  
- Update user details  
- Remove users from the organization  

### Project Management
- Create new projects  
- Edit or archive existing projects  
- Delete projects when no longer required  

### Task Management
- Add tasks to projects  
- Assign priority and status  
- Update or remove tasks  

---

## 📚 API Overview

Complete API documentation is available in **docs/API.md**.

### Example Requests

**Login**
```bash
curl -X POST http://localhost:5000/api/auth/login   -H "Content-Type: application/json"   -d '{
    "email": "admin@demo.com",
    "password": "demo123",
    "tenantSubdomain": "demo"
  }'
```

**Create Project**
```bash
curl -X POST http://localhost:5000/api/tenants/{tenantId}/projects   -H "Authorization: Bearer <token>"   -H "Content-Type: application/json"   -d '{
    "name": "My Project",
    "description": "Project description",
    "status": "active"
  }'
```

---

## 🔐 Authentication Flow

1. User logs in  
2. Server issues a JWT valid for 24 hours  
3. Token is passed via `Authorization: Bearer <token>`  
4. Middleware validates every request  
5. Expired tokens require re-authentication  

---

## 📊 Data Models

- **Tenant** – Organization-level configuration and subscription data  
- **User** – Account details, role, and tenant mapping  
- **Project** – Tenant-owned project records  
- **Task** – Work items associated with projects  
- **AuditLog** – Historical record of all system actions  

---

## 🧪 Testing

Run automated integration tests:
```bash
node integration-test.js
```

All 19 endpoints are validated using real-world workflows.

---

## 📁 Repository Structure

```
frontend/        # React application
backend/         # Express + TypeScript API
docs/            # API documentation
docker-compose.yml
integration-test.js
submission.json
README.md
```

---

## 🔧 Configuration

### Backend
- DATABASE_URL  
- JWT_SECRET  
- NODE_ENV  

### Frontend
- VITE_API_URL (defaults to backend service)

All variables are preconfigured for Docker usage.

---

## 🛡️ Security Measures

- bcrypt password hashing  
- JWT authentication (HS256)  
- Input validation with Zod  
- Role-based authorization  
- Strict tenant data isolation  
- Full audit trail  
- CORS configuration  
- Non-root Docker containers  

---

## 📦 Subscription Plans

| Plan | Users | Projects | Access |
|------|-------|----------|--------|
| Free | 5 | 2 | Core features |
| Pro | 50 | 10 | Full access |
| Enterprise | Unlimited | Unlimited | No limits |

Limits are enforced at the API layer.

---

## 🐳 Docker Utilities

```bash
docker-compose up -d --build
docker logs backend -f
docker-compose down
docker-compose down -v
docker-compose build backend
```

---

## 🧠 Tech Stack

React, Vite, Express.js, TypeScript, Node.js, PostgreSQL, Prisma, JWT, bcryptjs, Zod, Jest, Docker

---

## 🐛 Common Issues

- **Containers not starting** – Check logs and rebuild  
- **Database not ready** – Wait and restart services  
- **Frontend errors** – Verify API URL  
- **401 errors** – Token expired, re-login  

---

## 📝 Notes

- All timestamps are stored in UTC  
- Emails are unique per tenant  
- Super admins are system-created only  
- Demo data is auto-seeded  
- Tokens stored in localStorage  

---

## ✨ Highlights

✔ Multi-tenant isolation  
✔ Secure RBAC  
✔ JWT authentication  
✔ Subscription enforcement  
✔ Automated migrations  
✔ Full audit logging  
✔ Dockerized deployment  

---

Krishna Tulasi Satti