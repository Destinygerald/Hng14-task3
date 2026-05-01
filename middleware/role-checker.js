import jwt from "jsonwebtoken";

export function checkRole(role) {
  return function (req, res, next) {
    const auth = req.headers["authorization"];
    const token = auth?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user; // ✅ attach to req for downstream use

      if (user.role === role) {
        return next();
      }

      return res.status(403).json({
        status: "failed",
        message: `Access Denied: Requires ${role}`,
      });
    } catch {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
  };
}
