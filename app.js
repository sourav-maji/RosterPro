import express from "express";
import cors from "cors";
import error from "./src/middleware/error.js";
import orgRoutes from "./src/modules/org/org.routes.js";
import userRoutes from "./src/modules/users/user.routes.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import departmentRoutes from "./src/modules/departments/department.routes.js";
import shiftRoutes from "./src/modules/shifts/shift.routes.js";
import shiftReqRoutes from "./modules/shiftReq/shiftReq.routes.js";



const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => res.json({ message: "Smart Shift API running" }));

// Routes
app.use("/api/v1/org", orgRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/shifts", shiftRoutes);
app.use("/api/v1/shift-req", shiftReqRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API not found" });
});

// Error handler (last)
app.use(error);

export default app;
