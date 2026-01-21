import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";
import { check } from "../../middleware/rbac.js";

import { generatePreview, saveSchedule } from "./scheduler.controller.js";

const router = Router();

/* --------------------------------------------------
   ALL SCHEDULER ROUTES ARE PROTECTED
-------------------------------------------------- */
router.use(protect);

/* --------------------------------------------------
   GENERATE SCHEDULE PREVIEW (ML ONLY)
-------------------------------------------------- */
router.post(
  "/preview",
  check("SCHEDULER_PREVIEW"),
  asyncHandler(generatePreview),
);

/* --------------------------------------------------
   SAVE SCHEDULE TO ALLOCATION
-------------------------------------------------- */
router.post("/save", check("SCHEDULER_SAVE"), asyncHandler(saveSchedule));

export default router;
