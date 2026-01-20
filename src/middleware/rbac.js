import Permission from "../modules/permissions/permission.model.js";
import RolePermission from "../modules/roles/rolePermission.model.js";
import ApiError from "../utils/ApiError.js";

export const check = (code) => async (req, res, next) => {
  try {
    // find permission either platform or tenant
    const perm = await Permission.findOne({
      code,
      $or: [
        { organizationId: req.user.organizationId },
        { organizationId: null },
      ],
    });

    if (!perm) {
      throw new ApiError("Permission not defined", 403);
    }

    const has = await RolePermission.findOne({
      roleId: req.user.roleId,
      permissionId: perm._id,
    });

    if (!has) {
      throw new ApiError("Access denied", 403);
    }

    next();
  } catch (err) {
    next(err);
  }
};
