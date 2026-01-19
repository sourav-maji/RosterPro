import "dotenv/config";
import app from "./app.js";
import connect from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

(async () => {
  try {
    await connect();
    app.listen(PORT, () => {
      console.log(`RosterPro running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
