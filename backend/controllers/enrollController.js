const { response } = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const enrollModel = require("../models/enrollModel");
const Course = require("../models/courseModel");
const mongoose = require("mongoose");
const _ = require("lodash");

//passport middleware for enrolling authentication
const enrollAuth = passport.authenticate("jwt", { session: false });

//enrolling to a course
const enrollCourse = async (req, res) => {
  const { studentId, courseName } = req.body;

  //input validation
  if (!studentId || !courseName) {
    return res.status(404).json({ error: "Please fill in all feilds" });
  }

  // add to Enrolled_Courses table
  try {
    // Check if the student is already enrolled in the course
    const enrolled = await enrollModel.find({ courseName, studentId });

    if (!_.isEmpty(enrolled)) {
      return res.status(200).json({ message: "Already enrolled." });
    }

    const course = await Course.find({ name: courseName });
    if (!course) {
      return res
        .status(200)
        .json({ message: "Invalid course name or course does not exsist." });
    }

    const enrolledCourse = await enrollModel.create({
      studentId,
      courseName,
    });
    console.log(studentId + " enrolled to " + courseName + " successfully.");
    res.status(200).json({ enrolledCourse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get enrolled courses
const getEnrollCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(studentId);

    const enrolledCourses = await enrollModel
      .find({ studentId })
      .sort({ createdAt: -1 });

    if (enrolledCourses.length > 0) {
      return res.status(200).json(enrolledCourses);
    } else {
      return res.status(401).json({ message: "No enrolled courses." });
    }
  } catch (error) {
    console.log("Error ouccrs in getEnrollCourses: " + error.message);
  }
};

const enrolledList = async (req, res) => {
  try {
    const { courseName } = req.body;
    const enrolledStudents = await enrollModel.find({ courseName });

    if (enrolledStudents.length > 0) {
      const studentIds = enrolledStudents.map(
        (enrollment) => enrollment.studentId
      );
      return res.status(200).json(studentIds);
    } else {
      return res.status(401).json({ message: "No enrolled students." });
    }
  } catch (error) {
    console.log("Error ouccrs in enrolledList: " + error.message);
  }
};

module.exports = {
  enrollCourse,
  getEnrollCourses,
  enrolledList,
  enrollAuth,
};
