import User from "./user.model.js";
import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";

/**
 * CREATE USER (profile only)
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, roleId } = req.body;

    // Prevent duplicate inside same organization
    const exists = await User.findOne({
      email,
      organizationId: req.user?.organizationId,
    });

    if (exists) {
      throw new ApiError(
        "User with this email already exists in organization",
        400,
      );
    }

    const user = await User.create({
      name,
      email,
      roleId,
      organizationId: req.user?.organizationId,
    });

    return ok(res, user, "User created");
  } catch (err) {
    next(err);
  }
};

/**
 * LIST USERS (tenant scoped)
 */
export const listUsers = async (req, res, next) => {
  try {
    const { search } = req.query;

    const filter = {
      organizationId: req.user?.organizationId,
    };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    return ok(res, users);
  } catch (err) {
    next(err);
  }
};

/**
 * GET BY ID
 */
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return ok(res, user);
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE USER
 */
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.user?.organizationId,
      },
      req.body,
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return ok(res, user, "User updated");
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE USER
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return ok(res, null, "User deleted");
  } catch (err) {
    next(err);
  }
};

/**
 * COUNT USERS
 */
export const countUsers = async (req, res, next) => {
  try {
    const count = await User.countDocuments({
      organizationId: req.user?.organizationId,
    });

    return ok(res, { count });
  } catch (err) {
    next(err);
  }
};

/**
 * TOGGLE ACTIVE STATUS
 */
export const toggleUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      organizationId: req.user?.organizationId,
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    return ok(res, user, "User status updated");
  } catch (err) {
    next(err);
  }
};
