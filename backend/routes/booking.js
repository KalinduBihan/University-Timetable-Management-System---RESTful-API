const express = require("express");

const {
  createBooking,
  getAllBookings,
  getBooking,
  deleteBooknig,
  updateBooking,
  getMyBooking,
  bookingAuth,
} = require("../controllers/bookingController");
const { checkRole } = require("../controllers/authController");

const router = express.Router();

//get all bookings
router.get("/", bookingAuth, checkRole(["admin"]), getAllBookings);

router.get("/:id", bookingAuth, checkRole(["admin", "student"]), getBooking);

//create a new booking
router.post("/:refId", bookingAuth, checkRole(["student"]), createBooking);

//delete a booking
router.delete("/:id", deleteBooknig);

//update a booking
router.patch("/:id", bookingAuth, checkRole(["student"]), updateBooking);

//get my bookings
router.get("/myBooking/:id", bookingAuth, checkRole(["student"]), getMyBooking);

module.exports = router;
