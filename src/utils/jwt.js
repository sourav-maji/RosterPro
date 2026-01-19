import jwt from "jsonwebtoken";

export const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      organizationId: user.organizationId,
      roleId: user.roleId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );
};
