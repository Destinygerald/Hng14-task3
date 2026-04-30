export function checkRole(role) {
  return function (req, res, next) {
    const userRoles = req.session.user?.role || [];

    if (userRoles.includes(role)) {
      return next();
    }
    res.status(403).json({
      status: "failed",
      message: `Access Denied: Requires ${role}`,
    });
  };
}
