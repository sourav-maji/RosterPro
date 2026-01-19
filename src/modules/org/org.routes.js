import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";

import {
  createOrg,
  listOrg,
  getOrg,
  updateOrg,
  deleteOrg,
  myOrg,
  countOrg,
  toggleActive,
} from "./org.controller.js";

const router = Router();

// Platform level (no auth for initial onboarding)

router.post("/", asyncHandler(createOrg));
router.get("/", asyncHandler(listOrg));
router.get("/count", asyncHandler(countOrg));

router.get("/:id", asyncHandler(getOrg));
router.put("/:id", asyncHandler(updateOrg));
router.delete("/:id", asyncHandler(deleteOrg));

// User Context

router.get("/me", protect, asyncHandler(myOrg));

// Utility

router.patch("/:id/toggle", asyncHandler(toggleActive));

export default router;
