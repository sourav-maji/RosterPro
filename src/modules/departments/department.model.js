import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,
  },
  { timestamps: true },
);

// unique department name per tenant
schema.index({ organizationId: 1, name: 1 }, { unique: true });

export default mongoose.model("Department", schema);
