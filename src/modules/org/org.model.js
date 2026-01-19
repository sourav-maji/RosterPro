import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    contactEmail: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: (props) => `${props.value} is not a valid email!`,
      },
    },

    type: {
      type: String,
      enum: ["HOSPITAL", "FACTORY", "GENERIC"],
      default: "GENERIC",
    },

    address: String,

    phone: {
      type: String,
      validate: {
        validator: (v) => !v || /^\+?\d{7,15}$/.test(v),
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },

    status: {
      type: String,
      enum: ["ONBOARD", "SUSPENDED"],
      default: "ONBOARD",
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// composite unique key
schema.index({ name: 1, contactEmail: 1 }, { unique: true });

// extra indexes
schema.index({ contactEmail: 1 });
schema.index({ status: 1 });

export default mongoose.model("Organization", schema);
