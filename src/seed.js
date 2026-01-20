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

  console.log("Seeding...");

  /* =====================================================
     1️⃣ PLATFORM ROLE
  ===================================================== */
  const platformRole = await Role.findOneAndUpdate(
    { code: "PLATFORM_ADMIN", organizationId: null },
    { name: "Platform Admin", isSystem: true },
    { upsert: true, new: true },
  );

  /* =====================================================
     2️⃣ PLATFORM PERMISSIONS
  ===================================================== */
  const platformPerms = ["ORG_CREATE", "ORG_VIEW", "ORG_UPDATE"];

  for (const p of platformPerms) {
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

    await RolePermission.findOneAndUpdate(
      {
        roleId: platformRole._id,
        permissionId: perm._id,
      },
      { organizationId: null },
      { upsert: true },
    );
  }

  /* =====================================================
     3️⃣ PLATFORM ADMIN USER
  ===================================================== */
  let adminUser = await User.findOne({
    email: process.env.ADMIN_EMAIL,
  });

  if (!adminUser) {
    adminUser = await User.create({
      name: "Platform Admin",
      email: process.env.ADMIN_EMAIL,
      organizationId: null,
      roleId: platformRole._id,
    });
  }

  /* =====================================================
     4️⃣ PLATFORM ADMIN CREDENTIAL
  ===================================================== */
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
     6️⃣ SYSTEM PERMISSIONS (CORE PLATFORM OWNED)
  ===================================================== */

  const systemPerms = [
    // ----- Departments -----
    "DEPARTMENT_CREATE",
    "DEPARTMENT_VIEW",
    "DEPARTMENT_UPDATE",
    "DEPARTMENT_DELETE",
    "DEPARTMENT_VIEW_USERS",

    // ----- Users -----
    "USER_CREATE",
    "USER_VIEW",
    "USER_UPDATE",
    "USER_DELETE",
    "USER_MOVE_DEPARTMENT",
    "USER_TOGGLE",

    // ----- RBAC -----
    "ROLE_CREATE",
    "ROLE_UPDATE",
    "ROLE_DELETE",
    "PERMISSION_CREATE",
    "PERMISSION_UPDATE",
    "ROLE_PERMISSION_ASSIGN",

    // ----- Shifts -----
    "SHIFT_CREATE",
    "SHIFT_VIEW",
    "SHIFT_UPDATE",
    "SHIFT_DELETE",

    // 🔥 ----- Shift Requirement -----
    "SHIFT_REQ_CREATE",
    "SHIFT_REQ_VIEW",
    "SHIFT_REQ_UPDATE",
    "SHIFT_REQ_DELETE",
    "SHIFT_REQ_BULK",

    // ----- Allocation -----
    "ALLOC_VIEW",
    "ALLOC_CREATE",
    "ALLOC_UPDATE",
    "ALLOC_DELETE",
    "ALLOC_BULK",
    "ALLOC_SWAP",

    // ----- Scheduler -----
    "SCHEDULER_GENERATE",
    "SCHEDULER_PREVIEW",
    "SCHEDULER_SAVE",
  ];

  // Create SYSTEM permissions owned by platform (organizationId = null)
  for (const p of systemPerms) {
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

  // Load all system permissions
  const allSystem = await Permission.find({
    scope: "SYSTEM",
  });

  /* =====================================================
     7️⃣ MAP SYSTEM PERMISSIONS TO TENANT ADMIN
  ===================================================== */
  for (const perm of allSystem) {
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
     8️⃣ HYBRID: PLATFORM ADMIN GETS ALL SYSTEM PERMS
  ===================================================== */
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

  console.log("Seed done ✅");
  process.exit();
};

seed();
