import "dotenv/config";
import bcrypt from "bcryptjs";
import connect from "./config/db.js";

import Organization from "./modules/org/org.model.js";
import User from "./modules/users/user.model.js";
import AuthAccount from "./modules/auth/authAccount.model.js";

import Role from "./modules/roles/role.model.js";
import Permission from "./modules/permissions/permission.model.js";
import RolePermission from "./modules/roles/rolePermission.model.js";

const seed = async () => {
  await connect();
  console.log("Seeding SAFE GOD-MODE setup...");

  /* =====================================================
     1️⃣ PLATFORM ROLE (GOD MODE)
  ===================================================== */
  const platformRole = await Role.findOneAndUpdate(
    { code: "PLATFORM_ADMIN", organizationId: null },
    { name: "Platform Admin", isSystem: true },
    { upsert: true, new: true },
  );

  /* =====================================================
     2️⃣ PLATFORM-ONLY PERMISSIONS
     (only platform should have these)
  ===================================================== */
  const platformOnlyPerms = [
    "ORG_CREATE",
    "ORG_UPDATE",
    "ORG_LIST",
    "ORG_VIEW",

    "TENANT_ONBOARD",
    "TENANT_SUSPEND",

    "AUDIT_VIEW",
    "SYSTEM_CONFIG",
    "TENANT_IMPERSONATE",
  ];

  for (const p of platformOnlyPerms) {
    const perm = await Permission.findOneAndUpdate(
      { code: p, organizationId: null },
      {
        name: p,
        module: "PLATFORM",
        scope: "SYSTEM",
        isSystem: true,
      },
      { upsert: true, new: true },
    );

    // Give ONLY to platform role
    await RolePermission.findOneAndUpdate(
      { roleId: platformRole._id, permissionId: perm._id },
      { organizationId: null },
      { upsert: true },
    );
  }

  /* =====================================================
     3️⃣ CORE TENANT PERMISSIONS
     (safe for tenant admins)
  ===================================================== */
  const tenantPerms = [
    // ---- Departments ----
    "DEPARTMENT_CREATE",
    "DEPARTMENT_VIEW",
    "DEPARTMENT_UPDATE",
    "DEPARTMENT_DELETE",
    "DEPARTMENT_VIEW_USERS",

    // ---- Users ----
    "USER_CREATE",
    "USER_VIEW",
    "USER_UPDATE",
    "USER_DELETE",
    "USER_MOVE_DEPARTMENT",
    "USER_TOGGLE",

    // ---- RBAC (limited) ----
    "ROLE_CREATE",
    "ROLE_UPDATE", // tenant roles only (enforced in code)
    "ROLE_PERMISSION_ASSIGN",

    // ---- Shifts ----
    "SHIFT_CREATE",
    "SHIFT_VIEW",
    "SHIFT_UPDATE",
    "SHIFT_DELETE",

    // ---- Shift Requirement ----
    "SHIFT_REQ_CREATE",
    "SHIFT_REQ_VIEW",
    "SHIFT_REQ_UPDATE",
    "SHIFT_REQ_DELETE",
    "SHIFT_REQ_BULK",

    // ---- Allocation ----
    "ALLOC_VIEW",
    "ALLOC_CREATE",
    "ALLOC_UPDATE",
    "ALLOC_DELETE",
    "ALLOC_BULK",
    "ALLOC_SWAP",

    // extra endpoints
    "ALLOC_BOARD",
    "ALLOC_CALENDAR",
    "ALLOC_COVERAGE",

    // ---- Scheduler ----
    "SCHEDULER_GENERATE",
    "SCHEDULER_PREVIEW",
    "SCHEDULER_SAVE",
  ];

  for (const p of tenantPerms) {
    await Permission.findOneAndUpdate(
      { code: p, organizationId: null },
      {
        name: p,
        module: "CORE",
        scope: "SYSTEM",
        isSystem: true,
      },
      { upsert: true, new: true },
    );
  }

  /* =====================================================
     4️⃣ PLATFORM ADMIN USER (org = null allowed)
  ===================================================== */
  let adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

  if (!adminUser) {
    adminUser = await User.create({
      name: "Platform Admin",
      email: process.env.ADMIN_EMAIL,
      organizationId: null,
      roleId: platformRole._id,
    });
  }

  let acc = await AuthAccount.findOne({
    identifier: process.env.ADMIN_EMAIL,
  });

  if (!acc) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await AuthAccount.create({
      userId: adminUser._id,
      identifier: process.env.ADMIN_EMAIL,
      passwordHash: hash,
    });
  }

  /* =====================================================
     5️⃣ SAMPLE TENANT + TENANT ADMIN
  ===================================================== */
  let org = await Organization.findOne({
    contactEmail: "tenant@demo.com",
  });

  if (!org) {
    org = await Organization.create({
      name: "Demo Hospital",
      contactEmail: "tenant@demo.com",
      type: "HOSPITAL",
    });
  }

  const tenantRole = await Role.findOneAndUpdate(
    { code: "TENANT_ADMIN", organizationId: org._id },
    { name: "Tenant Admin", isSystem: true },
    { upsert: true, new: true },
  );

  let tenantUser = await User.findOne({
    email: "tenant@demo.com",
  });

  if (!tenantUser) {
    tenantUser = await User.create({
      name: "Tenant Admin",
      email: "tenant@demo.com",
      organizationId: org._id,
      roleId: tenantRole._id,
    });
  }

  /* =====================================================
     6️⃣ MAP TENANT PERMISSIONS TO TENANT ADMIN
  ===================================================== */
  const tenantSystem = await Permission.find({
    code: { $in: tenantPerms },
  });

  for (const perm of tenantSystem) {
    await RolePermission.findOneAndUpdate(
      {
        roleId: tenantRole._id,
        permissionId: perm._id,
      },
      { organizationId: org._id },
      { upsert: true },
    );
  }

  /* =====================================================
     7️⃣ PLATFORM GETS ABSOLUTE GOD MODE
  ===================================================== */
  const allSystem = await Permission.find({ scope: "SYSTEM" });

  for (const perm of allSystem) {
    await RolePermission.findOneAndUpdate(
      {
        roleId: platformRole._id,
        permissionId: perm._id,
      },
      { organizationId: null },
      { upsert: true },
    );
  }

  console.log("Seed done ✅ SAFE GOD MODE ACTIVE");
  process.exit();
};

seed();
