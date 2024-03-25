const express = require("express");

const {
  createCourse,
  getAllCourses,
  getCourse,
  deleteCourse,
  updateCourse,
  assgnFaculty,
  getCoursesByFaculty,
  courseAuth,
} = require("../controllers/coureseController");
const { checkRole } = require("../controllers/authController");

const router = express.Router();

//GET all courses
router.get("/", courseAuth, checkRole(["admin"]), getAllCourses);

//GET a single course
router.get("/:id", getCourse);

//get a courses which is asign to a specific faculty
router.get(
  "/allCourses/:facultyId",
  courseAuth,
  checkRole(["admin", "faculty"]),
  getCoursesByFaculty
);

//POST a new course
router.post("/", courseAuth, checkRole(["admin"]), createCourse);

//DELETE a course
router.delete("/:id", courseAuth, checkRole(["admin"]), deleteCourse);

//UPDATE a course
router.patch("/:id", courseAuth, checkRole(["admin"]), updateCourse);

//Assign a faculty to course
router.patch(
  "/:id/assign-faculty",
  courseAuth,
  checkRole(["admin"]),
  assgnFaculty
);

module.exports = router;
