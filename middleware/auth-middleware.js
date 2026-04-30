import jwt from "jsonwebtoken";

export function authenticateUser(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }

  const token = auth.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    next();
  } catch {
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
  }
}
