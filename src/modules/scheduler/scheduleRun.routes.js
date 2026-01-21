import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";
import { check } from "../../middleware/rbac.js";

import { listRuns, getRun } from "./scheduleRun.controller.js";

const router = Router();

router.use(protect);

/* --------------------------------------------------
   VIEW RUN HISTORY
-------------------------------------------------- */
router.get("/runs", check("SCHEDULER_VIEW"), asyncHandler(listRuns));

/* --------------------------------------------------
   VIEW SINGLE RUN
-------------------------------------------------- */
router.get("/runs/:id", check("SCHEDULER_VIEW"), asyncHandler(getRun));

export default router;
