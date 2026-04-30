import swaggerJSDoc from "swagger-jsdoc";

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
        url: "http://localhost:5000",
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

  apis: ["./src/routes/*.js"], // scans JSDoc comments in routes
};

export const swaggerSpec = swaggerJSDoc(options);
