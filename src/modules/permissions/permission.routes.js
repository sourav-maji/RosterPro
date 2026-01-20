import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";
import { check } from "../../middleware/rbac.js";

import {
  createPermission,
  listPermission,
  updatePermission,
} from "./permission.controller.js";

const router = Router();

router.use(protect);

router.post("/", check("PERMISSION_CREATE"), asyncHandler(createPermission));

router.get("/", asyncHandler(listPermission));

router.put("/:id", check("PERMISSION_UPDATE"), asyncHandler(updatePermission));

export default router;
