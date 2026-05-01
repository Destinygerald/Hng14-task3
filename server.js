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

// import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { logger } from "./middleware/logger.js";
import { config } from "dotenv";

const app = express();

config();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https://cdnjs.cloudflare.com"],
        workerSrc: ["'self'", "blob:"],
      },
    },
  }),
);

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

const swaggerUiOptions = {
  customCssUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css",
  customJs: [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js",
  ],
};

// Serve the raw spec
app.get("/docs/spec.json", (req, res) => res.json(swaggerSpec));

// Serve a self-contained Swagger UI page
app.get("/docs", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>API Docs</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.min.js"></script>
        <script>
          window.onload = () => {
            SwaggerUIBundle({
              url: "/docs/spec.json",
              dom_id: "#swagger-ui",
              presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
              layout: "StandaloneLayout",
            });
          };
        </script>
      </body>
    </html>
  `);
});

app.use("/api/profiles", sensitiveEndpoint(60, 1 * 60 * 1000), ProfileRoutes);

app.use("/api/auth", sensitiveEndpoint(10, 1 * 60 * 1000), AuthRoutes);

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.use(globalErrorHandler);

export default app;
