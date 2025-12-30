# Platform Technical Architecture

## Technology Stack
- Application Layer: Node.js 18.x, Express framework, TypeScript, Prisma ORM, Zod validation, JWT auth, bcryptjs encryption.
- Client Layer: React 18.x, Vite build tool, React Router, fetch-based API integration.
- Data Layer: PostgreSQL 15.x.
- Containerization: Docker Engine + Docker Compose orchestration.

## Repository Structure (primary paths)
- backend/
	- src/index.ts (Express application initialization)
	- src/controllers/*.ts (authentication, tenants, users, projects, tasks)
	- src/middleware/auth.ts (JWT verification + RBAC enforcement)
	- src/routes/*.ts (endpoint routing)
	- src/utils/{jwt,audit}.ts (utilities)
	- src/prisma.ts (ORM client)
	- prisma/schema.prisma, prisma/seed.js (schema and data)
- frontend/
	- src/main.jsx, src/App.jsx (routing configuration)
	- src/context/AuthContext.jsx (authentication state)
	- src/components/ProtectedRoute.jsx (route guards)
	- src/services/api.js (API client)
	- src/pages/*.jsx (Authentication, Registration, Dashboard, Users, Projects, Tasks)
- docs/ (API reference, PRD, research, architecture, specifications)
- docker-compose.yml (service orchestration: db, backend, frontend)
- integration-test.js (end-to-end API validation)

## Configuration Variables
- Backend environment (.env):
	- DATABASE_URL=postgresql://postgres:postgres@database:5432/saas_db
	- JWT_SECRET=<cryptographically-secure-32+char-string>
	- JWT_EXPIRES_IN=24h
	- PORT=5000
	- FRONTEND_URL=http://frontend:3000
- Frontend environment:
	- VITE_API_URL=http://backend:5000/api

## Local Development (non-containerized)
1) Launch PostgreSQL (port 5432) and configure DATABASE_URL.
2) Backend: `cd backend && npm install && npx prisma migrate deploy && npx prisma db seed && npm run dev`.
3) Frontend: `cd frontend && npm install && npm run dev` (references VITE_API_URL).

## Container Orchestration
1) `docker-compose up -d`
2) Verify health: backend endpoint /api/health, frontend port :3000.
3) Shutdown: `docker-compose down` (append `-v` to purge volumes).

## Quality Assurance
- Integration testing: execute `node integration-test.js` from root (requires active services).
- Unit testing (backend): `cd backend && npm test`.

## API Architecture Notes
- Authentication routes: /api/auth/register-tenant, /login, /me, /logout.
- RBAC via middleware; tenant filtering on data endpoints; platform admin operates with tenantId=null.
- Uniform response structure: { success, message?, data? } with semantic HTTP codes.

## Production Deployment Considerations
- Secure environment variable injection; strong JWT_SECRET; TLS/HTTPS enablement; CORS allowlist.
- Schema migrations on deployment: `npx prisma migrate deploy`.
- Client build process: `npm run build` (frontend) with static asset serving (Dockerfile configured).
