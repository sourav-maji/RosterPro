import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: String,
      enum: ["LOCAL", "GOOGLE", "MICROSOFT"],
      default: "LOCAL",
    },

    identifier: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
    },

    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true },
);

// One identifier per provider must be unique
schema.index({ provider: 1, identifier: 1 }, { unique: true });

export default mongoose.model("AuthAccount", schema);
