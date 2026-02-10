# Multi-Tenant SaaS Platform – Project & Task Management System

---

## 1. Multi-Tenancy Analysis

Multi-tenancy is a core architectural concept in Software-as-a-Service (SaaS) applications where a single instance of an application serves multiple customers, known as tenants. Each tenant represents an independent organization with isolated data, users, and configuration. Designing an effective multi-tenant architecture requires balancing data isolation, scalability, cost efficiency, and operational complexity. This section analyzes three common multi-tenancy approaches and justifies the chosen approach for this project.

---

### 1.1 Shared Database with Shared Schema (Using `tenant_id`)

In the shared database and shared schema approach, all tenants share the same database and the same set of tables. Each table contains a `tenant_id` column that associates every record with a specific tenant. Application logic ensures that all queries filter data based on the authenticated tenant’s `tenant_id`.

For example, a query to retrieve projects would explicitly include a condition such as `WHERE tenant_id = ?`. This ensures that tenants only access their own data.

**Advantages:**
- Cost-efficient, as only one database instance is required
- Simple to provision new tenants without database setup
- Easier to scale horizontally as tenant count grows
- Straightforward to containerize and deploy using Docker
- Well-suited for early-stage and mid-scale SaaS platforms

**Disadvantages:**
- Risk of data leakage if tenant filtering is incorrectly implemented
- Requires strict coding discipline and consistent use of middleware
- Authorization logic becomes more complex

Despite these challenges, this approach is widely used in modern SaaS applications due to its simplicity and scalability when implemented correctly.

---

### 1.2 Shared Database with Separate Schema (Per Tenant)

In this approach, tenants share the same database server, but each tenant has its own database schema. For example, one tenant’s data may reside in `tenant_a.users`, while another tenant’s data resides in `tenant_b.users`.

**Advantages:**
- Stronger logical isolation compared to shared schema
- Reduced risk of accidental cross-tenant data access
- Easier tenant-specific data cleanup or migration

**Disadvantages:**
- Increased complexity in schema management
- Database migrations must be applied across multiple schemas
- Higher operational overhead as tenant count increases
- More complex automation and deployment processes

While this approach improves isolation, it introduces additional maintenance complexity that may not be justified for smaller SaaS platforms.

---

### 1.3 Separate Database per Tenant

The separate database per tenant approach provides each tenant with an entirely independent database instance. This offers the highest level of data isolation.

**Advantages:**
- Maximum security and data isolation
- Easier compliance with strict regulatory requirements
- Independent performance tuning per tenant

**Disadvantages:**
- High infrastructure and operational cost
- Difficult to scale with many tenants
- Complex monitoring, backups, and migrations
- Poor fit for automated Docker-based environments

This approach is typically used for large enterprise customers or highly regulated environments but is unsuitable for most general-purpose SaaS products.

---

### 1.4 Comparison Table

| Approach | Data Isolation | Cost | Scalability | Operational Complexity |
|--------|---------------|------|-------------|------------------------|
| Shared DB + Shared Schema | Medium | Low | High | Medium |
| Shared DB + Separate Schema | High | Medium | Medium | High |
| Separate DB per Tenant | Very High | High | Low | Very High |

---

### 1.5 Chosen Approach and Justification

**Chosen Approach:** Shared Database with Shared Schema using a `tenant_id` column.

This approach was selected because it best aligns with the project requirements and constraints. The project explicitly mandates tenant identification via `tenant_id`, indexing on tenant-related columns, and Docker-based deployment. A shared schema approach simplifies database management, allows easy onboarding of new tenants, and ensures efficient resource utilization.

Additionally, the project enforces strict API-level authorization and role-based access control (RBAC), which mitigates the primary risk associated with shared schemas. This architecture is widely adopted in production SaaS systems and provides the best balance between scalability, simplicity, and cost-effectiveness for this application.

---

## 2. Technology Stack Justification

Selecting the appropriate technology stack is critical to build a scalable, maintainable, and secure multi-tenant SaaS platform. The following technologies were chosen based on project requirements.

---

### Backend Framework: Node.js with Express

Node.js with the Express framework was selected for backend development due to its lightweight nature, high performance for I/O-bound applications, and large ecosystem. Express enables rapid development of RESTful APIs and integrates well with middleware-based authentication and authorization mechanisms.

**Alternatives Considered:**  
- Django (Python)  
- Spring Boot (Java)

While these alternatives provide strong features, Node.js was preferred due to its simplicity, asynchronous model, and seamless integration with JavaScript-based frontend development.

---

### Frontend Framework: React

React was chosen for the frontend because of its component-based architecture, efficient rendering through the virtual DOM, and widespread industry adoption. React enables the creation of responsive and dynamic user interfaces and integrates well with modern authentication patterns such as JWT-based APIs.

**Alternatives Considered:**  
- Angular  
- Vue.js

React was selected due to its flexibility, community support, and suitability for building role-based user interfaces.

---

### Database: PostgreSQL

PostgreSQL was selected as the relational database management system due to its ACID compliance, strong support for relational integrity, advanced indexing capabilities, and reliability. PostgreSQL performs well for multi-tenant systems when combined with indexed `tenant_id` columns.

**Alternatives Considered:**  
- MySQL  
- MongoDB

PostgreSQL was preferred for its robust relational features and better support for complex queries and constraints.

---

### Authentication Method: JWT (JSON Web Tokens)

JWT-based authentication was chosen for its stateless nature and scalability. JWTs allow the backend to authenticate requests without storing session data, making them ideal for distributed systems and Docker-based deployments.

**Alternatives Considered:**  
- Session-based authentication  
- OAuth-only authentication

JWTs provide a simpler and more scalable solution for this project’s requirements.

---

### Deployment Platform: Docker & Docker Compose

Docker was selected to containerize the database, backend, and frontend services, ensuring consistent environments across development and evaluation. Docker Compose enables one-command deployment and simplifies inter-service communication.

**Alternatives Considered:**  
- Virtual machines  
- Platform-as-a-Service (PaaS)

Docker was chosen to meet the project’s mandatory containerization requirements.

---

## 3. Security Considerations

Security is a critical aspect of any multi-tenant SaaS platform. This system incorporates multiple layers of security to protect tenant data and system integrity.

---

### 3.1 Security Measures

1. Strict tenant-based data filtering using `tenant_id`
2. JWT-based authentication with token expiration
3. Role-based access control (RBAC)
4. Secure password hashing
5. API input validation and error handling

---

### 3.2 Data Isolation Strategy

Data isolation is enforced at the application layer by ensuring every database query includes a `tenant_id` filter. Middleware extracts the tenant information from the authenticated JWT and injects it into request processing. Super admin users are explicitly handled as exceptions with a null tenant context.

---

### 3.3 Authentication and Authorization

Authentication is handled using JWTs issued upon successful login. Authorization is enforced through middleware that checks user roles before allowing access to protected endpoints. Different roles such as Super Admin, Tenant Admin, and User have distinct permission levels.

---

### 3.4 Password Hashing Strategy

All user passwords are securely hashed using industry-standard hashing algorithms such as bcrypt. Salting is applied automatically to prevent rainbow table attacks, and plaintext passwords are never stored in the database.

---

### 3.5 API Security Measures

API security measures include enforcing HTTPS communication, configuring CORS to allow only trusted frontend origins, validating all incoming requests, and returning appropriate HTTP status codes. Audit logs are maintained to track sensitive actions and improve traceability.
