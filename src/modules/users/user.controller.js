import User from "./user.model.js";
import Role from "../roles/role.model.js";

import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";
import Department from "../departments/department.model.js";

/* =======================================================
   CREATE USER
   - Platform admin can create tenant admin users
   - Tenant admin can create only their org users
   - Role must belong to same org (or platform for platform)
======================================================= */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, roleId, organizationId } = req.body;

    // ----- ROLE VALIDATION -----
    const role = await Role.findById(roleId);
    if (!role) {
      throw new ApiError("Role not found", 400);
    }

    // ========== PLATFORM ADMIN FLOW ==========
    if (!req.user.organizationId) {
      // platform creating user

      // if creating tenant user → organizationId must be provided
      if (organizationId) {
        if (!role.organizationId) {
          throw new ApiError("Tenant user must have tenant role", 403);
        }

        if (String(role.organizationId) !== String(organizationId)) {
          throw new ApiError("Role does not belong to given organization", 403);
        }
      } else {
        // platform user
        if (role.organizationId) {
          throw new ApiError("Platform user cannot have tenant role", 403);
        }
      }
    }

    // ========== TENANT ADMIN FLOW ==========
    if (req.user.organizationId) {
      if (!role.organizationId) {
        throw new ApiError("Cannot assign platform role to tenant user", 403);
      }

      if (String(role.organizationId) !== String(req.user.organizationId)) {
        throw new ApiError("Role does not belong to your organization", 403);
      }
    }

    // ----- DUPLICATE CHECK -----
    const exists = await User.findOne({
      email,
      organizationId: req.user?.organizationId || organizationId || null,
    });

    if (exists) {
      throw new ApiError("User with this email already exists", 400);
    }

    // ----- CREATE -----
    const user = await User.create({
      name,
      email,
      roleId,
      organizationId: req.user?.organizationId || organizationId || null,
    });

    return ok(res, user, "User created");
  } catch (err) {
    next(err);
  }
};

/* =======================================================
   LIST USERS – Tenant Scoped
======================================================= */
export const listUsers = async (req, res, next) => {
  try {
    const { search } = req.query;

    const filter = {
      organizationId: req.user?.organizationId || null,
    };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    return ok(res, users);
  } catch (err) {
    next(err);
  }
};

/* =======================================================
   GET BY ID
======================================================= */
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId || null,
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return ok(res, user);
  } catch (err) {
    next(err);
  }
};

/* =======================================================
   UPDATE USER
======================================================= */
export const updateUser = async (req, res, next) => {
  try {
    const { roleId } = req.body;

    // ----- ROLE CHANGE VALIDATION -----
    if (roleId) {
      const role = await Role.findById(roleId);
      if (!role) throw new ApiError("Role not found", 400);

      // Platform updating user
      if (!req.user.organizationId) {
        if (role.organizationId) {
          throw new ApiError("Platform can assign only platform roles", 403);
        }
      }

      // Tenant updating user
      if (req.user.organizationId) {
        if (!role.organizationId)
          throw new ApiError("Cannot assign platform role", 403);

        if (String(role.organizationId) !== String(req.user.organizationId))
          throw new ApiError("Role does not belong to your organization", 403);
      }
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.user?.organizationId || null,
      },
      req.body,
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return ok(res, user, "User updated");
  } catch (err) {
    next(err);
  }
};

/* =======================================================
   DELETE USER
======================================================= */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user?.organizationId || null,
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return ok(res, null, "User deleted");
  } catch (err) {
    next(err);
  }
};

/* =======================================================
   COUNT USERS
======================================================= */
export const countUsers = async (req, res, next) => {
  try {
    const count = await User.countDocuments({
      organizationId: req.user?.organizationId || null,
    });

    return ok(res, { count });
  } catch (err) {
    next(err);
  }
};

/* =======================================================
   TOGGLE ACTIVE
======================================================= */
export const toggleUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId || null,
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    return ok(res, user, "User status updated");
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   CHANGE USER DEPARTMENT
=================================================== */
export const changeDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.body;

    const dep = await Department.findOne({
      _id: departmentId,
      organizationId: req.user.organizationId,
    });

    if (!dep) {
      throw new ApiError("Invalid department", 400);
    }

    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.user.organizationId,
      },
      { departmentId },
      { new: true }
    );

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return ok(res, user, "Department updated");
  } catch (err) {
    next(err);
  }
};
