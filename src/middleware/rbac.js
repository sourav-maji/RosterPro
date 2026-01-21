import Role from "../modules/roles/role.model.js";
import RolePermission from "../modules/roles/rolePermission.model.js";
import Permission from "../modules/permissions/permission.model.js";
import ApiError from "../utils/ApiError.js";

/**
 * RBAC Middleware
 * check("USER_CREATE")
 */
export const check = (permissionCode) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        throw new ApiError("Unauthorized", 401);
      }
      // Prevent tenant from touching system metadata
      if (
        user.roleCode !== "PLATFORM_ADMIN" &&
        ["PERMISSION_CREATE", "PERMISSION_UPDATE", "ROLE_DELETE"].includes(
          permissionCode,
        )
      ) {
        throw new ApiError("System metadata protected", 403);
      }
      // --------------------------------------------------
      // 🔥 PLATFORM BYPASS – GOD MODE
      // --------------------------------------------------
      if (
        user.roleCode === "PLATFORM_ADMIN" ||
        user.role?.code === "PLATFORM_ADMIN"
      ) {
        return next();
      }

      // --------------------------------------------------
      // Normal Tenant Flow
      // --------------------------------------------------

      const perm = await Permission.findOne({
        code: permissionCode,
      });

      if (!perm) {
        throw new ApiError("Permission not defined", 500);
      }

      const has = await RolePermission.findOne({
        roleId: user.roleId,
        permissionId: perm._id,
        organizationId: user.organizationId,
      });

      if (!has) {
        throw new ApiError("Access denied", 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
