export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Unauthorized.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Admin authorization failed.",
    });
  }
};

