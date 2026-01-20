import Department from "./department.model.js";
import User from "../users/user.model.js";

import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";

/* ===================================================
   CREATE DEPARTMENT
=================================================== */
export const createDepartment = async (req, res, next) => {
  try {
    const exists = await Department.findOne({
      name: req.body.name,
      organizationId: req.user.organizationId,
    });

    if (exists) {
      throw new ApiError("Department already exists", 400);
    }

    const dep = await Department.create({
      name: req.body.name,
      description: req.body.description,
      organizationId: req.user.organizationId,
    });

    return ok(res, dep, "Department created");
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   LIST DEPARTMENTS
=================================================== */
export const listDepartment = async (req, res, next) => {
  try {
    const data = await Department.find({
      organizationId: req.user.organizationId,
    });

    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   GET BY ID
=================================================== */
export const getDepartment = async (req, res, next) => {
  try {
    const dep = await Department.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!dep) {
      throw new ApiError("Department not found", 404);
    }

    return ok(res, dep);
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   UPDATE DEPARTMENT
=================================================== */
export const updateDepartment = async (req, res, next) => {
  try {
    const dep = await Department.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.user.organizationId,
      },
      req.body,
      { new: true, runValidators: true },
    );

    if (!dep) {
      throw new ApiError("Department not found", 404);
    }

    return ok(res, dep, "Department updated");
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   DELETE DEPARTMENT
=================================================== */
export const deleteDepartment = async (req, res, next) => {
  try {
    // Optional safety: check if users exist in this department
    const userCount = await User.countDocuments({
      departmentId: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (userCount > 0) {
      throw new ApiError("Cannot delete department with active users", 400);
    }

    const dep = await Department.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!dep) {
      throw new ApiError("Department not found", 404);
    }

    return ok(res, null, "Department deleted");
  } catch (err) {
    next(err);
  }
};

/* ===================================================
   GET USERS OF DEPARTMENT  (Single Source of Truth)
=================================================== */
export const departmentUsers = async (req, res, next) => {
  try {
    const dep = await Department.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!dep) {
      throw new ApiError("Department not found", 404);
    }

    const users = await User.find({
      departmentId: req.params.id,
      organizationId: req.user.organizationId,
    });

    return ok(res, users);
  } catch (err) {
    next(err);
  }
};
