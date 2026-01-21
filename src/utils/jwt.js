import jwt from "jsonwebtoken";

export const signAccessToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      organizationId: user.organizationId,
      roleId: user.roleId,
      roleCode: user.role?.code || user.roleCode || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

export const signRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
