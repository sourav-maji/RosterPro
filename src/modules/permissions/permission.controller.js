import Permission from "./permission.model.js";
import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";

/* CREATE – Tenant can create only BUSINESS permissions */
export const createPermission = async (req, res, next) => {
  try {
    if (!req.user.organizationId) {
      throw new ApiError(
        "Platform cannot create tenant business permission here",
        400,
      );
    }

    const perm = await Permission.create({
      name: req.body.name,
      code: req.body.code,
      module: req.body.module,

      // FORCE BUSINESS TYPE
      scope: "BUSINESS",
      isSystem: false,

      organizationId: req.user.organizationId,
    });

    return ok(res, perm, "Permission created");
  } catch (err) {
    next(err);
  }
};

/* LIST – show system + tenant business */
export const listPermission = async (req, res, next) => {
  try {
    const data = await Permission.find({
      $or: [
        { organizationId: req.user.organizationId },
        { organizationId: null }, // system permissions
      ],
    });

    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

/* UPDATE – block system permissions */
export const updatePermission = async (req, res, next) => {
  try {
    const perm = await Permission.findById(req.params.id);

    if (!perm) throw new ApiError("Permission not found", 404);

    // 🔒 SYSTEM GUARD
    if (perm.isSystem || perm.scope === "SYSTEM") {
      throw new ApiError("System permission cannot be modified", 403);
    }

    if (String(perm.organizationId) !== String(req.user.organizationId)) {
      throw new ApiError("Not allowed", 403);
    }

    perm.name = req.body.name ?? perm.name;
    perm.module = req.body.module ?? perm.module;

    await perm.save();

    return ok(res, perm, "Permission updated");
  } catch (err) {
    next(err);
  }
};
