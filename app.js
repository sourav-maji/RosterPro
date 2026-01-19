import express from "express";
import cors from "cors";
import error from "./src/middleware/error.js";
import orgRoutes from "./src/modules/org/org.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Smart Shift API running" });
});

app.use(error);


// Using routes from different modules

app.use("api/org", orgRoutes)

export default app;
