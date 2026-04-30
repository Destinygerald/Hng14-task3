import http from "http";
import dotenv from "dotenv";
import { app } from "./server.js";
import { logger } from "./utils/logger.js";
import { DbSeeding } from "./config/db.js";
dotenv.config();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Server Failed:", promise, "reason: ", reason);
  console.error(`Server Failed: ${reason}`);
  return;
});

server.listen(PORT, async () => {
  // await DbSeeding();
  console.log("Listening on PORT " + PORT);
});
