import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import ApiError from "../utils/ApiError.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError("Token required", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError("User not found", 401);
    }

    // Attach roleCode from JWT payload so controllers and RBAC middleware
    // can check it without an extra populate query.
    // (User model has no roleCode field; it is only in the token.)
    user.roleCode = decoded.roleCode ?? null;

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
