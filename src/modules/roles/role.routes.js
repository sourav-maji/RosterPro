import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";
import { check } from "../../middleware/rbac.js";

import {
  createRole,
  listRole,
  updateRole,
  deleteRole,
} from "./role.controller.js";

const router = Router();

router.use(protect);

router.post("/", check("ROLE_CREATE"), asyncHandler(createRole));

router.get("/", asyncHandler(listRole)); // read allowed

router.put("/:id", check("ROLE_UPDATE"), asyncHandler(updateRole));

router.delete("/:id", check("ROLE_DELETE"), asyncHandler(deleteRole));

export default router;
