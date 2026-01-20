import Role from "./role.model.js";
import Permission from "../permissions/permission.model.js";
import RolePermission from "./rolePermission.model.js";
import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";

/**
 * Assign single permission
 */
export const assign = async (req, res, next) => {
  try {
    const { roleId, permissionId } = req.body;

    const role = await Role.findById(roleId);
    const perm = await Permission.findById(permissionId);

    if (!role || !perm) {
      throw new ApiError("Role or Permission not found", 404);
    }

    if (!role.organizationId) {
      throw new ApiError("Cannot modify platform role", 403);
    }

    if (
      String(role.organizationId) !== String(req.user.organizationId) ||
      String(perm.organizationId) !== String(req.user.organizationId)
    ) {
      throw new ApiError("Cross tenant mapping not allowed", 403);
    }

    const map = await RolePermission.create({
      roleId,
      permissionId,
      organizationId: req.user.organizationId,
    });

    return ok(res, map, "Assigned");
  } catch (err) {
    next(err);
  }
};

/**
 * Bulk assign (UI friendly)
 */
export const bulkAssign = async (req, res, next) => {
  try {
    const { roleId, permissionIds } = req.body;

    const role = await Role.findById(roleId);

    if (!role) throw new ApiError("Role not found", 404);

    if (String(role.organizationId) !== String(req.user.organizationId)) {
      throw new ApiError("Not allowed", 403);
    }

    await RolePermission.deleteMany({
      roleId,
      organizationId: req.user.organizationId,
    });

    const docs = permissionIds.map((pid) => ({
      roleId,
      permissionId: pid,
      organizationId: req.user.organizationId,
    }));

    await RolePermission.insertMany(docs);

    return ok(res, null, "Permissions updated");
  } catch (err) {
    next(err);
  }
};

/**
 * Remove mapping
 */
export const remove = async (req, res, next) => {
  try {
    const map = await RolePermission.findById(req.params.id);

    if (!map) throw new ApiError("Mapping not found", 404);

    if (String(map.organizationId) !== String(req.user.organizationId)) {
      throw new ApiError("Not allowed", 403);
    }

    await map.deleteOne();

    return ok(res, null, "Mapping removed");
  } catch (err) {
    next(err);
  }
};

/**
 * Get permissions of a role
 */
export const byRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.roleId);

    if (
      role.organizationId &&
      String(role.organizationId) !== String(req.user.organizationId)
    ) {
      throw new ApiError("Not allowed", 403);
    }

    const data = await RolePermission.find({
      roleId: req.params.roleId,
    }).populate("permissionId");

    return ok(res, data);
  } catch (err) {
    next(err);
  }
};
