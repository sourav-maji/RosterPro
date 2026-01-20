import Shift from "./shift.model.js";
import Department from "../departments/department.model.js";

import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";

/* CREATE SHIFT */
export const createShift = async (req, res, next) => {
  try {
    const { departmentId } = req.body;

    // validate department belongs to tenant
    const dep = await Department.findOne({
      _id: departmentId,
      organizationId: req.user.organizationId,
    });

    if (!dep) throw new ApiError("Invalid department", 400);

    const exists = await Shift.findOne({
      name: req.body.name,
      departmentId,
      organizationId: req.user.organizationId,
    });

    if (exists) {
      throw new ApiError("Shift already exists", 400);
    }

    const shift = await Shift.create({
      ...req.body,
      organizationId: req.user.organizationId,
    });

    return ok(res, shift, "Shift created");
  } catch (err) {
    next(err);
  }
};

/* LIST SHIFTS */
export const listShift = async (req, res, next) => {
  try {
    const { departmentId } = req.query;

    const filter = {
      organizationId: req.user.organizationId,
    };

    if (departmentId) filter.departmentId = departmentId;

    const data = await Shift.find(filter)
      .populate("departmentId", "name")
      .sort({ createdAt: -1 });

    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

/* GET BY ID */
export const getShift = async (req, res, next) => {
  try {
    const shift = await Shift.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    }).populate("departmentId", "name");

    if (!shift) throw new ApiError("Shift not found", 404);

    return ok(res, shift);
  } catch (err) {
    next(err);
  }
};

/* UPDATE */
export const updateShift = async (req, res, next) => {
  try {
    if (req.body.departmentId) {
      const dep = await Department.findOne({
        _id: req.body.departmentId,
        organizationId: req.user.organizationId,
      });

      if (!dep) throw new ApiError("Invalid department", 400);
    }

    const shift = await Shift.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.user.organizationId,
      },
      req.body,
      { new: true, runValidators: true },
    );

    if (!shift) throw new ApiError("Shift not found", 404);

    return ok(res, shift, "Shift updated");
  } catch (err) {
    next(err);
  }
};

/* DELETE */
export const deleteShift = async (req, res, next) => {
  try {
    const shift = await Shift.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!shift) throw new ApiError("Shift not found", 404);

    return ok(res, null, "Shift deleted");
  } catch (err) {
    next(err);
  }
};

/* TOGGLE ACTIVE */
export const toggleShift = async (req, res, next) => {
  try {
    const shift = await Shift.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!shift) throw new ApiError("Shift not found", 404);

    shift.isActive = !shift.isActive;
    await shift.save();

    return ok(res, shift, "Status updated");
  } catch (err) {
    next(err);
  }
};
