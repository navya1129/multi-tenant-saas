
# Enterprise Task Platform – Quick Reference Guide

## 🚀 Getting Started

```bash
cd "d:\GPP\Multi-Tenant SaaS Platform with Project & Task Management"
docker-compose up -d
```

Please wait **10–15 seconds** for all services to initialize fully.

---

## 🌐 Service URLs

| Service | URL | Status |
|--------|-----|--------|
| Frontend | http://localhost:3000 | ✅ Running |
| Backend API | http://localhost:5000/api | ✅ Running |
| Health Check | http://localhost:5000/api/health | ✅ Running |
| PostgreSQL | localhost:5432 | ✅ Running |

---

## 🔐 Demo Credentials

### Super Admin (Access across all tenants)
```
Email: super_admin@demo.com
Password: super_admin
```

### Tenant Admin (Demo organization)
```
Email: admin@demo.com
Password: demo123
Organization: demo
```

### Standard User
```
Email: user@demo.com
Password: demo123
Organization: demo
```

---

## 📱 Application Pages

1. **Login Page** – http://localhost:3000  
   - Secure authentication  
   - Demo credentials visible  
   - Registration option available  

2. **Tenant Registration** – http://localhost:3000/register  
   - Create a new organization  
   - Set admin login details  
   - Define company profile  

3. **Dashboard** – http://localhost:3000/dashboard  
   - Organization overview  
   - Quick navigation  
   - User account summary  

4. **User Management** – http://localhost:3000/users  
   - View team members  
   - Add new users  
   - Update roles  
   - Remove users  

5. **Projects** – http://localhost:3000/projects  
   - Create and manage projects  
   - Edit project details  
   - Enable or disable projects  
   - Delete projects  

6. **Tasks** – http://localhost:3000/tasks  
   - Create tasks under projects  
   - Set priorities  
   - Update task information  
   - Remove tasks  

---

## 📚 API Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login   -H "Content-Type: application/json"   -d '{
    "email": "admin@demo.com",
    "password": "demo123",
    "tenantSubdomain": "demo"
  }'
```

Use the returned token for all protected requests:
```
Authorization: Bearer <token>
```

### Current User
```bash
curl -X GET http://localhost:5000/api/auth/me   -H "Authorization: Bearer <token>"
```

### Fetch Users
```bash
curl -X GET http://localhost:5000/api/tenants/{tenantId}/users   -H "Authorization: Bearer <token>"
```

### Create Project
```bash
curl -X POST http://localhost:5000/api/tenants/{tenantId}/projects   -H "Authorization: Bearer <token>"   -H "Content-Type: application/json"   -d '{
    "name": "My Project",
    "description": "Project description",
    "status": "active"
  }'
```

---

## 🛠️ Common Commands

### Check Container Status
```bash
docker-compose ps
```

### View Logs
```bash
docker logs backend -f
docker logs frontend -f
docker logs database -f
```

### Run Tests
```bash
node integration-test.js
```

### Stop Containers
```bash
docker-compose down
```

### Clean Restart
```bash
docker-compose down -v
docker-compose up -d
```

---

## 📖 Reference Docs

- **API Docs:** docs/API.md  
- **Setup Instructions:** README.md  
- **Project Overview:** COMPLETION_SUMMARY.md  
- **Deliverables:** DELIVERABLES.md  
- **Submission Info:** submission.json  

---

## 🔑 Available APIs (19)

### Authentication (4)
- Register Tenant
- Login
- Current User
- Logout

### Tenants (3)
- List Tenants (Super Admin)
- Tenant Details
- Update Tenant

### Users (4)
- Add User
- List Users
- Update User
- Delete User

### Projects (4)
- Create Project
- List Projects
- Update Project
- Delete Project

### Tasks (4)
- Create Task
- List Tasks
- Update Task
- Delete Task

---

## ✨ Highlights

- 19 working REST APIs  
- Secure multi-tenant setup  
- JWT authentication (24-hour validity)  
- Role-based permissions  
- Zod-based validation  
- Audit trail logging  
- React frontend (6 pages)  
- Dockerized environment  
- Auto database seeding  
- Complete documentation  

---

## 🐛 Common Issues

### Port Conflict
Use Task Manager (Windows) or:
```bash
netstat -ano | findstr :3000
```

### Container Startup Failure
```bash
docker-compose up -d --build
```

### Database Issues
```bash
docker-compose logs database
```

### Token Expiry
Re-login after 24 hours to refresh token.

---

## 📊 System Architecture

```
React (3000)
     ↓
Express API (5000)
     ↓
PostgreSQL (5432)
```

---

## 📁 Project Layout

```
frontend/
backend/
docs/
docker-compose.yml
README.md
submission.json
integration-test.js
```

---

## 🎯 How to Proceed

1. Run `docker-compose up -d`
2. Visit http://localhost:3000
3. Login using demo credentials
4. Explore features
5. Refer to API docs for details

---

## 📝 Notes

- PostgreSQL stores all data  
- Tokens stored in localStorage  
- Passwords secured with bcrypt  
- All requests validated  
- Audit logs enabled  
- Tenant isolation enforced  

---

🚀 **The platform is fully set up and ready to use!**
