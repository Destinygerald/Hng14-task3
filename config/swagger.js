import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Insighta Labs+ API",
      version: "1.0.0",
      description: "Secure multi-interface backend for Insighta Labs+",
    },
    servers: [
      {
        url: "https://hng14-task3.vercel.app",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: [
    path.join(__dirname, "../routes/auth.js"),
    path.join(__dirname, "../routes/profile.js"),
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
