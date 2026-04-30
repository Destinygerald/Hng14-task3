import { Router } from "express";
import { asyncHandler } from "../middleware/error-handler.js";
import {
  githubAuth,
  githubAuthCallback,
  logout,
  refreshToken,
} from "../controllers/auth.js";

export const Routes = Router();

Routes.get("/github", asyncHandler(githubAuth));
Routes.get("/github/callback", githubAuthCallback);
Routes.post("/refresh", asyncHandler(refreshToken));
Routes.post("/logout", asyncHandler(logout));
