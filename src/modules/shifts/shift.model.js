import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String, // "08:00"
      required: true,
    },

    endTime: {
      type: String, // "16:00"
      required: true,
    },

    durationHours: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["NORMAL", "NIGHT", "OVERTIME"],
      default: "NORMAL",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// unique per tenant + department
schema.index({ organizationId: 1, departmentId: 1, name: 1 }, { unique: true });

export default mongoose.model("Shift", schema);
