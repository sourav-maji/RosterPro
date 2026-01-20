import Allocation from "./allocation.model.js";
import ShiftReq from "../shiftReq/shiftReq.model.js";
import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";

/* --------------------------------------------------
   DEPARTMENT DAY BOARD
-------------------------------------------------- */
export const boardByDay = async (req, res, next) => {
  try {
    const { departmentId, date } = req.query;

    if (!departmentId || !date) {
      throw new ApiError("departmentId & date required", 400);
    }

    const data = await Allocation.find({
      organizationId: req.user.organizationId,
      departmentId,
      date,
    })
      .populate("userId", "name")
      .populate("shiftId", "name");

    // group by shift
    const board = {};

    for (const a of data) {
      const s = a.shiftId.name;
      if (!board[s]) board[s] = [];

      board[s].push({
        userId: a.userId._id,
        name: a.userId.name,
        status: a.status,
        source: a.source,
      });
    }

    return ok(res, board);
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   USER CALENDAR VIEW
-------------------------------------------------- */
export const userCalendar = async (req, res, next) => {
  try {
    const { userId, from, to } = req.query;

    const data = await Allocation.find({
      organizationId: req.user.organizationId,
      userId,
      date: { $gte: from, $lte: to },
    }).populate("shiftId", "name");

    const cal = data.map((a) => ({
      date: a.date,
      shift: a.shiftId.name,
      status: a.status,
      source: a.source,
    }));

    return ok(res, cal);
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   COVERAGE CHECK VS REQUIREMENT
-------------------------------------------------- */
export const coverage = async (req, res, next) => {
  try {
    const { departmentId, date } = req.query;

    // allocations
    const alloc = await Allocation.find({
      organizationId: req.user.organizationId,
      departmentId,
      date,
    })
      .populate("shiftId", "name")
      .populate({
        path: "userId",
        populate: { path: "roleId", select: "code" },
      });

    // requirement
    const reqs = await ShiftReq.find({
      organizationId: req.user.organizationId,
      departmentId,
      effectiveFrom: { $lte: date },
      effectiveTo: { $gte: date },
    })
      .populate("shiftId", "name")
      .populate("roleId", "code");

    const result = {};

    for (const r of reqs) {
      const shift = r.shiftId.name;
      const role = r.roleId.code;

      if (!result[shift]) result[shift] = {};

      const actual = alloc.filter(
        (a) => a.shiftId.name === shift && a.userId.roleId.code === role,
      ).length;

      result[shift][role] = {
        required: r.requiredCount,
        actual,
        gap: actual - r.requiredCount,
      };
    }

    return ok(res, result);
  } catch (err) {
    next(err);
  }
};
