require("dotenv").config();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bp = require("body-parser");
const nodemailer = require("nodemailer");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const _ = require("lodash");

//passport middleware for timetable authentication
const notificationAuth = passport.authenticate("jwt", { session: false });

// Create a new notification
const createNotification = async (req, res) => {
  const { recipient, faculty, message } = req.body;

  if (_.isEmpty(recipient)) {
    return res.status(404).json({ message: "Fill the recipient field." });
  }
  if (!faculty) {
    return res.status(404).json({ message: "Fill the faculty field." });
  }
  if (!message) {
    return res.status(404).json({ message: "Fill the message field." });
  }

  try {
    const notification = await Notification.create({
      recipient,
      faculty,
      message,
    });

    //Inform the user about the new notification
    const subject = `Faculty notice - ${faculty}`;
    await notifyMail(message, subject);

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getAllNotices = async (req, res) => {
  try {
    const notice = await Notification.find().sort({ createdAt: -1 });
    return res.json({ notice: notice });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const { code, faculty } = req.params;
    const notifications = await Notification.find({
      recipient: code,
      faculty: faculty,
    });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

//Notify students when timetable changes
const notifyMail = async (message, subject, res) => {
  try {
    const students = await User.find({ role: "student" });
    const email = [];

    students.forEach((student) => {
      email.push(student.email);
    });
    console.log(`students: ${email}`);

    //create reusable transport object
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.CORDINATOR,
        pass: process.env.APP_PASSWORD,
      },
    });

    //create notification (mail credentials and message)
    const mailOptions = {
      from: {
        name: "Academic Cordinator",
        address: process.env.CORDINATOR,
      }, // sender address
      to: `${email}`, // list of receivers
      subject: `${subject}`, // Subject line
      text: `${message}`, // plain text body
    };

    await sendMail(transporter, mailOptions);
  } catch (error) {
    console.log("Error in notifyMail: " + error.message);
  }
};

//sending the email
const sendMail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  getAllNotices,
  notifyMail,
  notificationAuth,
};
