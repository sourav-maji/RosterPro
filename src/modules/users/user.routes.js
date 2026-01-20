import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";
import { check } from "../../middleware/rbac.js";

import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  countUsers,
  toggleUser,
  changeDepartment,
} from "./user.controller.js";

const router = Router();

router.use(protect);

router.post("/", check("USER_CREATE"), asyncHandler(createUser));

router.get("/", check("USER_VIEW"), asyncHandler(listUsers));

router.get("/count", check("USER_VIEW"), asyncHandler(countUsers));

router.get("/:id", check("USER_VIEW"), asyncHandler(getUser));

router.put("/:id", check("USER_UPDATE"), asyncHandler(updateUser));

router.delete("/:id", check("USER_DELETE"), asyncHandler(deleteUser));

router.patch("/:id/toggle", check("USER_TOGGLE"), asyncHandler(toggleUser));

router.patch(
  "/:id/department",
  check("USER_MOVE_DEPARTMENT"),
  asyncHandler(changeDepartment),
);

export default router;
