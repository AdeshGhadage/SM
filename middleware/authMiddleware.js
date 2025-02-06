const jwt = require("jsonwebtoken");
const Registration = require("../Schema/user");

const authMiddleware = async (req, res, next) => {
  const token = req.token;

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Authorization token is required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Registration.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Attach user data to request object for use in other routes
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      smId: user.smId,
      college: user.college,
      contact: user.contact,
    };

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    console.error(error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token has expired",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

module.exports = authMiddleware;
