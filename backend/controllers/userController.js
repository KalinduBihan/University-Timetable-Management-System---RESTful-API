const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { SECRET } = require("../config/index");

//check if email is exsist in the database
const validateEmail = async (email) => {
  let user = await User.findOne({ email });
  return user ? false : true;
};

//passport middleware for user authentication
const userAuth = passport.authenticate("jwt", { session: false });

//register a new user (admin, student and faculty roles)
const signup = async (userDetails, role, res) => {
  try {
    //validate email
    let emailUniqe = await validateEmail(userDetails.email);
    if (!emailUniqe) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    //hashing the password
    const hashedPassword = await bcrypt.hash(userDetails.password, 12);

    const user = new User({
      ...userDetails,
      password: hashedPassword,
      role: role,
    });

    await user.save();
    return res
      .status(200)
      .json({ message: "User added successfully.", user: user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

//Login with user email and password
const login = async (userDetails, role, res) => {
  try {
    const { email, password } = userDetails;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found, Invalid login credentials.",
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        message: "Invalid role, login with the correct portal.",
      });
    }

    //check the password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign(
        {
          user_id: user.id,
          email: user.email,
          role: user.role,
        },
        SECRET,
        { expiresIn: "3h" }
      );

      const result = {
        email: user.email,
        role: user.role,
        token: `Bearer ${token}`,
        expiresIn: 3,
      };

      return res
        .status(200)
        .json({ message: "Successfully logged in.", ...result });
    } else {
      return res.status(403).json({
        message: "Invalid password.",
        success: false,
      });
    }
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

//getAllStudents
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" });

    if (!students) {
      return res.status(404).json({ message: "No students found." });
    }

    res.status(200).json({ "students : ": students });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

const serializeUser = (user) => {
  return {
    _id: user._id,
    email: user.email,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
  };
};

module.exports = {
  validateEmail,
  userAuth,
  signup,
  login,
  serializeUser,
  getAllStudents,
};
