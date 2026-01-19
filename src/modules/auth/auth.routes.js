import { Router } from "express";
import { ok } from "../../utils/response.js";

const router = Router();

// temporary health endpoint
router.get("/", (req, res) => {
  ok(res, null, "auth module ready");
});

export default router;
