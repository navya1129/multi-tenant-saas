# Multi-Tenant SaaS Platform with Project & Task Management

## 1. Project Title and Description

### Project Name
Multi-Tenant SaaS Platform with Project and Task Management System

### Description
This project is a production-ready multi-tenant SaaS application that enables organizations (tenants) to manage users, projects, and tasks in a secure and scalable way. It supports strict role-based access control with Super Admin, Tenant Admin, and User roles, along with audit logging and Docker-based deployment.

### Target Audience
- SaaS startups
- Enterprises managing multiple organizations
- Teams needing project and task tracking
- Developers learning multi-tenant architecture

---

## 2. Features List

- Multi-tenant architecture with tenant isolation
- Role-based access control (Super Admin, Tenant Admin, User)
- User management (create, edit, activate/deactivate, delete)
- Tenant management with subscription plans
- Project management per tenant
- Task management per project
- Audit logging for sensitive actions
- JWT-based authentication
- Protected frontend routes
- Dockerized deployment with health checks

---

## 3. Technology Stack

### Frontend
- React 18
- Vite
- Axios
- React Router DOM v6
- CSS (custom styling)

### Backend
- Node.js 18
- Express.js
- PostgreSQL (pg)
- JWT Authentication
- bcrypt

### Database
- PostgreSQL 15

### DevOps
- Docker
- Docker Compose
- Health checks

---

## 4. Architecture Overview

### System Architecture
The system follows a three-tier architecture:

- **Frontend (React)**  
  Handles UI, role-based rendering, and API communication.

- **Backend (Node.js + Express)**  
  Handles authentication, authorization, business logic, and audit logs.

- **Database (PostgreSQL)**  
  Stores tenants, users, projects, tasks, and audit logs.

### Architecture Diagram

---

## 5. Installation & Setup

### Prerequisites
- Node.js v18 or higher
- Docker & Docker Compose
- Git

### Steps (Docker)

```bash
git clone https://github.com/SRINIJA-PULLIPUDI/Multi-Tenant-SaaS-Platform-with-Project-and-Task-Management-System.git
cd Multi-Tenant-SaaS-Platform-with-Project-and-Task-Management-System
docker-compose up -d
```

Verify
```bash
docker-compose ps
```

### Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 6. Environment Variables
See backend/.env
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgres://postgres:postgres@database:5432/saas_db
JWT_SECRET=supersecretjwtkey
JWT_EXPIRES_IN=24h
```
See frontend/.env
```env
VITE_API_URL=http://localhost:5000/api
```

### Purpose
- Database connection
- JWT authentication


## 7. API Documentation
API documentation is available in:
[API.md file](./docs/API.md)

It includes:
- All APIs
- Authentication details
- Request/response examples

### Health Check
```http
GET /api/health
```
Returns 200 od when backend is ready.

| Role         | Email                                                 | Password     |
| ------------ | ----------------------------------------------------- | -------------|
| Super Admin  | [superadmin@system.com](mailto:superadmin@system.com) | Admin@123    |
| Tenant Admin | [admin@demo.com](mailto:admin@demo.com)               | Demo@123     |
| User         | [user1@demo.com](mailto:user1@demo.com)               | User@123     |
| User         | [user2@demo.com](mailto:user1@demo.com)               | User@123     |