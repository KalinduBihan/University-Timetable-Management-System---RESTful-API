const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  code: {
    type: "String",
    required: true,
  },
  faculty: {
    type: "String",
    required: true,
  },
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  timeSlots: [
    {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      lecture: { type: String, required: true },
      location: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("timetable", timetableSchema);
