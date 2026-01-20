import Allocation from "./allocation.model.js";
import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";
import { mapMlResultToAlloc } from "./alloc.mapper.js";

/* --------------------------------------------------
   SAVE ML RESULT (BULK)
-------------------------------------------------- */
export const saveFromMl = async (req, res, next) => {
  try {
    const { result, departmentId, shiftMap, userMap } = req.body;

    if (!result?.schedule) {
      throw new ApiError("Invalid ML result", 400);
    }

    const records = mapMlResultToAlloc({
      result,
      organizationId: req.user.organizationId,
      departmentId,
      shiftMap,
      userMap,
    });

    // remove old allocations for those dates
    const dates = [...new Set(records.map((r) => r.date))];

    await Allocation.deleteMany({
      organizationId: req.user.organizationId,
      departmentId,
      date: { $in: dates },
    });

    const saved = await Allocation.insertMany(records);

    return ok(res, saved, "ML schedule saved");
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   MANUAL ASSIGN
-------------------------------------------------- */
export const manualAssign = async (req, res, next) => {
  try {
    const data = await Allocation.create({
      ...req.body,
      organizationId: req.user.organizationId,
      source: "MANUAL",
    });

    return ok(res, data, "Assigned");
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   GET BY DEPARTMENT & DATE
-------------------------------------------------- */
export const listAlloc = async (req, res, next) => {
  try {
    const { departmentId, date } = req.query;

    const filter = {
      organizationId: req.user.organizationId,
    };

    if (departmentId) filter.departmentId = departmentId;
    if (date) filter.date = date;

    const data = await Allocation.find(filter)
      .populate("userId", "name email")
      .populate("shiftId", "name startTime endTime");

    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

/* --------------------------------------------------
   SWAP SHIFT
-------------------------------------------------- */
export const swapUser = async (req, res, next) => {
  try {
    const { allocId, newUserId } = req.body;

    const alloc = await Allocation.findOne({
      _id: allocId,
      organizationId: req.user.organizationId,
    });

    if (!alloc) throw new ApiError("Not found", 404);

    alloc.userId = newUserId;
    alloc.source = "MANUAL";
    alloc.status = "SWAPPED";

    await alloc.save();

    return ok(res, alloc, "Swapped");
  } catch (err) {
    next(err);
  }
};
