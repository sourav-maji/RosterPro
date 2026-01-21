import {
  buildSchedulerJson,
  callPythonScheduler,
} from "./scheduler.service.js";

import Allocation from "../alloc/allocation.model.js";
import { mapMlResultToAlloc } from "../alloc/alloc.mapper.js";
import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";

import ScheduleRun from "./scheduleRun.model.js";

/* --------------------------------------------------
   GENERATE PREVIEW (NO SAVE)
-------------------------------------------------- */
export const generatePreview = async (req, res, next) => {
  try {
    const { departmentId, startDate } = req.body;

    if (!departmentId || !startDate) {
      throw new ApiError("departmentId and startDate required", 400);
    }

    const { payload, meta } = await buildSchedulerJson({
      organizationId: req.user.organizationId,
      departmentId,
      startDate,
    });

    const result = await callPythonScheduler(payload);

    try {
      const unmetCount = result?.violations
        ? Object.values(result.violations).reduce((a, b) => a + b, 0)
        : 0;
    } catch (error) {
      console.log(error);
    }
    try {
      await ScheduleRun.create({
        organizationId: req.user.organizationId,
        departmentId,
        weekStart: startDate,
        inputPayload: payload,
        outputPayload: result,
        status: result.status,
        unmetCount,
        triggeredBy: req.user._id,
      });
    } catch (error) {
      console.log(error);
    }

    return ok(res, {
      payload,
      result,
      meta,
    });
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   SAVE SCHEDULE TO ALLOCATION
-------------------------------------------------- */
export const saveSchedule = async (req, res, next) => {
  try {
    const { result, meta, departmentId } = req.body;

    if (!result?.schedule || !meta) {
      throw new ApiError("Invalid scheduler result", 400);
    }

    const records = mapMlResultToAlloc({
      result,
      organizationId: req.user.organizationId,
      departmentId,
      shiftMap: meta.shiftMap,
      userMap: meta.userMap,
    });

    const dates = [...new Set(records.map((r) => r.date))];

    // 🔥 V1 RULE: overwrite ML allocations only
    await Allocation.deleteMany({
      organizationId: req.user.organizationId,
      departmentId,
      date: { $in: dates },
      source: "ML",
    });

    const saved = await Allocation.insertMany(records);

    return ok(res, saved, "Schedule committed");
  } catch (err) {
    next(err);
  }
};
