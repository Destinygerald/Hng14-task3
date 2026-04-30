import { RedisStore } from "rate-limit-redis";
import Redis from "ioredis";
import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger.js";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { config } from "dotenv";

config();

const RedisClient = new Redis(process.env.REDIS_URL);

export function sensitiveEndpoint(maxRequest, time) {
  return rateLimit({
    max: maxRequest,
    windowMs: time,
    message: "Too many requests, please try again",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        status: "error",
        message: "Too Many Requests",
      });
    },
    store: new RedisStore({
      sendCommand: (...args) => RedisClient.call(...args),
    }),
  });
}
