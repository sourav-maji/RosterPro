import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";
import { check } from "../../middleware/rbac.js";

import {
  createDepartment,
  listDepartment,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  departmentUsers,
} from "./department.controller.js";

const router = Router();

router.use(protect);

router.post("/", check("DEPARTMENT_CREATE"), asyncHandler(createDepartment));

router.get("/", check("DEPARTMENT_VIEW"), asyncHandler(listDepartment));

router.get("/:id", check("DEPARTMENT_VIEW"), asyncHandler(getDepartment));

router.put("/:id", check("DEPARTMENT_UPDATE"), asyncHandler(updateDepartment));

router.delete(
  "/:id",
  check("DEPARTMENT_DELETE"),
  asyncHandler(deleteDepartment),
);

router.get(
  "/:id/users",
  check("DEPARTMENT_VIEW_USERS"),
  asyncHandler(departmentUsers),
);

export default router;
