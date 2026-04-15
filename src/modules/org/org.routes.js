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

// Public – initial onboarding (no token required)
router.post("/", asyncHandler(createOrg));

// Authenticated routes
router.get("/", protect, asyncHandler(listOrg));
router.get("/count", protect, asyncHandler(countOrg));
router.get("/me", protect, asyncHandler(myOrg));
router.get("/:id", protect, asyncHandler(getOrg));
router.put("/:id", protect, asyncHandler(updateOrg));
router.delete("/:id", protect, asyncHandler(deleteOrg));
router.patch("/:id/toggle", protect, asyncHandler(toggleActive));

export default router;
