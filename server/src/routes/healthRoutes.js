import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (req, res) => {
  const databaseStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    success: true,
    message: "B HIVE API is healthy.",
    data: {
      service: "b-hive-api",
      environment: process.env.NODE_ENV || "development",
      database:
        databaseStates[mongoose.connection.readyState] || "unknown",
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;