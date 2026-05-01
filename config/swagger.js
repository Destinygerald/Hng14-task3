import swaggerJSDoc from "swagger-jsdoc";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Insighta Labs+ API", version: "1.0.0" },
    servers: [{ url: "https://hng14-task3.vercel.app" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    // ✅ Define paths directly here — no file scanning needed
    paths: {
      "/auth/login": {
        post: {
          summary: "Login a user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/auth/register": {
        post: {
          summary: "Register a new user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                    name: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User created" },
            400: { description: "Validation error" },
          },
        },
      },
      // Add all your other routes here...
    },
  },
  apis: [], // ✅ Empty — not needed when paths are inline
};

export const swaggerSpec = swaggerJSDoc(options);
