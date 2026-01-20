import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revoked: {
      type: Boolean,
      default: false,
    },

    ip: String,

    userAgent: String,
  },
  { timestamps: true },
);

schema.index({ token: 1 }, { unique: true });
schema.index({ userId: 1 });

export default mongoose.model("RefreshToken", schema);
