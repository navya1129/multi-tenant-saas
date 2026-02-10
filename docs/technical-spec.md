# Technical Specification
## Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. Project Structure

This project follows a clear separation of concerns between backend, frontend, documentation, and infrastructure configuration.

### Root Directory Structure

```
project-root/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
└── README.md
└── submission.json
```

---

### Backend Structure

```
backend/
├── src/
│ ├── controllers/
│ ├── routes/
│ ├── models/
│ ├── middleware/
│ ├── services/
│ ├── utils/
│ ├── config/
│ ├── scripts/
│ ├── app.js
│ └── server.js
├── migrations/
└── .env
├── Dockerfile
└── package.json
```

**Folder Descriptions:**

- **controllers/**  
  Handles incoming HTTP requests and returns responses.

- **routes/**  
  Defines API endpoints and maps them to controllers.

- **models/**  
  Contains database models and schema definitions.

- **middleware/**  
  Includes authentication, authorization, and tenant isolation middleware.

- **services/**  
  Contains business logic separated from controllers.

- **utils/**  
  Helper functions and shared utilities.

- **config/**  
  Environment configuration and database connection setup.

- **migrations/**  
  Database migration and seed files.

- **tests/**  
  Unit and integration tests for backend APIs.

---

### Frontend Structure

```
frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── api/
│ ├── auth/
│ ├── utils/
│ ├── App.jsx
│ └── main.jsx
│ └── styles.css
├── .env
├── Dockerfile
└── package.json
└── vite.config.js
```

**Folder Descriptions:**

- **components/**  
  Reusable UI components.

- **pages/**  
  Page-level components such as Login, Dashboard, Projects, and Users.

- **routes/**  
  Route definitions and protected route handling.

- **services/**  
  API service functions for communicating with the backend.

- **context/**  
  Global state management (authentication, user session).

- **hooks/**  
  Custom React hooks.

- **styles/**  
  Global and component-specific styling.

---

## 2. Development Setup Guide

### 2.1 Prerequisites

Ensure the following tools are installed:

- Node.js v18 or higher
- Docker
- Docker Compose
- Git

---

### 2.2 Environment Variables

All environment variables are defined using a `.env` file or directly inside `docker-compose.yml`.

**Backend Environment Variables:**

```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgres://postgres:postgres@database:5432/saas_db
JWT_SECRET=supersecretjwtkey
JWT_EXPIRES_IN=24h
```

**Frontend Environment Variables:**

```
VITE_API_URL=http://localhost:5000/api
```

---

### 2.3 Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/SRINIJA-PULLIPUDI/Multi-Tenant-SaaS-Platform-with-Project-and-Task-Management-System.git
```

2. Navigate to the project root:
```bash
cd Multi-Tenant-SaaS-Platform-with-Project-and-Task-Management-System
```

3. Build and start all services using Docker:
```bash
docker-compose up -d
```

---

### 2.4 Running the Application Locally

Once Docker containers are running:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check Endpoint: http://localhost:5000/api/health

Database migrations and seed data are automatically executed on container startup.