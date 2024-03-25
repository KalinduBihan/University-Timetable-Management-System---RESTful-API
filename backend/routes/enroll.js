const express = require("express");
const router = express.Router();
const { checkRole } = require("../controllers/authController");

const {
  enrollCourse,
  getEnrollCourses,
  enrolledList,
  enrollAuth,
} = require("../controllers/enrollController");

//enroll into a coures
router.post("/", enrollAuth, checkRole(["student"]), enrollCourse);

router.get("/:studentId", enrollAuth, checkRole(["student"]), getEnrollCourses);

router.get("/", enrollAuth, checkRole(["admin", "faculty"]), enrolledList);

module.exports = router;
