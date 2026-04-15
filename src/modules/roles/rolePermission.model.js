import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,   // null = platform-level mapping
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    permissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
    },
  },
  { timestamps: true },
);

schema.index({ roleId: 1, permissionId: 1 }, { unique: true });

export default mongoose.model("RolePermission", schema);
