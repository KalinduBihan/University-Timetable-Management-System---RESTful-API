const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "student",
      enum: ["student", "admin", "faculty"],
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

module.exports = User;
