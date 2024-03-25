const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    roomId: {
      type: "String",
      required: true,
    },
    from: {
      type: "String",
      required: true,
    },
    to: {
      type: "String",
      required: true,
    },
    day: {
      type: "String",
      required: true,
    },
    description: {
      type: "String",
    },
    refId: {
      type: "String",
      // required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("booking", bookingSchema);
