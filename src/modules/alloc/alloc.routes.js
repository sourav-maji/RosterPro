import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";
import { check } from "../../middleware/rbac.js";

import {
  saveFromMl,
  manualAssign,
  listAlloc,
  swapUser,
} from "./alloc.controller.js";

import { boardByDay, userCalendar, coverage } from "./alloc.summary.js";

const router = Router();

router.use(protect);

router.post("/ml", check("ALLOC_BULK"), asyncHandler(saveFromMl));

router.post("/manual", check("ALLOC_CREATE"), asyncHandler(manualAssign));

router.get("/", check("ALLOC_VIEW"), asyncHandler(listAlloc));

router.post("/swap", check("ALLOC_SWAP"), asyncHandler(swapUser));

router.get("/board", check("ALLOC_VIEW"), asyncHandler(boardByDay));

router.get("/calendar", check("ALLOC_VIEW"), asyncHandler(userCalendar));

router.get("/coverage", check("ALLOC_VIEW"), asyncHandler(coverage));

export default router;
