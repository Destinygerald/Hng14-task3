export function urlVersioning(url_version) {
  return function (req, res, next) {
    if (req.headers["x-api-version"] === url_version) {
      next();
    } else {
      return res.status(404).json({
        status: "error",
        message: "API version header required",
      });
    }
  };
}
