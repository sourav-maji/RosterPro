# 🧠 SmartShift – Intelligent Workforce Scheduling Platform (V1)

SmartShift is a **multi-tenant, role-based workforce scheduling platform** designed for hospitals, factories, and shift-driven organizations.  
It combines **rule-based configuration** with a **constraint-optimization (ML) scheduler** to generate realistic weekly rosters.

---

## 🚀 Key Features (V1)

### 🏢 Multi-Tenant Architecture
- Platform Admin & Tenant isolation
- Each organization has its own data, users, roles, and schedules

### 🔐 Enterprise-Grade RBAC
- Role-based access control (RBAC)
- System permissions + tenant-level permissions
- Platform Admin has safe **god-mode**
- Permissions enforced at **every API**

### 🧩 Core Modules
- Organization management
- Departments
- Users & Roles
- Shifts
- Shift Requirements (date-effective)
- Allocations (manual + ML)
- Scheduler (preview + save)

### 🤖 ML-Powered Scheduling (Python Service)
- Weekly schedule generation
- Partial solutions allowed
- Hard constraints enforced
- Soft constraints minimized
- Designed for real-world feasibility

---

## 🧱 Architecture Overview

┌──────────────┐ HTTP ┌────────────────────────┐
│ Node.js API │ ───────────────▶ │ Python Scheduler (OR-Tools) │
│ (Express) │ │ FastAPI + CP-SAT Solver │
└──────────────┘ └────────────────────────┘
│
▼
MongoDB


- **Node.js** → Business logic, RBAC, persistence
- **Python** → Scheduling optimization (OR-Tools)
- **MongoDB** → Multi-tenant data store

---

## 🛠 Tech Stack

### Backend (Core API)
- Node.js (ESM)
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- RBAC Middleware
- Swagger (OpenAPI)

### Scheduler Service
- Python 3
- FastAPI
- Google OR-Tools (CP-SAT)
- Constraint optimization (no GenAI dependency)

---

## 🔐 Authentication Flow

- JWT access + refresh tokens
- Secure token rotation
- Service-to-service auth via API key
- Platform Admin ≠ Tenant Admin (strict separation)

---

## 🧠 Scheduling Logic (V1)

### Hard Constraints
- One shift per user per day
- Role-based coverage
- Max shifts per week
- Max weekly hours

### Soft Constraints
- Minimize unmet coverage
- Balance assignments where possible

### Supported
- Weekly generation
- Partial schedules allowed
- Manual override supported

### Not in V1 (by design)
- Leave / unavailability module
- Consecutive night rules
- Staff self-service
- Swap approval workflow

---

## 📦 API Modules

| Module | Description |
|------|------------|
| Auth | Login, refresh, permissions |
| Org | Organization onboarding |
| Users | Staff management |
| Roles & Permissions | RBAC |
| Departments | Logical grouping |
| Shifts | Shift definitions |
| Shift Requirements | Coverage rules |
| Scheduler | ML preview & save |
| Allocation | Final schedules |

---

## 🔄 Core User Flow (V1)

1. Platform Admin creates organization
2. Tenant Admin configures:
   - Departments
   - Users
   - Roles
   - Shifts
   - Shift requirements
3. Scheduler preview generated (ML)
4. Optional manual adjustments
5. Schedule committed to allocation
6. Users view board / calendar

---

## 📂 Repository Structure



- **Node.js** → Business logic, RBAC, persistence
- **Python** → Scheduling optimization (OR-Tools)
- **MongoDB** → Multi-tenant data store

---

## 🛠 Tech Stack

### Backend (Core API)
- Node.js (ESM)
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- RBAC Middleware
- Swagger (OpenAPI)

### Scheduler Service
- Python 3
- FastAPI
- Google OR-Tools (CP-SAT)
- Constraint optimization (no GenAI dependency)

---

## 🔐 Authentication Flow

- JWT access + refresh tokens
- Secure token rotation
- Service-to-service auth via API key
- Platform Admin ≠ Tenant Admin (strict separation)

---

## 🧠 Scheduling Logic (V1)

### Hard Constraints
- One shift per user per day
- Role-based coverage
- Max shifts per week
- Max weekly hours

### Soft Constraints
- Minimize unmet coverage
- Balance assignments where possible

### Supported
- Weekly generation
- Partial schedules allowed
- Manual override supported

### Not in V1 (by design)
- Leave / unavailability module
- Consecutive night rules
- Staff self-service
- Swap approval workflow

---

## 📦 API Modules

| Module | Description |
|------|------------|
| Auth | Login, refresh, permissions |
| Org | Organization onboarding |
| Users | Staff management |
| Roles & Permissions | RBAC |
| Departments | Logical grouping |
| Shifts | Shift definitions |
| Shift Requirements | Coverage rules |
| Scheduler | ML preview & save |
| Allocation | Final schedules |

---

## 🔄 Core User Flow (V1)

1. Platform Admin creates organization
2. Tenant Admin configures:
   - Departments
   - Users
   - Roles
   - Shifts
   - Shift requirements
3. Scheduler preview generated (ML)
4. Optional manual adjustments
5. Schedule committed to allocation
6. Users view board / calendar

---

## 📂 Repository Structure

/src
├── config
├── middleware
├── modules
│ ├── auth
│ ├── org
│ ├── users
│ ├── roles
│ ├── permissions
│ ├── departments
│ ├── shifts
│ ├── shiftReq
│ ├── alloc
│ └── scheduler
└── utils




---

## ▶️ Running Locally

### Backend API
```
npm install
npm run dev
```

📄 API Documentation
Swagger UI available at:

```bash
http://localhost:3000/docs
```
## 🧪 Current Status

- ✅ Production-ready V1
- ✅ Real scheduling engine
- ✅ Clean upgrade path to V2


## 🛣 Roadmap (V2 Ideas)

- Leave / unavailability module

- Consecutive night rules

- Fairness & rotation

- Swap approval workflow

- Staff self-service portal

- Historical analytics


## 🧑‍💻 Author

Sourav Maji

Senior Software Engineer

Automation | Backend | System Design