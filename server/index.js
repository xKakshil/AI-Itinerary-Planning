
import "dotenv/config";

import express from "express";
import cors from "cors";

import planRoute from "./routes/plan.js";
import replaceStopRoute from "./routes/replaceStop.js";
import refineDayRoute from "./routes/refineDay.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/plan", planRoute);
app.use("/api/stop/replace", replaceStopRoute);
app.use("/api/refine", refineDayRoute);

app.get("/", (req, res) => {
  res.json({
    status: "Server Running",
    message: "AI Trip Planner Backend",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});