import axios from "axios";

import Shift from "../shifts/shift.model.js";
import User from "../users/user.model.js";
import Role from "../roles/role.model.js";
import ShiftReq from "../shiftReq/shiftReq.model.js";

import ApiError from "../../utils/ApiError.js";

/* --------------------------------------------------
   BUILD JSON FOR PYTHON
-------------------------------------------------- */
export const buildSchedulerJson = async ({
  organizationId,
  departmentId,
  startDate,
}) => {
  // 1️⃣ Days (Mon-Sun for now)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // 2️⃣ Shifts
  const shifts = await Shift.find({
    organizationId,
    departmentId,
  });

  const shiftMap = {};
  const shiftHours = {};

  for (const s of shifts) {
    shiftMap[s.name] = String(s._id);
    shiftHours[s.name] = s.durationHours || 8;
  }

  // 3️⃣ Staff
  const users = await User.find({
    organizationId,
    departmentId,
    isActive: true,
  }).populate("roleId");

  const staff = users.map((u) => ({
    name: String(u._id),
    role: u.roleId?.code || "UNKNOWN",
  }));

  const userMap = {};
  for (const u of users) {
    userMap[String(u._id)] = String(u._id);
  }

  // 4️⃣ Requirements (date based)
  const reqs = await ShiftReq.find({
    organizationId,
    departmentId,
    effectiveFrom: { $lte: startDate },
    effectiveTo: { $gte: startDate },
  }).populate("roleId shiftId");

  const requirements = {};

  for (const r of reqs) {
    const shiftName = r.shiftId.name;
    if (!requirements[shiftName]) requirements[shiftName] = {};

    requirements[shiftName][r.roleId.code] = r.requiredCount;
  }

  // 5️⃣ Role Policies (simple defaults)
  const roles = await Role.find({
    organizationId: { $in: [null, organizationId] },
  });

  const maxShifts = {};
  const maxHours = {};

  for (const role of roles) {
    maxShifts[role.code] = 5;
    maxHours[role.code] = 48;
  }

  return {
    days,
    shifts: shiftHours,
    requirements,
    staff,

    unavailability: {}, // later from leave module
    preferred_holidays: {},

    max_shifts_per_week: maxShifts,
    max_weekly_hours: maxHours,

    min_rest_hours: 12,

    // meta for saving
    __meta: {
      shiftMap,
      userMap,
    },
  };
};

/* --------------------------------------------------
   CALL PYTHON SERVICE
-------------------------------------------------- */
export const callPythonScheduler = async (json) => {
  try {
    const url = process.env.SCHEDULER_URL || "http://localhost:5000/schedule";

    const res = await axios.post(url, json, {
      timeout: 30000,
    });

    return res.data;
  } catch (err) {
    throw new ApiError("Scheduler service error: " + err.message, 500);
  }
};
