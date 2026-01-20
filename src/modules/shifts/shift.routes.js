import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";
import { check } from "../../middleware/rbac.js";

import {
  createShift,
  listShift,
  getShift,
  updateShift,
  deleteShift,
  toggleShift,
} from "./shift.controller.js";

const router = Router();

router.use(protect);

router.post("/", check("SHIFT_CREATE"), asyncHandler(createShift));

router.get("/", check("SHIFT_VIEW"), asyncHandler(listShift));

router.get("/:id", check("SHIFT_VIEW"), asyncHandler(getShift));

router.put("/:id", check("SHIFT_UPDATE"), asyncHandler(updateShift));

router.delete("/:id", check("SHIFT_DELETE"), asyncHandler(deleteShift));

router.patch("/:id/toggle", check("SHIFT_UPDATE"), asyncHandler(toggleShift));

export default router;
