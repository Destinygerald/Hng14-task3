import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export function generateAccess(user) {
  return jwt.sign(
    { id: user.id, role: user.role, username: user.username },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "3m" },
  );
}

export function generateRefresh() {
  return crypto.randomBytes(64).toString("hex");
}
