import { Router } from "express";
import {
  createProfile,
  getProfileCSVFormat,
  getProfiles,
  searchForProfile,
} from "../controllers/profile.js";
import { asyncHandler } from "../middleware/error-handler.js";
import { checkRole } from "../middleware/role-checker.js";
import { urlVersioning } from "../middleware/api-versioning.js";
import { authenticateUser } from "../middleware/auth-middleware.js";

export const Routes = Router();

Routes.use(urlVersioning("v1"));
Routes.use(authenticateUser);

Routes.get("/", asyncHandler(getProfiles));
Routes.get("/search", asyncHandler(searchForProfile));

Routes.post("/", checkRole("admin"), asyncHandler(createProfile));

Routes.get(
  "/api/profiles/export?format=csv",
  asyncHandler(getProfileCSVFormat),
);
