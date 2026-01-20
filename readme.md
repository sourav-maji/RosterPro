# RosterPro Backend

A multi-tenant shift scheduling backend designed for hospitals, factories, and generic organizations with strong RBAC, date-wise shift requirements, and foundation for ML-based allocation.

---

## 🚀 Tech Stack

- Node.js (ES6) + Express  
- MongoDB + Mongoose  
- JWT Authentication (Access + Refresh)  
- Role Based Access Control  
- Modular architecture

---

## 🧱 Architecture Overview

### Folder Structure

src/
 ├── config/
 │   └── db.js
 ├── middleware/
 │   ├── auth.js
 │   ├── rbac.js
 │   └── error.js
 ├── modules/
 │   ├── org/
 │   ├── users/
 │   ├── departments/
 │   ├── roles/
 │   ├── permissions/
 │   ├── shifts/
 │   └── shiftReq/
 ├── utils/
 │   ├── ApiError.js
 │   ├── async.js
 │   ├── jwt.js
 │   └── response.js
 └── seed.js


---

## 🔐 Security Model

### Authentication
- JWT access token + refresh token  
- Credentials stored separately (`AuthAccount`)  
- OAuth-ready design

### RBAC – Two Level Permission System

#### 1. System Permissions (Platform Owned)
Used to secure core APIs. Read-only for tenants.

Examples:
- DEPARTMENT_CREATE  
- USER_UPDATE  
- SHIFT_VIEW  
- SHIFT_REQ_BULK  

#### 2. Business Permissions (Tenant Defined)
Used for UI/workflow logic, not for API guards.

### Hybrid Access

| Role | Scope |
|-----|------|
| Platform Admin | Can manage all tenants |
| Tenant Admin | Can manage only own tenant |

---

## 🧩 Modules

### 1. Organization (Tenant Root)

Fields:
- name  
- contactEmail  
- type (HOSPITAL | FACTORY | GENERIC)  
- status / timestamps  

Managed only by Platform Admin.

---

### 2. Users

Design Principles:
- Profile separate from credentials  
- Single source of truth for department  
- Tenant isolation

Key APIs:
- CRUD  
- Toggle active  
- Change department

---

### 3. Departments

- Pure master entity  
- No user array stored  
- Users reference department

APIs:
- CRUD  
- Get users of department

---

### 4. Shifts

Defines working slots per department.

Fields:
- startTime / endTime  
- duration  
- type (NORMAL | NIGHT | OVERTIME)

APIs:
- CRUD  
- Filter by department  
- Toggle active

---

### 5. Shift Requirement 🔥

Core concept:

> Department + Shift + Role + Date Range → Required Count

#### Business Rules
- ❌ No overlapping date ranges  
- ✔ Role based only  
- ✔ Tenant isolated

#### Main Endpoints

- POST /shift-req  
- POST /shift-req/bulk  
- GET /shift-req/department/:id  
- GET /shift-req/department/:id/shift/:shiftId  
- PUT /shift-req/:id  
- DELETE /shift-req/:id  

Example Payload:

{
  "departmentId": "ICU",
  "shiftId": "MORNING",
  "roleId": "NURSE",
  "requiredCount": 3,
  "effectiveFrom": "2026-01-01",
  "effectiveTo": "2026-03-31"
}


---

## 🛡 Permissions Enforced

### Departments
- DEPARTMENT_CREATE  
- DEPARTMENT_VIEW  
- DEPARTMENT_UPDATE  
- DEPARTMENT_DELETE  

### Users
- USER_CREATE  
- USER_UPDATE  
- USER_DELETE  
- USER_MOVE_DEPARTMENT  

### Shifts
- SHIFT_CREATE  
- SHIFT_VIEW  
- SHIFT_UPDATE  
- SHIFT_DELETE  

### Shift Requirement
- SHIFT_REQ_CREATE  
- SHIFT_REQ_VIEW  
- SHIFT_REQ_UPDATE  
- SHIFT_REQ_DELETE  
- SHIFT_REQ_BULK  

---

## 🧪 Setup

### Environment

.env
ADMIN_EMAIL=admin@demo.com
ADMIN_PASSWORD=123456
JWT_SECRET=supersecret
MONGO_URL=mongodb://localhost/rosterpro


### Run

npm install
node src/seed.js
npm run dev


---

## 📌 Data Flow

1. Platform Admin  
   → onboard tenant  
   → create tenant admin  

2. Tenant Admin  
   → create departments  
   → create shifts  
   → define shift requirements  

3. Next Phase  
   → ML service will generate allocations  

---

## ✅ Current Status

- Multi-tenant foundation  
- Auth & RBAC  
- Masters (Org/Users/Departments/Shifts)  
- Date-wise Shift Requirement  
- Hybrid platform access  

**Completion: ~88% of V1 Backend**

---

## 🚧 Next Phase

- Shift Allocation module  
- Rules engine  
- Summary analytics  
- ML scheduler integration

---

## 🤝 Contribution

Follow ES6 standards, modular structure, and always protect APIs with RBAC permissions.

---

## License

Private – RosterPro
