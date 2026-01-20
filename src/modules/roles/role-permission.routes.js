import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";
import { check } from "../../middleware/rbac.js";

import { assign, bulkAssign, remove, byRole } from "./rp.controller.js";

const router = Router();

router.use(protect);

router.post("/", check("ROLE_PERMISSION_ASSIGN"), asyncHandler(assign));

router.post("/bulk", check("ROLE_PERMISSION_ASSIGN"), asyncHandler(bulkAssign));

router.delete("/:id", check("ROLE_PERMISSION_ASSIGN"), asyncHandler(remove));

router.get("/role/:roleId", asyncHandler(byRole));

export default router;
