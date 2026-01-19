import express from "express";
import cors from "cors";
import error from "./src/middleware/error.js";
import orgRoutes from "./src/modules/org/org.routes.js";
import userRoutes from "./src/modules/users/user.routes.js";
import authRoutes from "./src/modules/auth/auth.routes.js";

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API not found" });
});

// Error handler (last)
app.use(error);

export default app;
