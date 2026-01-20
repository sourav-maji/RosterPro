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

    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    source: {
      type: String,
      enum: ["ML", "MANUAL"],
      default: "ML",
    },

    status: {
      type: String,
      enum: ["ASSIGNED", "SWAPPED", "LEAVE", "ABSENT"],
      default: "ASSIGNED",
    },

    objectiveScore: Number, // from python result
    notes: String,
  },
  { timestamps: true },
);

// One user → one shift per day
schema.index({ organizationId: 1, userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Allocation", schema);
