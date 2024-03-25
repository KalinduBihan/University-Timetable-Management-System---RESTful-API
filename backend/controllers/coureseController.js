const passport = require("passport");
const jwt = require("jsonwebtoken");
const Course = require("../models/courseModel");
const mongoose = require("mongoose");

//passport middleware for course authentication
const courseAuth = passport.authenticate("jwt", { session: false });

//create a course
const createCourse = async (req, res) => {
  const { name, courseCode, description, credits, facultyId } = req.body;
  let emptyFeilds = [];

  if (!name) {
    emptyFeilds.push("Please enter a name.");
  }
  if (!courseCode) {
    emptyFeilds.push("Please enter a courseCode.");
  }
  if (!description) {
    emptyFeilds.push("Please enter a description.");
  }
  if (!credits) {
    emptyFeilds.push("Please enter a credits.");
  }
  if (emptyFeilds.length > 0) {
    return res.status(404).json({ error: "Please fill in missing feilds" });
  }

  //add to the database
  try {
    const course = await Course.create({
      name,
      courseCode,
      description,
      credits,
      facultyId,
    });
    res.status(200).json({ course });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get all courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    console.log("Error ouccred in getAllCourses: " + error.message);
  }
};

//get a single course
const getCourse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such course" });
  }

  const course = await Course.findById(id);

  if (!course) {
    return res.status(404).json({ error: "No such course" });
  }

  res.status(200).json(course);
};

//get a courses which is asign to a specific faculty
const getCoursesByFaculty = async (req, res) => {
  const { facultyId } = req.params;

  const course = await Course.find({ facultyId });

  if (!course) {
    return res.status(404).json({ error: "No such courses" });
  }

  res.status(200).json(course);
};

//delete a course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "No such course" });
    }

    const course = await Course.findOneAndDelete({ _id: id });

    if (!course) {
      return res.status(404).json({ error: "No such course" });
    }

    res.status(200).json(course);
  } catch (error) {
    console.log("Error ouccred in deleteCourse: " + error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

//update a course
const updateCourse = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such course" });
  }

  const course = await Course.findOneAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!course) {
    return res.status(404).json({ error: "No such course" });
  }

  res
    .status(200)
    .json({ message: `${course.name} course updated successfully` });
};

//assign a course to a faculty
const assgnFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "No such course" });
    }

    const course = await Course.findOneAndUpdate(
      { _id: id },
      {
        ...req.body,
      }
    );

    if (!course) {
      return res.status(404).json({ error: "No such course" });
    }

    await res.status(200).json({
      message: `${course.name} - ${course.courseCode} is assigned.`,
    });
  } catch (error) {
    console.log("Error ouccred in assgnFaculty: " + error.message);
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  deleteCourse,
  updateCourse,
  assgnFaculty,
  getCoursesByFaculty,
  courseAuth,
};
