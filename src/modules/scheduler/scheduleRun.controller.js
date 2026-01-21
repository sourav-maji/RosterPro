import ScheduleRun from "./scheduleRun.model.js";
import { ok } from "../../utils/response.js";

/* --------------------------------------------------
   LIST SCHEDULE RUNS (LATEST FIRST)
-------------------------------------------------- */
export const listRuns = async (req, res, next) => {
  try {
    const { departmentId } = req.query;

    const filter = {
      organizationId: req.user.organizationId,
    };

    if (departmentId) {
      filter.departmentId = departmentId;
    }

    const runs = await ScheduleRun.find(filter)
      .sort({ createdAt: -1 })
      .limit(20);

    return ok(res, runs);
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   GET SINGLE RUN (DETAIL VIEW)
-------------------------------------------------- */
export const getRun = async (req, res, next) => {
  try {
    const run = await ScheduleRun.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId,
    });

    if (!run) {
      return ok(res, null);
    }

    return ok(res, run);
  } catch (err) {
    next(err);
  }
};
