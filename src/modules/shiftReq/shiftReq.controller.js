import ShiftRequirement from "./shiftReq.model.js";
import Department from "../departments/department.model.js";
import Shift from "../shifts/shift.model.js";
import Role from "../roles/role.model.js";

import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";

/* --------------------------------------------------
   HELPER: CHECK OVERLAP (STRICT)
-------------------------------------------------- */
const checkOverlap = async ({
  organizationId,
  departmentId,
  shiftId,
  roleId,
  from,
  to,
  excludeId = null,
}) => {
  const query = {
    organizationId,
    departmentId,
    shiftId,
    roleId,
    _id: { $ne: excludeId },

    // OVERLAP CONDITION
    effectiveFrom: { $lte: to },
    effectiveTo: { $gte: from },
  };

  const exists = await ShiftRequirement.findOne(query);
  return !!exists;
};

/* --------------------------------------------------
   CREATE
-------------------------------------------------- */
export const createReq = async (req, res, next) => {
  try {
    const {
      departmentId,
      shiftId,
      roleId,
      requiredCount,
      effectiveFrom,
      effectiveTo,
    } = req.body;

    if (new Date(effectiveFrom) > new Date(effectiveTo)) {
      throw new ApiError("Invalid date range", 400);
    }

    // validate ownership
    const dep = await Department.findOne({
      _id: departmentId,
      organizationId: req.user.organizationId,
    });
    if (!dep) throw new ApiError("Invalid department", 400);

    const shift = await Shift.findOne({
      _id: shiftId,
      organizationId: req.user.organizationId,
    });
    if (!shift) throw new ApiError("Invalid shift", 400);

    const role = await Role.findOne({
      _id: roleId,
      organizationId: { $in: [null, req.user.organizationId] },
    });
    if (!role) throw new ApiError("Invalid role", 400);

    // 🔥 STRICT OVERLAP CHECK
    const hasOverlap = await checkOverlap({
      organizationId: req.user.organizationId,
      departmentId,
      shiftId,
      roleId,
      from: effectiveFrom,
      to: effectiveTo,
    });

    if (hasOverlap) {
      throw new ApiError(
        "Requirement already exists in overlapping date range",
        400,
      );
    }

    const data = await ShiftRequirement.create({
      departmentId,
      shiftId,
      roleId,
      requiredCount,
      effectiveFrom,
      effectiveTo,
      organizationId: req.user.organizationId,
    });

    return ok(res, data, "Requirement created");
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   GET BY DEPARTMENT
-------------------------------------------------- */
export const byDepartment = async (req, res, next) => {
  try {
    const { deptId } = req.params;
    const { date } = req.query;

    const filter = {
      departmentId: deptId,
      organizationId: req.user.organizationId,
    };

    if (date) {
      filter.effectiveFrom = { $lte: new Date(date) };
      filter.effectiveTo = { $gte: new Date(date) };
    }

    const data = await ShiftRequirement.find(filter)
      .populate("shiftId", "name startTime endTime")
      .populate("roleId", "name code");

    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   PARTICULAR SHIFT OF DEPARTMENT
-------------------------------------------------- */
export const byDepartmentShift = async (req, res, next) => {
  try {
    const { deptId, shiftId } = req.params;
    const { date } = req.query;

    const filter = {
      departmentId: deptId,
      shiftId,
      organizationId: req.user.organizationId,
    };

    if (date) {
      filter.effectiveFrom = { $lte: new Date(date) };
      filter.effectiveTo = { $gte: new Date(date) };
    }

    const data = await ShiftRequirement.find(filter).populate(
      "roleId",
      "name code",
    );

    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   BULK UPSERT FOR ONE SHIFT
-------------------------------------------------- */
export const bulkUpsert = async (req, res, next) => {
  try {
    const { departmentId, shiftId, effectiveFrom, effectiveTo, requirements } =
      req.body;

    if (!Array.isArray(requirements)) {
      throw new ApiError("requirements must be array", 400);
    }

    const result = [];

    for (const r of requirements) {
      const overlap = await checkOverlap({
        organizationId: req.user.organizationId,
        departmentId,
        shiftId,
        roleId: r.roleId,
        from: effectiveFrom,
        to: effectiveTo,
      });

      if (overlap) {
        throw new ApiError(`Overlap for role ${r.roleId}`, 400);
      }

      const rec = await ShiftRequirement.create({
        organizationId: req.user.organizationId,
        departmentId,
        shiftId,
        roleId: r.roleId,
        requiredCount: r.count,
        effectiveFrom,
        effectiveTo,
      });

      result.push(rec);
    }

    return ok(res, result, "Bulk saved");
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   UPDATE
-------------------------------------------------- */
export const updateReq = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (req.body.effectiveFrom && req.body.effectiveTo) {
      const overlap = await checkOverlap({
        organizationId: req.user.organizationId,
        departmentId: req.body.departmentId,
        shiftId: req.body.shiftId,
        roleId: req.body.roleId,
        from: req.body.effectiveFrom,
        to: req.body.effectiveTo,
        excludeId: id,
      });

      if (overlap) {
        throw new ApiError("Overlap exists", 400);
      }
    }

    const data = await ShiftRequirement.findOneAndUpdate(
      { _id: id, organizationId: req.user.organizationId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!data) throw new ApiError("Not found", 404);

    return ok(res, data, "Updated");
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   DELETE
-------------------------------------------------- */
export const deleteReq = async (req, res, next) => {
  try {
    const data = await ShiftRequirement.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!data) throw new ApiError("Not found", 404);

    return ok(res, null, "Deleted");
  } catch (err) {
    next(err);
  }
};
