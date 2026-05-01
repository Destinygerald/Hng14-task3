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
      "/api/auth/github": {
        get: {
          summary: "Authenticates a user",
          tags: ["Auth"],
          responses: {
            203: { description: "Login successful" },
            401: { description: "Invalid credentials" },
          },
        },
      },

      "/api/auth/refresh": {
        post: {
          summary: "Refeesh Expired token",
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
            200: {
              description: "Authenticated user data",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      refresh_token: { type: "string" },
                      access_token: { type: "string" },
                    },
                  },
                },
              },
            },
            401: { description: "Invalid credentials" },
          },
        },
      },

      "/api/auth/logout": {
        post: {
          summary: "Logout a user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    refresh_token: { type: "string" },
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

      "/api/profiles": {
        get: {
          summary: "Authenricates a user",
          tags: ["Profile"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "header",
              name: "Authorization",
              required: true,
              schema: { type: "string" },
              description: "Bearer token e.g. `Bearer <token>`",
            },
          ],
          responses: {
            200: {
              description: "Authenticated user data",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      page: { type: "string" },
                      limit: { type: "string" },
                      data: { type: "array" },
                    },
                  },
                },
              },
            },
            401: { description: "Missing or invalid token" },
            403: { description: "Token expired" },
          },
        },
      },

      "/api/profiles/search": {
        get: {
          summary: "Authenricates a user",
          tags: ["Profile"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "header",
              name: "Authorization",
              required: true,
              schema: { type: "string" },
              description: "Bearer token e.g. `Bearer <token>`",
            },
          ],
          responses: {
            200: {
              description: "Authenticated user data",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      page: { type: "string" },
                      limit: { type: "string" },
                      data: { type: "array" },
                    },
                  },
                },
              },
            },
            401: { description: "Missing or invalid token" },
            403: { description: "Token expired" },
          },
        },
      },

      "/api/profiles": {
        post: {
          summary: "Authenricates a user",
          tags: ["Profile"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "header",
              name: "Authorization",
              required: true,
              schema: { type: "string" },
              description: "Bearer token e.g. `Bearer <token>`",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Authenticated user data",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
            401: { description: "Missing or invalid token" },
            403: { description: "Token expired" },
          },
        },
      },

      // Add all your other routes here...
    },
  },
  apis: [], // ✅ Empty — not needed when paths are inline
};

export const swaggerSpec = swaggerJSDoc(options);
