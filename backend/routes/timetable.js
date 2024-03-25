const express = require("express");
const {
  createTimetable,
  getAllTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetableByCode,
  getTimetableByDay,
  timetableAuth,
} = require("../controllers/timetableController");
const { checkRole } = require("../controllers/authController");

const router = express.Router();

// Create a new timetable entry
router.post("/", timetableAuth, checkRole(["admin"]), createTimetable);

// Get all timetable entries
router.get("/", timetableAuth, checkRole(["admin"]), getAllTimetable);

// Get timetable recods for a specific code
router.get(
  "/:code/:faculty",
  timetableAuth,
  checkRole(["admin", "faculty", "student"]),
  getTimetableByCode
);

// Get all timetable entries for a specific day
router.get("/:day", getTimetableByDay);

// Update a timetable entry
router.patch("/:id", timetableAuth, checkRole(["admin"]), updateTimetable);

// Delete a timetable entry
router.delete("/:id", timetableAuth, checkRole(["admin"]), deleteTimetable);

module.exports = router;
