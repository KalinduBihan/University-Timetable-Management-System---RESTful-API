const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const enrollSchema = new Schema(
  {
    studentId: {
      type: "String",
      required: true,
    },
    courseName: {
      type: "String",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enrolled_Course", enrollSchema);
