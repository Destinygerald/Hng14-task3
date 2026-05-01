import rateLimit from "express-rate-limit";

export function sensitiveEndpoint(max, windowMs) {
  return rateLimit({
    max,
    windowMs,
    // ✅ read real IP from Vercel's proxy headers
    keyGenerator: (req) => {
      return (
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.headers["x-real-ip"] ||
        req.ip
      );
    },
    handler: (req, res) => {
      res.status(429).json({
        status: "error",
        message: "Too many requests, please try again later.",
      });
    },
  });
}
