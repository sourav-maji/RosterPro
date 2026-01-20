import express from "express";
import cors from "cors";

// Middleware
import error from "./src/middleware/error.js";

// Routes
import orgRoutes from "./src/modules/org/org.routes.js";
import userRoutes from "./src/modules/users/user.routes.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import departmentRoutes from "./src/modules/departments/department.routes.js";
import shiftRoutes from "./src/modules/shifts/shift.routes.js";
import shiftReqRoutes from "./src/modules/shiftReq/shiftReq.routes.js";
import allocRoutes from "./src/modules/alloc/alloc.routes.js";
import schedulerRoutes from "./src/modules/scheduler/scheduler.routes.js";

// Swagger
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const app = express();

// --------------------------------------------------
// Global Middleware
// --------------------------------------------------
app.use(cors());
app.use(express.json());

// --------------------------------------------------
// Load Swagger File (kept at project root)
// --------------------------------------------------
const swaggerDoc = YAML.load("./swagger.yaml");

// --------------------------------------------------
// Health Check
// --------------------------------------------------
app.get("/", (req, res) => res.json({ message: "Smart Shift API running" }));

// --------------------------------------------------
// API Routes
// --------------------------------------------------
app.use("/api/v1/org", orgRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/shifts", shiftRoutes);
app.use("/api/v1/shift-req", shiftReqRoutes);
app.use("/api/v1/alloc", allocRoutes);
app.use("/api/v1/scheduler", schedulerRoutes);

// --------------------------------------------------
// Swagger UI  (must be BEFORE 404)
// --------------------------------------------------
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// --------------------------------------------------
// 404 Handler – only for API paths
// --------------------------------------------------
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API not found",
  });
});

// --------------------------------------------------
// Central Error Handler (LAST)
// --------------------------------------------------
app.use(error);

export default app;
