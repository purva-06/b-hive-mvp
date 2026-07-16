import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import healthRoutes from "./routes/healthRoutes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import contributionRoutes from "./routes/contributionRoutes.js";

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the B HIVE API.",
    data: null,
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use(
  "/api/contributions",
  contributionRoutes
);

app.use(notFound);
app.use(errorHandler);

export default app;