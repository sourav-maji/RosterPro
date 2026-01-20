import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { protect } from "../../middleware/auth.js";

import {
  login,
  me,
  registerLocal,
  changePassword,
  resetPassword,
  refresh,
  logout,
  logoutAll,
  listAccounts,
  deleteAccount,
  myPermissions
} from "./auth.controller.js";

const router = Router();

/* PUBLIC */
router.post("/login", asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

/* PROTECTED */
router.get("/me", protect, asyncHandler(me));

router.post("/register-local", protect, asyncHandler(registerLocal));

router.post("/change-password", protect, asyncHandler(changePassword));

router.post("/reset-password", protect, asyncHandler(resetPassword));

router.get("/accounts/:userId", protect, asyncHandler(listAccounts));

router.delete("/accounts/:id", protect, asyncHandler(deleteAccount));

router.post("/logout-all", protect, asyncHandler(logoutAll));
router.get("/my-permissions", protect, asyncHandler(myPermissions))

export default router;
