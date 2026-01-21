import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    weekStart: {
      type: Date,
      required: true,
    },

    inputPayload: {
      type: Object,
      required: true,
    },

    outputPayload: {
      type: Object,
      required: true,
    },

    status: {
      type: String,
      enum: ["SUCCESS", "PARTIAL", "FAILED"],
      required: true,
    },

    unmetCount: {
      type: Number,
      default: 0,
    },

    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    source: {
      type: String,
      enum: ["ML"],
      default: "ML",
    },
  },
  { timestamps: true },
);

export default mongoose.model("ScheduleRun", schema);
