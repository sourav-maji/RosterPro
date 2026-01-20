import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null, // null = platform role
    },

    name: { type: String, required: true },

    code: { type: String, required: true, uppercase: true },

    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// unique within level
schema.index({ organizationId: 1, code: 1 }, { unique: true });

export default mongoose.model("Role", schema);
