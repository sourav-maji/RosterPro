import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null, // null = platform/system permission
    },

    name: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    module: String,

    // NEW FIELDS
    isSystem: {
      type: Boolean,
      default: false,
    },

    scope: {
      type: String,
      enum: ["SYSTEM", "BUSINESS"],
      default: "BUSINESS",
    },
  },
  { timestamps: true },
);

// unique within level
schema.index({ organizationId: 1, code: 1 }, { unique: true });

export default mongoose.model("Permission", schema);
