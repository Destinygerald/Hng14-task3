import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";
import { Routes as ProfileRoutes } from "./routes/profile.js";
import { Routes as AuthRoutes } from "./routes/auth.js";
import { globalErrorHandler } from "./middleware/error-handler.js";
import { sensitiveEndpoint } from "./middleware/rate-limiting.js";
import { urlVersioning } from "./middleware/api-versioning.js";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { logger } from "./middleware/logger.js";
import { config } from "dotenv";

export const app = express();

config();

app.use(helmet());

app.use(
  cors({
    origin: "*",
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(logger);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/profiles", sensitiveEndpoint(60, 1 * 60 * 1000), ProfileRoutes);

app.use("/auth", sensitiveEndpoint(10, 1 * 60 * 1000), AuthRoutes);

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.use(globalErrorHandler);
