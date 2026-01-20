import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";
import { check } from "../../middleware/rbac.js";

import { generatePreview , saveSchedule} from "./scheduler.controller.js";

const router = Router();

router.use(protect);

router.post(
  "/preview",
  check("SCHEDULER_PREVIEW"),
  asyncHandler(generatePreview),
);

router.post("/save", check("SCHEDULER_SAVE") , asyncHandler(saveSchedule));

export default router;
