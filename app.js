import express from "express";
import cors from "cors";
import error from "./src/middleware/error.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Smart Shift API running" });
});

app.use(error);

export default app;
