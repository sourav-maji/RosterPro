import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";

import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  countUsers,
  toggleUser,
} from "./user.controller.js";

const router = Router();

// All user APIs require login
// router.use(protect);

router.post("/", asyncHandler(createUser));
router.get("/", asyncHandler(listUsers));
router.get("/count", asyncHandler(countUsers));

router.get("/:id", asyncHandler(getUser));
router.put("/:id", asyncHandler(updateUser));
router.delete("/:id", asyncHandler(deleteUser));

router.patch("/:id/toggle", asyncHandler(toggleUser));

export default router;
