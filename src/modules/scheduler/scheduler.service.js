import axios from "axios";

import Shift from "../shifts/shift.model.js";
import User from "../users/user.model.js";
import Role from "../roles/role.model.js";
import ShiftReq from "../shiftReq/shiftReq.model.js";
import ApiError from "../../utils/ApiError.js";

/* --------------------------------------------------
   BUILD JSON FOR PYTHON SCHEDULER
-------------------------------------------------- */
export const buildSchedulerJson = async ({
  organizationId,
  departmentId,
  startDate,
}) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  /* ---------------- SHIFTS ---------------- */
  const shifts = await Shift.find({ organizationId, departmentId });

  if (!shifts.length) {
    throw new ApiError("No shifts configured for department", 400);
  }

  const shiftMap = {};
  const shiftHours = {};

  for (const s of shifts) {
    shiftMap[s.name] = String(s._id);
    shiftHours[s.name] = s.durationHours || 8;
  }

  /* ---------------- STAFF ---------------- */
  const users = await User.find({
    organizationId,
    departmentId,
    isActive: true,
  }).populate("roleId");

  if (!users.length) {
    throw new ApiError("No active users in department", 400);
  }

  const staff = users.map((u) => ({
    id: String(u._id),
    role: u.roleId?.code || "UNKNOWN",
  }));

  const userMap = {};
  for (const u of users) {
    userMap[String(u._id)] = String(u._id);
  }

  /* ---------------- REQUIREMENTS ---------------- */
  const reqs = await ShiftReq.find({
    organizationId,
    departmentId,
    effectiveFrom: { $lte: startDate },
    effectiveTo: { $gte: startDate },
  }).populate("roleId shiftId");

  if (!reqs.length) {
    throw new ApiError("No shift requirements found for date", 400);
  }

  const requirements = {};

  for (const r of reqs) {
    const shiftName = r.shiftId.name;
    if (!requirements[shiftName]) requirements[shiftName] = {};
    requirements[shiftName][r.roleId.code] = r.requiredCount;
  }

  /* ---------------- ROLE POLICIES ---------------- */
  const roles = await Role.find({
    organizationId: { $in: [null, organizationId] },
  });

  const maxShifts = {};
  const maxHours = {};

  for (const role of roles) {
    maxShifts[role.code] = 5; // default v1
    maxHours[role.code] = 48; // default v1
  }

  return {
    payload: {
      days,
      shifts: shiftHours,
      requirements,
      staff,

      // V2 hooks
      unavailability: {},
      preferred_holidays: {},

      max_shifts_per_week: maxShifts,
      max_weekly_hours: maxHours,
      min_rest_hours: 12,
    },

    // Used ONLY by Node after ML returns
    meta: {
      shiftMap,
      userMap,
    },
  };
};

/* --------------------------------------------------
   CALL PYTHON SCHEDULER SERVICE
-------------------------------------------------- */
export const callPythonScheduler = async (payload) => {
  try {
    const url =
      process.env.SCHEDULER_URL || "http://localhost:8000/schedule/weekly";

    const res = await axios.post(url, payload, {
      timeout: 30_000,
      headers: {
        "x-scheduler-key": process.env.SCHEDULER_API_KEY,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (err) {
    throw new ApiError(
      "Scheduler service error: " + (err.response?.data?.detail || err.message),
      500,
    );
  }
};
