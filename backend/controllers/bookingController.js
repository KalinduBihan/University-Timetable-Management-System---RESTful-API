const Book = require("../models/bookingModel");
const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");

//passport middleware for booking authentication
const bookingAuth = passport.authenticate("jwt", { session: false });

const createBooking = async (req, res) => {
  const { roomId, from, to, day, description } = req.body;
  const { refId } = req.params;
  let emptyFeilds = [];

  //input checking
  if (!roomId) {
    emptyFeilds.push("Please enter a roomId.");
  }
  if (!from) {
    emptyFeilds.push("Please enter a time from.");
  }
  if (!to) {
    emptyFeilds.push("Please enter a time to");
  }
  if (!day) {
    emptyFeilds.push("Please enter a day.");
  }

  if (emptyFeilds.length > 0) {
    return res.status(404).json({ error: "Please fill in missing feilds" });
  }

  const book = await Book.find({ roomId, from, to, day });
  console.log(book);

  if (book.length > 0) {
    return res.status(200).json({
      message: roomId + " is booked from " + from + " to " + to + " on " + day,
    });
  } else {
    try {
      const booking = await Book.create({
        roomId: roomId,
        from: from,
        to: to,
        day: day,
        description: description,
        refId: refId,
      });
      res.status(200).json({ booking });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
};

//get all rooms
const getAllBookings = async (req, res) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 });
    res.status(200).json({ books });
  } catch (error) {
    console.log("Error ouccrs id getAllBookings: ", error.message);
  }
};

//get a single room
const getBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "No such booking." });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ error: "No such booking." });
    }

    res.status(400).json(book);
  } catch (error) {
    console.log("Error ouccrs id getBooking: ", error.message);
  }
};

//delete a room
const deleteBooknig = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "No such booking." });
    }

    const book = await Book.findOneAndDelete({ _id: id });

    if (!book) {
      return res.status(404).json({ error: "No such booking." });
    }

    res.status(400).json(book);
  } catch (error) {
    console.log("Error ouccrs id deleteBooknig: ", error.message);
  }
};

//update booking
const updateBooking = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid booking ID." });
  }

  try {
    const updatedBooking = await Book.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true } // This option returns the updated document
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found." });
    }

    return res.status(200).json({ book: updatedBooking });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

//update bookings when timetable gets updated
const updateTimetableBooking = async (bookId, updatedBook, res) => {
  // console.log(`updateTimetableBooking ${bookId} ${updatedBook.lecture}`);
  try {
    await Book.findByIdAndUpdate(
      { _id: bookId },
      {
        roomId: updatedBook.location,
        from: updatedBook.startTime,
        to: updatedBook.endTime,
        description: updatedBook.lecture,
      }
    );
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
};

//get My bookings
const getMyBooking = async (req, res) => {
  const { id } = req.params;

  const bookings = await Book.find({ refId: id });

  if (bookings.length > 0) {
    return res.status(200).json({ bookings: bookings });
  } else {
    return res.status(401).json({ message: "No bookings." });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBooking,
  deleteBooknig,
  updateBooking,
  getMyBooking,
  updateTimetableBooking,
  bookingAuth,
};
