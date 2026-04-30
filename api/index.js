import app from "../server.js";
import serverless from "serverless-http";

import express from "express";

// const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Vercel");
});

export default app; // ✅ works in /api folder
