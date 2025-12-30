
# Platform Technical Architecture

## Technology Stack Overview

- **Application Layer:** Built using Node.js 18.x with the Express framework and TypeScript. Prisma ORM handles database access, Zod is used for input validation, JWT manages authentication, and bcryptjs secures password hashing.
- **Client Layer:** Developed with React 18.x and bundled using Vite. React Router manages navigation, and API communication is handled through fetch-based services.
- **Data Layer:** PostgreSQL 15.x serves as the primary relational database.
- **Containerization:** Docker Engine and Docker Compose orchestrate all services for consistent environments.

---

## Repository Structure (Key Directories)

```
backend/
 ├── src/
 │   ├── index.ts              # Express app bootstrap
 │   ├── controllers/          # Auth, tenants, users, projects, tasks
 │   ├── middleware/auth.ts    # JWT validation & RBAC logic
 │   ├── routes/               # API route definitions
 │   ├── utils/                # JWT & audit utilities
 │   ├── prisma.ts             # Prisma client instance
 ├── prisma/
 │   ├── schema.prisma         # Database schema
 │   └── seed.js               # Seed data
frontend/
 ├── src/
 │   ├── main.jsx              # Application entry point
 │   ├── App.jsx               # Route configuration
 │   ├── context/              # Authentication context
 │   ├── components/           # Protected routes
 │   ├── services/api.js       # API client
 │   └── pages/                # Auth, dashboard, users, projects, tasks
docs/                           # API docs, PRD, research, architecture
docker-compose.yml              # Service orchestration
integration-test.js             # End-to-end API tests
```

---

## Configuration Settings

### Backend Environment Variables
```
DATABASE_URL=postgresql://postgres:postgres@database:5432/saas_db
JWT_SECRET=<secure-32+character-secret>
JWT_EXPIRES_IN=24h
PORT=5000
FRONTEND_URL=http://frontend:3000
```

### Frontend Environment Variables
```
VITE_API_URL=http://backend:5000/api
```

---

## Local Development (Without Docker)

1. Start a PostgreSQL instance on port 5432 and configure the `DATABASE_URL`.
2. Launch the backend:
   ```bash
   cd backend
   npm install
   npx prisma migrate deploy
   npx prisma db seed
   npm run dev
   ```
3. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Ensure `VITE_API_URL` points to the backend.

---

## Containerized Execution

1. Start all services:
   ```bash
   docker-compose up -d
   ```
2. Confirm service health:
   - Backend: `/api/health`
   - Frontend: `http://localhost:3000`
3. Stop services:
   ```bash
   docker-compose down
   ```
   Use `-v` to remove persistent volumes.

---

## Quality Assurance

- **Integration Testing:**  
  Run `node integration-test.js` from the project root while services are active.

- **Backend Unit Tests:**  
  ```bash
  cd backend
  npm test
  ```

---

## API Architecture Notes

- Authentication endpoints include tenant registration, login, profile access, and logout.
- RBAC is enforced via middleware, with tenant-level filtering on all data operations.
- Platform administrators operate without tenant binding (`tenantId = null`).
- API responses follow a consistent structure:
  ```json
  { "success": true, "message": "...", "data": {} }
  ```

---

## Production Deployment Considerations

- Inject environment variables securely and use a strong JWT secret.
- Enable HTTPS/TLS and restrict CORS to approved origins.
- Apply database migrations during deployment using:
  ```bash
  npx prisma migrate deploy
  ```
- Build the frontend for production:
  ```bash
  npm run build
  ```
  Static assets are served via the configured Dockerfile.

---

This technical architecture provides a scalable, secure, and maintainable foundation for deploying and operating the multi-tenant SaaS platform in both development and production environments.
