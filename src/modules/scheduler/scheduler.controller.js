import {
  buildSchedulerJson,
  callPythonScheduler,
} from "./scheduler.service.js";

import { ok } from "../../utils/response.js";
import Allocation from "../alloc/allocation.model.js";
import { mapMlResultToAlloc } from "../alloc/alloc.mapper.js";


/* --------------------------------------------------
   GENERATE PREVIEW (NO SAVE)
-------------------------------------------------- */
export const generatePreview = async (req, res, next) => {
  try {
    const { departmentId, date } = req.body;

    const json = await buildSchedulerJson({
      organizationId: req.user.organizationId,
      departmentId,
      startDate: date,
    });

    const result = await callPythonScheduler(json);

    return ok(res, {
      input: json,
      result,
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
    const { result, departmentId, meta } = req.body;

    if (!result?.schedule) {
      throw new ApiError("Invalid result", 400);
    }

    const records = mapMlResultToAlloc({
      result,
      organizationId: req.user.organizationId,
      departmentId,
      shiftMap: meta.shiftMap,
      userMap: meta.userMap,
    });

    // Remove old for those dates
    const dates = [...new Set(records.map(r => r.date))];

    await Allocation.deleteMany({
      organizationId: req.user.organizationId,
      departmentId,
      date: { $in: dates },
    });

    const saved = await Allocation.insertMany(records);

    return ok(res, saved, "Schedule committed");
  } catch (err) {
    next(err);
  }
};