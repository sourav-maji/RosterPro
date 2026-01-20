import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";
import { check } from "../../middleware/rbac.js";

import {
  createReq,
  updateReq,
  deleteReq,
  byDepartment,
  byDepartmentShift,
  bulkUpsert,
} from "./shiftReq.controller.js";

const router = Router();

router.use(protect);

router.post("/", check("SHIFT_REQ_CREATE"), asyncHandler(createReq));

router.post("/bulk", check("SHIFT_REQ_BULK"), asyncHandler(bulkUpsert));

router.get(
  "/department/:deptId",
  check("SHIFT_REQ_VIEW"),
  asyncHandler(byDepartment),
);

router.get(
  "/department/:deptId/shift/:shiftId",
  check("SHIFT_REQ_VIEW"),
  asyncHandler(byDepartmentShift),
);

router.put("/:id", check("SHIFT_REQ_UPDATE"), asyncHandler(updateReq));

router.delete("/:id", check("SHIFT_REQ_DELETE"), asyncHandler(deleteReq));

export default router;
