import Organization from "./org.model.js";
import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";
import Role from "../roles/role.model.js";
import User from "../users/user.model.js";
import AuthAccount from "../auth/authAccount.model.js";
import bcrypt from "bcryptjs";

/* ======================================================
   HELPERS
====================================================== */
const isPlatform = (req) => req.user && req.user.roleCode === "PLATFORM_ADMIN";

const isOwnOrg = (req, orgId) =>
  req.user && String(req.user.organizationId) === String(orgId);

/* ======================================================
   CREATE ORG – PLATFORM ONLY (requires auth when creating with admin)
====================================================== */
export const createOrg = async (req, res, next) => {
  try {
    const { name, contactEmail, adminName, adminEmail, adminPassword } = req.body;

    const exists = await Organization.findOne({
      $or: [
        { name: name?.toLowerCase() },
        { contactEmail: contactEmail?.toLowerCase() },
      ],
    });

    if (exists) {
      throw new ApiError("Organization already exists", 400);
    }

    const org = await Organization.create({
      ...req.body,
      name: name?.toLowerCase(),
      contactEmail: contactEmail?.toLowerCase(),
      status: "ONBOARD",
      isActive: true,
      createdBy: req.user?.id || null,
    });

    // ── Bootstrap tenant admin user (optional, only when fields provided) ──
    let adminUser = null;
    if (adminName && adminEmail && adminPassword) {
      // 1. Upsert a TENANT_ADMIN role scoped to this org
      const tenantAdminRole = await Role.findOneAndUpdate(
        { code: "TENANT_ADMIN", organizationId: org._id },
        { name: "Tenant Admin", isSystem: true },
        { upsert: true, new: true },
      );

      // 2. Create the admin user
      adminUser = await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        roleId: tenantAdminRole._id,
        organizationId: org._id,
      });

      // 3. Create credentials with mustChangePassword flag
      const hash = await bcrypt.hash(adminPassword, 10);
      await AuthAccount.create({
        userId: adminUser._id,
        identifier: adminEmail.toLowerCase(),
        passwordHash: hash,
        provider: "LOCAL",
        mustChangePassword: true,
      });
    }

    return ok(res, { org, adminUser }, "Organization created");
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   LIST ORG – PLATFORM OR OWN ONLY
====================================================== */
export const listOrg = async (req, res, next) => {
  try {
    let filter = {};

    // If logged in tenant → only own
    if (req.user && !isPlatform(req)) {
      filter._id = req.user.organizationId;
    }

    const orgs = await Organization.find(filter).sort({ createdAt: -1 });

    return ok(res, orgs);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   COUNT
====================================================== */
export const countOrg = async (req, res, next) => {
  try {
    if (!isPlatform(req)) {
      throw new ApiError("Only platform can count organizations", 403);
    }

    const count = await Organization.countDocuments();

    return ok(res, { count });
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   GET BY ID
====================================================== */
export const getOrg = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isPlatform(req) && !isOwnOrg(req, id)) {
      throw new ApiError("Access denied", 403);
    }

    const org = await Organization.findById(id);

    if (!org) throw new ApiError("Organization not found", 404);

    return ok(res, org);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   UPDATE
====================================================== */
export const updateOrg = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isPlatform(req) && !isOwnOrg(req, id)) {
      throw new ApiError("Access denied", 403);
    }

    // Tenant cannot change critical fields
    if (!isPlatform(req)) {
      delete req.body.status;
      delete req.body.isActive;
    }

    const org = await Organization.findByIdAndUpdate(
      id,
      {
        ...req.body,
        updatedBy: req.user?.id || null,
      },
      { new: true, runValidators: true },
    );

    if (!org) throw new ApiError("Organization not found", 404);

    return ok(res, org, "Organization updated");
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   DELETE – PLATFORM ONLY
====================================================== */
export const deleteOrg = async (req, res, next) => {
  try {
    if (!isPlatform(req)) {
      throw new ApiError("Only platform can delete org", 403);
    }

    const org = await Organization.findByIdAndDelete(req.params.id);

    if (!org) throw new ApiError("Organization not found", 404);

    return ok(res, null, "Organization deleted");
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   MY ORG
====================================================== */
export const myOrg = async (req, res, next) => {
  try {
    if (!req.user?.organizationId) {
      throw new ApiError("No organization linked", 400);
    }

    const org = await Organization.findById(req.user.organizationId);

    if (!org) throw new ApiError("Organization not found", 404);

    return ok(res, org);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   TOGGLE ACTIVE – PLATFORM ONLY
====================================================== */
export const toggleActive = async (req, res, next) => {
  try {
    if (!isPlatform(req)) {
      throw new ApiError("Only platform can toggle", 403);
    }

    const org = await Organization.findById(req.params.id);

    if (!org) throw new ApiError("Organization not found", 404);

    org.isActive = !org.isActive;
    await org.save();

    return ok(res, org, "Status toggled");
  } catch (err) {
    next(err);
  }
};
