import app from "./app.js";
import { env } from "./config/env.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./config/db.js";

let server;

async function startServer() {
  try {
    await connectDatabase();

    server = app.listen(env.port, () => {
      console.log(
        `B HIVE API running in ${env.nodeEnv} mode on port ${env.port}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      console.log("HTTP server and database connection closed.");
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  shutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  shutdown("UNCAUGHT_EXCEPTION");
});

startServer();