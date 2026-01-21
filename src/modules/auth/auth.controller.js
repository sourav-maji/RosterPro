import bcrypt from "bcryptjs";

import AuthAccount from "./authAccount.model.js";
import RefreshToken from "./refreshToken.model.js";
import User from "../users/user.model.js";

import ApiError from "../../utils/ApiError.js";
import { ok } from "../../utils/response.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../../utils/jwt.js";
import RolePermission from "../roles/rolePermission.model.js";

/* -------------------------------------------------------
   LOGIN
------------------------------------------------------- */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const account = await AuthAccount.findOne({
      identifier: email.toLowerCase(),
      provider: "LOCAL",
    });

    if (!account) {
      throw new ApiError("Invalid credentials", 401);
    }

    const match = await bcrypt.compare(password, account.passwordHash);

    if (!match) {
      throw new ApiError("Invalid credentials", 401);
    }

    const user = await User.findById(account.userId).populate("roleId");

    if (!user) {
      throw new ApiError("User not found", 401);
    }

    account.lastLogin = new Date();
    await account.save();

    // normalize
    user.role = user.roleId;
    user.roleCode = user.roleId?.code;

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return ok(res, { accessToken, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------
   ME
------------------------------------------------------- */
export const me = async (req, res, next) => {
  try {
    return ok(res, req.user);
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------
   REGISTER LOCAL CREDENTIAL
------------------------------------------------------- */
export const registerLocal = async (req, res, next) => {
  try {
    const { userId, email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new ApiError("User not found", 404);

    const exists = await AuthAccount.findOne({
      identifier: email.toLowerCase(),
      provider: "LOCAL",
    });

    if (exists) throw new ApiError("Credential already exists", 400);

    const hash = await bcrypt.hash(password, 10);

    const account = await AuthAccount.create({
      userId,
      identifier: email.toLowerCase(),
      passwordHash: hash,
      provider: "LOCAL",
    });

    return ok(res, account, "Credential created");
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------
   CHANGE PASSWORD (SELF)
------------------------------------------------------- */
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const account = await AuthAccount.findOne({
      userId: req.user._id,
      provider: "LOCAL",
    });

    if (!account) throw new ApiError("Account not found", 404);

    const match = await bcrypt.compare(oldPassword, account.passwordHash);

    if (!match) throw new ApiError("Old password incorrect", 400);

    account.passwordHash = await bcrypt.hash(newPassword, 10);
    await account.save();

    return ok(res, null, "Password changed");
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------
   ADMIN RESET PASSWORD
------------------------------------------------------- */
export const resetPassword = async (req, res, next) => {
  try {
    const { userId, newPassword } = req.body;

    const account = await AuthAccount.findOne({
      userId,
      provider: "LOCAL",
    });

    if (!account) throw new ApiError("Account not found", 404);

    account.passwordHash = await bcrypt.hash(newPassword, 10);
    await account.save();

    return ok(res, null, "Password reset");
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------
   REFRESH TOKEN
------------------------------------------------------- */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) throw new ApiError("Refresh token required", 400);

    const stored = await RefreshToken.findOne({
      token: refreshToken,
      revoked: false,
    });

    if (!stored) throw new ApiError("Invalid refresh token", 401);

    if (stored.expiresAt < new Date())
      throw new ApiError("Refresh token expired", 401);

    const decoded = verifyToken(refreshToken);

    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError("User not found", 401);

    // rotate
    stored.revoked = true;
    await stored.save();

    const newRefresh = signRefreshToken(user);

    await RefreshToken.create({
      userId: user._id,
      token: newRefresh,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = signAccessToken(user);

    return ok(res, { accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------
   LOGOUT
------------------------------------------------------- */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await RefreshToken.updateOne({ token: refreshToken }, { revoked: true });

    return ok(res, null, "Logged out");
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------
   LOGOUT ALL
------------------------------------------------------- */
export const logoutAll = async (req, res, next) => {
  try {
    await RefreshToken.updateMany({ userId: req.user._id }, { revoked: true });

    return ok(res, null, "All sessions cleared");
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------
   LIST ACCOUNTS OF USER
------------------------------------------------------- */
export const listAccounts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const accounts = await AuthAccount.find({ userId });

    return ok(res, accounts);
  } catch (err) {
    next(err);
  }
};

/* -------------------------------------------------------
   DELETE ACCOUNT
------------------------------------------------------- */
export const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const acc = await AuthAccount.findByIdAndDelete(id);

    if (!acc) throw new ApiError("Account not found", 404);

    return ok(res, null, "Account removed");
  } catch (err) {
    next(err);
  }
};

export const myPermissions = async (req, res, next) => {
  try {
    const maps = await RolePermission.find({
      roleId: req.user.roleId,
    }).populate("permissionId");

    const codes = maps.map((m) => m.permissionId.code);

    return ok(res, { permissions: codes });
  } catch (err) {
    next(err);
  }
};
