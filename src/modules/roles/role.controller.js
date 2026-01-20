import Role from "./role.model.js";
import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";

/**
 * CREATE ROLE (Tenant)
 */
export const createRole = async (req, res, next) => {
  try {
    if (!req.user.organizationId) {
      throw new ApiError("Platform cannot create tenant roles here", 400);
    }

    const role = await Role.create({
      name: req.body.name,
      code: req.body.code,
      organizationId: req.user.organizationId,
    });

    return ok(res, role, "Role created");
  } catch (err) {
    next(err);
  }
};

/**
 * LIST ROLES (tenant + platform)
 */
export const listRole = async (req, res, next) => {
  try {
    const roles = await Role.find({
      $or: [
        { organizationId: req.user.organizationId },
        { organizationId: null },
      ],
    });

    return ok(res, roles);
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE ROLE
 */
export const updateRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) throw new ApiError("Role not found", 404);

    if (!role.organizationId) {
      throw new ApiError("Cannot modify platform role", 403);
    }

    if (String(role.organizationId) !== String(req.user.organizationId)) {
      throw new ApiError("Not allowed", 403);
    }

    role.name = req.body.name ?? role.name;
    role.code = req.body.code ?? role.code;

    await role.save();

    return ok(res, role, "Role updated");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE ROLE
 */
export const deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) throw new ApiError("Role not found", 404);

    if (!role.organizationId) {
      throw new ApiError("Cannot delete platform role", 403);
    }

    if (String(role.organizationId) !== String(req.user.organizationId)) {
      throw new ApiError("Not allowed", 403);
    }

    await role.deleteOne();

    return ok(res, null, "Role deleted");
  } catch (err) {
    next(err);
  }
};
