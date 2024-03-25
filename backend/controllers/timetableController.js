const passport = require("passport");
const jwt = require("jsonwebtoken");
const Timetable = require("../models/timetableModel");
const Booking = require("../models/bookingModel");
const { notifyMail } = require("../controllers/notificationController");
const { updateTimetableBooking } = require("../controllers/bookingController");
const mongoose = require("mongoose");
const _ = require("lodash");

//passport middleware for timetable authentication
const timetableAuth = passport.authenticate("jwt", { session: false });

// Create a new timetable entry
const createTimetable = async (req, res) => {
  const { code, faculty, day, timeSlots } = req.body;
  let emptyFeilds = [];

  const Day = day;
  const timetable = [code, faculty, day, timeSlots];

  //input fields checkings
  if (!code || !faculty || !day) {
    emptyFeilds.push("Please enter required fields.");
  }

  const existsCheck = await Timetable.find({ code, faculty, day });
  if (!_.isEmpty(existsCheck)) {
    return res.status(200).json({
      message: `Timetable for [${faculty}-${code}-${day}] is already exists.`,
    });
  }

  //Check if the new timetable inputs will overlap.
  const overlaps = await checkOverlaps(timeSlots, day);

  console.log(overlaps);

  //store the overlap records in the response
  const responses = [];
  if (!_.isEmpty(overlaps)) {
    for (const overlap of overlaps) {
      const response = await processOverlap(overlap);
      responses.push(response);
    }
  }

  if (responses.length > 0) {
    return res.status(200).json({ responses: responses });
  } else {
    //store the new timetable record into the database
    try {
      const tt = await Timetable.create(req.body);

      const timetableId = tt._id;
      const timeId = await Timetable.findById(timetableId);
      console.log("TID: ", timeId._id);

      const bookings = [];

      for (const slot of timeSlots) {
        const roomId = slot.location;
        const startTime = slot.startTime;
        const endTime = slot.endTime;
        const day = tt.day;
        const description = slot.lecture;

        // Create a Booking record for each time slot
        const booking = await Booking.create({
          roomId: roomId,
          from: startTime,
          to: endTime,
          day: day,
          description: description,
          refId: timeId._id,
        });

        bookings.push(booking);
      }

      res.status(201).json({ success: true, data: { timetable, bookings } });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};

const getAllTimetable = async (req, res) => {
  try {
    const timetables = await Timetable.find();
    const categorizedTimetables = {};

    // Group timetable records by code and faculty
    timetables.forEach((timetable) => {
      const key = `${timetable.code}-${timetable.faculty}`;
      if (!categorizedTimetables[key]) {
        categorizedTimetables[key] = [];
      }
      categorizedTimetables[key].push(timetable);
    });

    res.status(200).json({ success: true, data: categorizedTimetables });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get timetable entries for a specific day
const getTimetableByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const timetable = await Timetable.find({ day });

    res.status(200).json({ timetable });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// Get timetable entries for a specific code and faculty (full schedule)
const getTimetableByCode = async (req, res) => {
  try {
    const { code, faculty } = req.params;
    const timetable = await Timetable.find({ code, faculty });

    if (_.isEmpty(timetable)) {
      return res.status(200).json({ message: "No timetable." });
    }

    res.status(200).json({ success: true, data: timetable });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

//Notify students about the updated slots
const notifyStudents = async (timeSlotsRecs, updatedBook, details, res) => {
  try {
    const mismatchedIds = [];

    timeSlotsRecs.forEach((slot1) => {
      let matched = false;
      updatedBook.forEach((slot2) => {
        if (
          slot1.startTime === slot2.startTime &&
          slot1.endTime === slot2.endTime &&
          slot1.lecture === slot2.lecture &&
          slot1.location === slot2.location
        ) {
          matched = true;
        }
      });

      if (!matched) {
        mismatchedIds.push(slot1.lecture);
      }
    });

    if (mismatchedIds.length > 0) {
      console.log(
        `${details[2]} - ${details[0]} timetable ${details[1]} ${mismatchedIds} lectures has been updated.`
      );

      const subject = "Timetable update.";
      const message = `${details[2]} - ${details[0]} timetable ${details[1]} ${mismatchedIds} lectures has been updated.`;

      await notifyMail(message, subject);
    }
  } catch (error) {
    console.error("Error in notifyStudents:", error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

//get the updating fields and return the records before updating
const getUpdatingFields = async (timeSlotsRecs, timeSlots) => {
  try {
    const mismatchedIds = [];

    timeSlots.forEach((slot1) => {
      let matched = false;
      timeSlotsRecs.forEach((slot2) => {
        if (
          slot1.startTime === slot2.startTime &&
          slot1.endTime === slot2.endTime &&
          slot1.lecture === slot2.lecture &&
          slot1.location === slot2.location
        ) {
          matched = true;
        }
      });
      if (!matched) {
        mismatchedIds.push(slot1);
      }
    });
    return mismatchedIds;
  } catch (error) {
    console.error("Error in getUpdatingFields: ", error);
    throw error;
  }
};

//checking overlapping slots
const checkOverlaps = async (updatingFields, Day, res) => {
  console.log("Checking", updatingFields);
  const isBooked = [];
  try {
    //get the booking record from the database bookings table
    const bookingRecs = await Booking.find({}).sort({ createdAt: -1 });

    bookingRecs.forEach((slot1) => {
      updatingFields.forEach((slot2) => {
        if (
          slot2.startTime === slot1.from &&
          slot2.endTime === slot1.to &&
          slot2.location === slot1.roomId &&
          slot1.day === Day
        ) {
          isBooked.push(slot1);
        }
      });
    });
    return isBooked;
  } catch (error) {
    console.error("Error in checkOverlaps: ", error);
    throw error;
  }
};

const processOverlap = async (overlap) => {
  const { roomId, from, to, day } = overlap;
  const message = `${roomId} is already booked from ${from} to ${to} on ${day}.`;
  return message;
};

//update timetable and bookings
const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, faculty, day, timeSlots } = req.body;
    const Day = day;
    const details = [code, day, faculty];

    //find the matching timetable record
    const bookSlots = await Timetable.findById(id);

    if (_.isEmpty(bookSlots)) {
      return res.status(404).json({ message: "No timetable record found." });
    }

    //get the timeSlots details from db before updating
    const timeSlotsRecs = bookSlots.timeSlots;

    const updatingFields = await getUpdatingFields(timeSlotsRecs, timeSlots);

    const overlaps = await checkOverlaps(updatingFields, Day);

    // console.log(overlaps);

    //store the overlap records in the response
    const responses = [];
    if (!_.isEmpty(overlaps)) {
      for (const overlap of overlaps) {
        const response = await processOverlap(overlap);
        responses.push(response);
      }
    }

    if (responses.length > 0) {
      return res.status(200).json({ responses: responses });
    } else {
      // Update the timetable table
      const updatedTimetable = await Timetable.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      //get the updated timeSlots details
      const updatedBook = updatedTimetable.timeSlots;

      const bookId = [];

      // Check if the updated fields include code, day, or timeSlots
      const updatedFields = Object.keys(req.body);

      if (
        updatedFields.includes("code") ||
        updatedFields.includes("day") ||
        updatedFields.includes("timeSlots")
      ) {
        for (const updatedSlot of bookSlots.timeSlots) {
          const { startTime, endTime, location, lecture } = updatedSlot;
          // Find the specific booking records for the time slot
          const booking = await Booking.find({
            refId: id,
            from: startTime,
            to: endTime,
          });
          booking.forEach((record) => {
            // console.log(record);
            bookId.push(record._id);
          });
        }

        let i = 0;

        for (const updatedBookItem of updatedBook) {
          await updateTimetableBooking(bookId[i], updatedBookItem);
          i++;
        }
      }

      if (updatingFields.length > 0) {
        await notifyStudents(timeSlotsRecs, updatedBook, details);
      }

      res.status(200).json({ success: true, data: updatedTimetable });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a timetable
const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    //delete from timetable table
    await Timetable.findByIdAndDelete(id);

    ///delete from booking table (all bookings)
    await Booking.deleteMany({ refId: id });

    res
      .status(200)
      .json({ success: true, message: `record ${id} is deleted.` });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "deleteFullTimetable:" + err.message });
  }
};

const deleteFullTimetable = async (req, res) => {
  try {
    const { faculty, code } = req.body;
    const timetableRecs = await Timetable.find({ faculty, code });

    if (_.isEmpty(timetableRecs)) {
      return res
        .status(404)
        .json({ success: false, message: "No such timetable." });
    }

    console.log("timetableRecs: ", timetableRecs);

    const tIds = [];
    timetableRecs.forEach((record) => {
      tIds.push(record._id);
    });

    tIds.forEach(async (record) => {
      // console.log(await Booking.find({ refId: record }));
      await Timetable.findOneAndDelete(record);
      await Booking.deleteMany({ refId: record });
      console.log(`Timetable ${record} deleted.`);
    });

    res.status(200).json({ success: true, timetableRecs: tIds });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "deleteFullTimetable:" + error.message });
  }
};

module.exports = {
  createTimetable,
  getAllTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetableByCode,
  getTimetableByDay,
  deleteFullTimetable,
  timetableAuth,
};
